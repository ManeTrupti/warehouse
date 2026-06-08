from decimal import Decimal
import logging

from rest_framework.exceptions import APIException

from core.services.inventory_service import InventoryService
from core.services.mdm_service import MDMService

logger = logging.getLogger(__name__)


def get_location_field(transfer_type):
    mapping = {
        "STORE_TO_STORE": "store_id",
        "WAREHOUSE_TO_WAREHOUSE": "warehouse_id",
        "LOCATION_TO_LOCATION": "location_id",
        "PLANT_TO_LOCATION": "location_id",
        "LOCATION_TO_PLANT": "location_id",
        "PLANT_TO_PLANT": "plant"
    }
    return mapping.get(transfer_type, "sub_inventory")


def update_inventory(
        product_code,
        plant,
        quantity,
        sub_inventory,
        transaction_type="IN",
        transfer_type=None,
        reference=None,
        inventory_type=None
):
    try:

        if isinstance(quantity, Decimal):
            quantity = float(quantity)

        print("\n========== INVENTORY SERVICE ==========")
        print("Product:", product_code)
        print("Plant:", plant)
        print("Qty:", quantity)
        print("Sub_inventory:", sub_inventory)


        location_field = get_location_field(transfer_type)

        # :TODO: P1: as per logic, if product_code, plant, sub_inventory is not exist in the inventory-stock table then, create new else update.
        params = {
            "product_code": product_code,
            "plant": plant, # comment out because inward is not going to create for specific plant and sub_inventory :P1
            location_field: sub_inventory
        }
        mdm_query_params = {
            "code": product_code

        }
        # MDM call
        mdm_response = MDMService.get("/mdm/products/", params=mdm_query_params)
        if isinstance(mdm_response, dict) and mdm_response.get("success") is False:
            raise ValueError({
                "message": "MDM API returned client error",
                "product_code": product_code,
                "mdm_status_code": mdm_response.get("status_code"),
                "mdm_error_response": mdm_response.get("response"),
                "mdm_request_url": mdm_response.get("url")
            })

        response = InventoryService.get("/inventory-stock/",params=params)
        if isinstance(response, dict) and response.get("success") is False:
            raise ValueError({
                "message": "Inventory API returned client error",
                "product_code": product_code,
                "inventory_status_code": response.get("status_code"),
                "inventory_error_response": response.get("response"),
                "inventory_request_url": response.get("url")
            })

        if isinstance(mdm_response, dict):
            mdm_data = mdm_response.get("data") or mdm_response.get("results") or []
        elif isinstance(mdm_response, list):
            mdm_data = mdm_response
        else:
            mdm_data = []

        mdm_status_code = (
            mdm_response.get("status_code")
            if isinstance(mdm_response, dict) and "status_code" in mdm_response
            else (MDMService.STATUS_CODE or 200)
        )

        if not mdm_data:
            logger.warning(
                "Product not found in MDM response. product_code=%s mdm_response_type=%s mdm_response=%s",
                product_code,
                type(mdm_response).__name__,
                mdm_response
            )
            raise ValueError({
                "message": "Product not found",
                "product_code": product_code,
                "mdm_status_code": mdm_status_code,
                "mdm_response": mdm_response
            })

        product_id = mdm_data[0].get("id")
        stock = response[0] if response else None

        # ================= UPDATE =================
        if stock:
            stock_id = stock["id"]
            current_qty = float(stock.get("quantity", 0))

            new_qty = current_qty + quantity if transaction_type == "IN" else current_qty - quantity

            payload = {"quantity": new_qty, "inventory_type":inventory_type}

            print("UPDATE PAYLOAD:", payload)
            return InventoryService.patch(f"/inventory-stock/{stock_id}/",payload=payload)

        # ================= CREATE =================
        else:
            payload = {
                "product_code": product_code,
                "product_id": product_id,
                "plant": plant,
                "quantity": quantity if transaction_type == "IN" else 0,
                "scrap_quantity": 0,
                location_field: sub_inventory,
                "inventory_type":inventory_type
            }

            print("CREATE PAYLOAD:", payload)
            InventoryService.post("/inventory-stock/",payload=payload)

    except Exception as e:
        print("\nInventory Service Error:", str(e))
        raise