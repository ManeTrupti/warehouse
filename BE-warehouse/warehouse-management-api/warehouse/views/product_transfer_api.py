from rest_framework import status
from rest_framework.response import Response
from core.services.mdm_service import MDMService
from core.views.base import BaseConfigAPIView, logger
from warehouse.models.product_transfer import ProductTransfer
from warehouse.models.putaway_models import Allocation
from warehouse.serializers.product_transfer_serializer import ProductTransferSerializer
from warehouse.services.product_transfer_services import update_product_inventory
from core.services.inventory_service import InventoryService
from django.db import transaction
from rest_framework.exceptions import ValidationError


class ProductTransferAPIView(BaseConfigAPIView):
    model = ProductTransfer
    serializer_class = ProductTransferSerializer
    filterfields = ProductTransfer.get_filter_fields()
    search_fields = ("transfer_id",)

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.order_by("-updated_on")
    
    @transaction.atomic
    def post(self, request, *args, **kwargs):
        try:
            serializer = self.serializer_class(data=request.data)

            if serializer.is_valid():
                data = serializer.validated_data

                product_code = data.get("product_code")
                qty = data.get("quantity")
                transfer_type = data.get("transfer_type")
                from_location = data.get("from_location")

                if transfer_type == "SubInventory to SubInventory":
                    data = InventoryService.get(
                        endpoint="/inventory-stock/",
                        params={
                            "product_code": product_code,
                            "sub_inventory": from_location
                        }
                    )
                    print("data", data)
                    available_qty = data[0].get("quantity", 0) if data else 0

                elif transfer_type == "Plant to Plant":
                    data = InventoryService.get(
                        endpoint="/inventory-stock/",
                        params={
                            "product_code": product_code,
                            "plant": from_location
                        }
                    )
                    print("data", data)
                    available_qty = data[0].get("quantity", 0) if data else 0

                elif transfer_type in ["Zone to Zone", "Aisle to Aisle", "Bin to Bin", "Rack to Rack"]:
                    available_qty = Allocation.objects.filter(
                        product_code=product_code,
                        **{self._get_field_name(transfer_type): from_location},
                        id=request.data.get("allocation_id"),
                    ).values_list("allocated_qty", flat=True).first() or 0

                else:
                    available_qty = 0

                if available_qty < qty:
                    raise ValidationError({
                        "quantity": f"Insufficient stock. Available: {available_qty}, Requested: {qty}"
                    })

                obj = serializer.save()

                if obj.transfer_type == "SubInventory to SubInventory":

                    # FROM SUB INVENTORY REDUCE
                    update_product_inventory(
                        product_code=obj.product_code,
                        plant="Plant 1",
                        quantity=obj.quantity,
                        sub_inventory=obj.from_location,
                        transaction_type="OUT",
                        inventory_type="product_transfer"
                    )

                    update_product_inventory(
                        product_code=obj.product_code,
                        plant="Plant 1",
                        quantity=obj.quantity,
                        sub_inventory=obj.to_location,
                        transaction_type="IN",
                        inventory_type="product_transfer",
                    )

                elif obj.transfer_type == "Plant to Plant":

                    update_product_inventory(
                        product_code=obj.product_code,
                        plant=obj.from_location,
                        quantity=obj.quantity,
                        sub_inventory=None,
                        transaction_type="OUT",
                        inventory_type="product_transfer"
                    )

                    update_product_inventory(
                        product_code=obj.product_code,
                        plant=obj.to_location,
                        quantity=obj.quantity,
                        sub_inventory=None,
                        transaction_type="IN",
                        inventory_type="product_transfer"
                    )

                elif obj.transfer_type == "Zone to Zone":

                    with transaction.atomic():
                        to_aisle = request.data.get("aisle_code")
                        to_rack = request.data.get("rack_code")
                        to_bin = request.data.get("bin_code")

                        source_obj = Allocation.objects.filter(
                            product_code=obj.product_code,
                            zone_code=obj.from_location
                        ).first()
                        if not source_obj:
                            raise ValidationError("Source location not found")

                        if source_obj.allocated_qty < obj.quantity:
                            raise ValidationError("Insufficient quantity in source location")

                        source_obj.allocated_qty -= obj.quantity
                        source_obj.save()
                        dest_obj = Allocation.objects.filter(
                            product_code=obj.product_code,
                            zone_code=obj.to_location,
                            aisle_code=to_aisle,
                            rack_code=to_rack,
                            bin_code=to_bin
                        ).first()
                        if dest_obj:
                            dest_obj.allocated_qty += obj.quantity
                            dest_obj.save()
                        else:
                            mdm_response = MDMService.get(
                                "/warehouse/zones/",
                                params={"zone_code": obj.to_location, "is_active": True}
                            )
                            print("MDM RESPONSE:", mdm_response)
                            sub_inventory = None
                            mdm_response = mdm_response.get("data", [])
                            if mdm_response:
                                sub_inventory = mdm_response[0].get("subinventory_code_display")

                            if not sub_inventory:
                                raise ValidationError(
                                    f"Sub inventory not found for zone {obj.to_location}"
                                )
                            Allocation.objects.create(
                                product_code=obj.product_code,
                                zone_code=obj.to_location,
                                aisle_code=to_aisle,
                                rack_code=to_rack,
                                bin_code=to_bin,
                                sub_inventory=sub_inventory,
                                allocated_qty=obj.quantity,
                                unallocated_qty=0
                            )


                elif obj.transfer_type == "Aisle to Aisle":

                    with transaction.atomic():
                        to_rack = request.data.get("rack_code")
                        to_bin = request.data.get("bin_code")
                        source_obj = Allocation.objects.filter(
                            product_code=obj.product_code,
                            aisle_code=obj.from_location
                        ).first()
                        if not source_obj:
                            raise ValidationError("Source aisle not found")

                        if source_obj.allocated_qty < obj.quantity:
                            raise ValidationError("Insufficient quantity")

                        source_obj.allocated_qty -= obj.quantity
                        source_obj.save()

                        aisle_response = MDMService.get(
                            "/warehouse/aisles/",
                            params={"aisle_code": obj.to_location}

                        )

                        aisle_response = aisle_response.get("data", [])
                        if not aisle_response:
                            raise ValidationError({"message": "Zone code not found"})
                        zone_code = aisle_response[0].get("zone_code_display")

                        print("ZONE FROM AISLE:", zone_code)
                        zone_response = MDMService.get(
                            "/warehouse/zones/",
                            params={"zone_code": zone_code}
                        )
                        print("ZONE API RESPONSE:", zone_response)
                        zone_response = zone_response.get("data", [])
                        if not zone_response:
                            raise ValidationError({"message": "Zone code not found"})

                        sub_inventory = zone_response[0].get("subinventory_code_display")
                        print("FINAL SUB INVENTORY:", sub_inventory)

                        dest_obj = Allocation.objects.filter(
                            product_code=obj.product_code,
                            aisle_code=obj.to_location,
                            rack_code=to_rack,
                            bin_code=to_bin
                        ).first()
                        if dest_obj:
                            dest_obj.allocated_qty += obj.quantity
                            dest_obj.save()
                        else:
                            Allocation.objects.create(
                                product_code=obj.product_code,
                                zone_code=zone_code,
                                aisle_code=obj.to_location,
                                rack_code=to_rack,
                                bin_code=to_bin,
                                sub_inventory=sub_inventory,
                                allocated_qty=obj.quantity,
                                unallocated_qty=0
                            )



                elif obj.transfer_type == "Rack to Rack":

                    with transaction.atomic():
                        to_bin = request.data.get("bin_code")
                        source_obj = Allocation.objects.filter(
                            product_code=obj.product_code,
                            rack_code=obj.from_location
                        ).first()

                        if not source_obj:
                            raise ValidationError("Source rack not found")

                        if source_obj.allocated_qty < obj.quantity:
                            raise ValidationError("Insufficient quantity")

                        source_obj.allocated_qty -= obj.quantity
                        source_obj.save()

                        rack_response = MDMService.get(
                            "/warehouse/racks/",
                            params={"rack_code": obj.to_location}
                        )

                        rack_response = rack_response.get("data", [])
                        if not rack_response:
                            raise ValidationError({"message": "Rack not found in MDM"})

                        aisle_code = rack_response[0].get("aisle_code_display")

                        aisle_response = MDMService.get(
                            "/warehouse/aisles/",
                            params={"aisle_code": aisle_code}
                        )

                        aisle_response = aisle_response.get("data", [])
                        if not aisle_response:
                            raise ValidationError({"message": "Aisle not found"})

                        zone_code = aisle_response[0].get("zone_code_display")

                        zone_response = MDMService.get(
                            "/warehouse/zones/",
                            params={"zone_code": zone_code}
                        )

                        zone_response = zone_response.get("data", [])
                        if not zone_response:
                            raise ValidationError({"message": "Zone not found"})

                        sub_inventory = zone_response[0].get("subinventory_code_display")

                        dest_obj = Allocation.objects.filter(
                            product_code=obj.product_code,
                            rack_code=obj.to_location,
                            bin_code=to_bin
                        ).first()
                        if dest_obj:
                            dest_obj.allocated_qty += obj.quantity
                            dest_obj.save()
                        else:
                            Allocation.objects.create(
                                product_code=obj.product_code,
                                zone_code=zone_code,
                                aisle_code=aisle_code,
                                rack_code=obj.to_location,
                                bin_code=to_bin,
                                sub_inventory=sub_inventory,
                                allocated_qty=obj.quantity,
                                unallocated_qty=0
                            )


                elif obj.transfer_type == "Bin to Bin":
                    with transaction.atomic():
                        source_obj = Allocation.objects.filter(
                            product_code=obj.product_code,
                            bin_code=obj.from_location
                        ).first()
                        if not source_obj:
                            raise ValidationError("Source bin not found")

                        if source_obj.allocated_qty < obj.quantity:
                            raise ValidationError(
                                f"Insufficient stock. Available: {source_obj.allocated_qty}, Requested: {obj.quantity}"
                            )

                        source_obj.allocated_qty -= obj.quantity
                        source_obj.save()

                        bin_response = MDMService.get(
                            "/warehouse/bins/",
                            params={"bin_code": obj.to_location}
                        )

                        print("BIN MDM RESPONSE:", bin_response)

                        bin_response = bin_response.get("data", [])
                        if not bin_response:
                            raise ValidationError({"message": "Bin not found"})
                        rack_code = bin_response[0].get("rack_code_display")

                        rack_response = MDMService.get(
                            "/warehouse/racks/",
                            params={"rack_code": rack_code}
                        )
                        rack_response = rack_response.get("data", [])
                        if not rack_response:
                            raise ValidationError({"message": "rack does not found."})

                        aisle_code = rack_response[0].get("aisle_code_display")

                        aisle_response = MDMService.get(
                            "/warehouse/aisles/",
                            params={"aisle_code": aisle_code}
                        )
                        aisle_response = aisle_response.get("data", [])
                        if not aisle_response:
                            raise ValidationError({""})

                        zone_code = aisle_response[0].get("zone_code_display")

                        zone_response = MDMService.get(
                            "/warehouse/zones/",
                            params={"zone_code": zone_code}
                        )
                        zone_response = zone_response.get("data", [])
                        if not zone_response:
                            raise
                        sub_inventory = zone_response[0].get("subinventory_code_display")

                        dest_obj = Allocation.objects.filter(
                            product_code=obj.product_code,
                            bin_code=obj.to_location,
                            rack_code=rack_code,
                            aisle_code=aisle_code,
                            sub_inventory=sub_inventory
                        ).first()

                        if dest_obj:
                            dest_obj.allocated_qty += obj.quantity
                            dest_obj.save()
                        else:
                            Allocation.objects.create(
                                product_code=obj.product_code,
                                zone_code=zone_code,
                                aisle_code=aisle_code,
                                rack_code=rack_code,
                                bin_code=obj.to_location,
                                sub_inventory=sub_inventory,
                                allocated_qty=obj.quantity,
                                unallocated_qty=0
                            )

                return Response(
                    serializer.data,
                    status=status.HTTP_201_CREATED
                )

        except Exception as e:
            logger.exception("Transfer create failed")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


    def _get_field_name(self, transfer_type):
        mapping = {
            "Zone to Zone": "zone_code",
            "Aisle to Aisle": "aisle_code",
            "Bin to Bin": "bin_code",
            "Rack to Rack": "rack_code",
        }
        return mapping.get(transfer_type)
