from core.services.mdm_service import MDMService


def extract_data(response):
    # Handle DRF Response
    if hasattr(response, "data"):
        response = response.data

    # Handle {"data": [...]}
    if isinstance(response, dict) and "data" in response:
        return response["data"]

    # Handle list directly
    if isinstance(response, list):
        return response

    return []


def normalize(value):
    if isinstance(value, str):
        return value.strip().upper()
    return value


class MDMValidationService:

    # ------------------ PLANT ------------------
    @staticmethod
    def validate_plant(plant_code):
        plant_code = normalize(plant_code)

        plants = extract_data(MDMService.get("/warehouse/plants/"))

        for p in plants:
            if not isinstance(p, dict):
                continue

            if normalize(p.get("plant_code")) == plant_code:
                return

        raise Exception(f"Invalid plant_code {plant_code}")

    # ------------------ LOCATION ------------------
    @staticmethod
    def validate_location(location_code):
        location_code = normalize(location_code)

        locations = extract_data(MDMService.get("/warehouse/locations/"))

        for l in locations:
            if not isinstance(l, dict):
                continue

            code = l.get("code") or l.get("location_code")

            if normalize(code) == location_code:
                return

        raise Exception(f"Invalid location_code {location_code}")

    # ------------------ PRODUCT ------------------
    @staticmethod
    def validate_product(product_code):
        product_code = normalize(product_code)

        products = extract_data(MDMService.get("/warehouse/products/"))

        for p in products:
            if not isinstance(p, dict):
                continue

            if normalize(p.get("product_code")) == product_code:
                return

        raise Exception(f"Invalid product_code {product_code}")

    # ================== NEW VALIDATIONS ==================

    # ------------------ STORE ------------------
    @staticmethod
    def validate_store(store_code):
        store_code = normalize(store_code)

        stores = extract_data(MDMService.get("/warehouse/stores/"))

        for s in stores:
            if not isinstance(s, dict):
                continue

            if normalize(s.get("store_code")) == store_code:
                return

        raise Exception(f"Invalid store_code {store_code}")

    # ------------------ SUBINVENTORY ------------------
    @staticmethod
    def validate_subinventory(subinventory_code):
        subinventory_code = normalize(subinventory_code)

        subinventories = extract_data(MDMService.get("/warehouse/subinventories/"))

        for s in subinventories:
            if not isinstance(s, dict):
                continue

            if normalize(s.get("subinventory_code")) == subinventory_code:
                return

        raise Exception(f"Invalid subinventory_code {subinventory_code}")

    # ------------------ ZONE ------------------
    @staticmethod
    def validate_zone(zone_code):
        zone_code = normalize(zone_code)

        zones = extract_data(MDMService.get("/warehouse/zones/"))

        for z in zones:
            if not isinstance(z, dict):
                continue

            if normalize(z.get("zone_code")) == zone_code:
                return

        raise Exception(f"Invalid zone_code {zone_code}")

    # ------------------ SUBZONE ------------------
    @staticmethod
    def validate_subzone(subzone_code):
        subzone_code = normalize(subzone_code)

        subzones = extract_data(MDMService.get("/warehouse/subzones/"))

        for s in subzones:
            if not isinstance(s, dict):
                continue

            if normalize(s.get("subzone_code")) == subzone_code:
                return

        raise Exception(f"Invalid subzone_code {subzone_code}")

    # ------------------ STORAGE TYPE ------------------
    @staticmethod
    def validate_storage_type(storage_type_code):
        storage_type_code = normalize(storage_type_code)

        storage_types = extract_data(MDMService.get("/warehouse/storage-types/"))

        for s in storage_types:
            if not isinstance(s, dict):
                continue

            if normalize(s.get("storage_type_code")) == storage_type_code:
                return

        raise Exception(f"Invalid storage_type_code {storage_type_code}")