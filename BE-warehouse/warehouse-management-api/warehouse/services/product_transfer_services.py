

from decimal import Decimal

from core.services.inventory_service import InventoryService
from core.services.mdm_service import MDMService


def update_product_inventory(
        product_code,
        plant=None,
        quantity=0,
        sub_inventory=None,
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


        params = {
            "product_code": product_code,
            # "plant": plant,
            "sub_inventory": sub_inventory
        }


        mdm_response = MDMService.get(
            "/mdm/products/",
            params={"code": product_code}
        )

        mdm_data = mdm_response.get("data", [])

        if not mdm_data:
            raise Exception("Product not found")

        product_id = mdm_data[0]["id"]
        product_name = mdm_data[0]["name"]


        response = InventoryService.get(
            "/inventory-stock/",
            params=params
        )


        rows = response if isinstance(response, list) else response.get("results", [])

        stock = None

        # ===============================
        # FIND SAME SUB INVENTORY
        # ===============================
        for item in rows:
            if str(item.get("sub_inventory", "")).upper().strip() == str(sub_inventory).upper().strip():
                stock = item
                break

        # ===============================
        # UPDATE EXISTING
        # ===============================
        if stock:
            stock_id = stock["id"]
            current_qty = float(stock.get("quantity", 0))

            if transaction_type == "IN":
                new_qty = current_qty + quantity
            else:
                new_qty = current_qty - quantity

            if new_qty < 0:
                new_qty = 0

            payload = {
                "quantity": new_qty,
                "inventory_type" : inventory_type
            }

            print("UPDATE PAYLOAD:", payload)

            return InventoryService.patch(
                f"/inventory-stock/{stock_id}/",
                payload=payload
            )

        # ===============================
        # CREATE NEW RECORD
        # ===============================
        else:
            payload = {
                "product_code": product_code,
                "product_name": product_name,
                "product_id": product_id,
                "plant": plant,
                "sub_inventory": sub_inventory,
                "quantity": quantity if transaction_type == "IN" else 0,
                "scrap_quantity": 0,
                "inventory_type" : inventory_type
            }

            print("CREATE PAYLOAD:", payload)

            return InventoryService.post(
                "/inventory-stock/",
                payload=payload
            )

    except Exception as e:
        print("Inventory Service Error:", str(e))
        raise