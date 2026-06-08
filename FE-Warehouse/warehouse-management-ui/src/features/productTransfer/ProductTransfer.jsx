import React, { useCallback, useEffect, useState } from "react";
import {
  Plus,
  AlertTriangle,
  AlertCircle,
  ClipboardCheck,
  ListChecks,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchLocationCodeList,
  fetchPlantsList,
  fetchSubInventoriesList,
  fetchSubZonesList,
  fetchZonesList,
  fetchAislesList,
  fetchBinsList,
  fetchRacksList,
} from "@core/store/slices/MDM/mdmSlice";
import {
  clearError,
  createProductTransfer,
  fetchProductTransferList,
  fetchProductTransferTypeList,
  fetchWarehouseInventoryStockProducts,
} from "@core/store/slices/ProductTransfer/productTransferSlice";
import {
  fetchRackAllocationData,
  fetchRackAllocationStatus,
} from "@core/store/slices/RackAllocation/rackAllocationSlice";
import { CommonButton } from "@shared/components/CommonButton";
import CommonDataGrid from "@shared/components/CommonDataGrid";
import { CommonModal } from "@shared/components/CommonModal";
import SearchableInputDropdown from "@shared/components/SearchableInputDropdown/SearchableInputDropdown";
import { useToast } from "@shared/hooks/useToast";
import { ToastContainer } from "@shared/components/Toast";
/*
  import { createProductTransfer } from "@core/store/slices/ProductTransfer/productTransferSlice";
*/

const TRANSFER_TYPE_OPTIONS = [
  {
    value: "SUBINVENTORY_TO_SUBINVENTORY",
    label: "SubInventory to SubInventory",
  },
  // {
  //   value: "STORE_TO_SUBINVENTORY",
  //   label: "Store to Subinventory",
  // },
  // {
  //   value: "SUBINVENTORY_TO_STORE",
  //   label: "Subinventory to Store",
  // },
  // {
  //   value: "STORE_TO_STORE",
  //   label: "Store to Store",
  // },
  // {
  //   value: "LOCATION_TO_LOCATION",
  //   label: "Location to Location",
  // },
  // {
  //   value: "PLANT_TO_LOCATION",
  //   label: "Plant to Location",
  // },
  // {
  //   value: "LOCATION_TO_PLANT",
  //   label: "Location to Plant",
  // },
  // {
  //   value: "PLANT_TO_PLANT",
  //   label: "Plant to Plant",
  // },
  {
    value: "ZONE_TO_ZONE",
    label: "Zone to Zone",
  },
  // {
  //   value: "ZONE_TO_SUBINVENTORY",
  //   label: "Zone to Subinventory",
  // },
  // {
  //   value: "SUBINVENTORY_TO_ZONE",
  //   label: "Subinventory to Zone",
  // },
  // {
  //   value: "ZONE_TO_SUBINVENTORY",
  //   label: "Zone to Subinventory",
  // },
  {
    value: "AISLE_TO_AISLE",
    label: "Aisle to Aisle",
  },
  {
    value: "RACK_TO_RACK",
    label: "Rack to Rack",
  },
  {
    value: "BIN_TO_BIN",
    label: "Bin to Bin",
  },
];
const TRANSFER_MODE_OPTIONS = [
  { value: "INTERNAL_TRANSFER", label: "Internal Transfer" },
  { value: "EXTERNAL_TRANSFER", label: "External Transfer" },
];
const FIELD_LABELS = {
  from_subinventory: "From Sub Inventory",
  to_subinventory: "To Sub Inventory",
  from_zone: "From Zone",
  to_zone: "To Zone",
  from_location: "From Location",
  to_location: "To Location",
  from_plant: "From Plant",
  to_plant: "To Plant",
  from_aisle: "From Aisle",
  to_aisle: "To Aisle",
  from_store: "From Store",
  to_store: "To Store",
  from_bin: "From Bin",
  to_bin: "To Bin",
  from_rack: "From Rack",
  to_rack: "To Rack",
};
const TRANSFER_LOCATION_FIELDS = [
  "from_subinventory",
  "to_subinventory",
  "from_zone",
  "to_zone",
  "from_location",
  "to_location",
  "from_plant",
  "to_plant",
  "from_aisle",
  "to_aisle",
  "from_store",
  "to_store",
  "from_bin",
  "to_bin",
  "from_rack",
  "to_rack",
];

const getTodayDateValue = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const EMPTY_FORM = {
  from_plant: "",
  to_plant: "",
  from_store: "",
  to_store: "",
  transfer_date: getTodayDateValue(),
  transfer_type: "",
  transfer_mode: "",
  products: "",
  quantity: "",
  available_quantity: "",
  reason: "",
  to_location: "",
  from_location: "",
  from_subinventory: "",
  to_subinventory: "",
  from_zone: "",
  to_zone: "",
  from_aisle: "",
  to_aisle: "",
  from_bin: "",
  to_bin: "",
  from_rack: "",
  to_rack: "",
  // reference_number: "",
};

const METRIC_TONE = {
  primary: {
    border: "border-l-sky-400",
    icon: "text-sky-500",
    badge: "bg-sky-100",
  },
  warning: {
    border: "border-l-amber-400",
    icon: "text-amber-500",
    badge: "bg-amber-100",
  },
  success: {
    border: "border-l-emerald-400",
    icon: "text-emerald-500",
    badge: "bg-emerald-100",
  },
  violet: {
    border: "border-l-violet-400",
    icon: "text-violet-500",
    badge: "bg-violet-100",
  },
  danger: {
    border: "border-l-rose-400",
    icon: "text-rose-500",
    badge: "bg-rose-100",
  },
};

const MetricCard = ({ title, value, tone = "primary", icon: Icon = ListChecks }) => {
  const toneStyles = METRIC_TONE[tone] || METRIC_TONE.primary;
  return (
    <article
      className={`rounded-xl border border-slate-200 border-l-4 bg-white px-4 py-3 shadow-sm ${toneStyles.border}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {title}
          </p>
          <p className="mt-1 text-3xl font-semibold leading-none text-slate-800">
            {value}
          </p>
        </div>
        <div className={`rounded-full p-1.5 ${toneStyles.badge}`}>
          <Icon className={`h-3.5 w-3.5 ${toneStyles.icon}`} />
        </div>
      </div>
    </article>
  );
};

const TRANSFER_FIELD_MAP = {
  SUBINVENTORY_TO_SUBINVENTORY: {
    from: ["from_subinventory"],
    to: ["to_subinventory"],
  },
  // STORE_TO_SUBINVENTORY: {
  //   from: ["from_store"],
  //   to: ["to_subinventory"],
  // },
  // SUBINVENTORY_TO_STORE: {
  //   from: ["from_subinventory"],
  //   to: ["to_store"],
  // },
  // STORE_TO_STORE: {
  //   from: ["from_store"],
  //   to: ["to_store"],
  // },
  // LOCATION_TO_LOCATION: {
  //   from: ["from_location"],
  //   to: ["to_location"],
  // },
  // PLANT_TO_LOCATION: {
  //   from: ["from_plant"],
  //   to: ["to_location"],
  // },
  // LOCATION_TO_PLANT: {
  //   from: ["from_location"],
  //   to: ["to_plant"],
  // },
  // PLANT_TO_PLANT: {
  //   from: ["from_plant"],
  //   to: ["to_plant"],
  // },
  ZONE_TO_ZONE: {
    from: ["from_zone"],
    to: ["to_zone"],
  },
  AISLE_TO_AISLE: {
    from: ["from_aisle"],
    to: ["to_aisle"],
  },
  BIN_TO_BIN: {
    from: ["from_bin"],
    to: ["to_bin"],
  },
  RACK_TO_RACK: {
    from: ["from_rack"],
    to: ["to_rack"],
  },
  SUBINVENTORY_TO_ZONE: {
    from: ["from_subinventory"],
    to: ["to_zone"],
  },
  ZONE_TO_SUBINVENTORY: {
    from: ["from_zone"],
    to: ["to_subinventory"],
  },
};

const ProductTransfer = () => {
  const dispatch = useDispatch();
  const {
    plantList,
    locationList,
    subInventoriesList,
    zoneList,
    aisleList,
    binList,
    rackList,
  } = useSelector((state) => state.mdm);

  const {
    productTransferList,
    error,
    transferTypeList,
    inventoryStockProducts,
    loading,
    transferTypeLoading,
    submitLoading,
    pagination,
  } = useSelector((state) => state.productTransfer);
  const { rackAllocationList, rackAllocationStatusList } = useSelector(
    (state) => state.rackAllocation,
  );
  console.log("inventoryStockProducts", inventoryStockProducts);
  const { toasts, showError, showSuccess, removeToast } = useToast();

  const dropdownData = transferTypeList?.fields || {};

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [productSearchText, setProductSearchText] = useState("");
  const [selectedAllocationKey, setSelectedAllocationKey] = useState("");
  const [selectedAllocationId, setSelectedAllocationId] = useState(null);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const handleCloseForm = () => {
    setFormData({ ...EMPTY_FORM });
    setErrors({});
    setSubmitting(false);
    setProductSearchText("");
    setSelectedAllocationKey("");
    setSelectedAllocationId(null);
    setShowForm(false);
  };
  const visibleFields = TRANSFER_FIELD_MAP[formData.transfer_type] || {};
  const primaryFromField = visibleFields?.from?.[0] || "";
  const primaryToField = visibleFields?.to?.[0] || "";
  /** Extra TO dropdowns (MDM aisle / rack / bin) after the primary To field, by primary type. */
  const getToHierarchyChain = () => {
    if (primaryToField === "to_zone") return ["to_aisle", "to_rack", "to_bin"];
    if (primaryToField === "to_aisle") return ["to_rack", "to_bin"];
    if (primaryToField === "to_rack") return ["to_bin"];
    return [];
  };
  const secondaryToChain = getToHierarchyChain();
  const mdmFieldOptionsMap = {
    from_subinventory: subInventoriesList || [],
    to_subinventory: subInventoriesList || [],
    from_zone: zoneList || [],
    to_zone: zoneList || [],
    from_location: locationList || [],
    to_location: locationList || [],
    from_plant: plantList || [],
    to_plant: plantList || [],
    from_aisle: aisleList || [],
    to_aisle: aisleList || [],
    from_bin: binList || [],
    to_bin: binList || [],
    from_rack: rackList || [],
    to_rack: rackList || [],
  };
  const normalizeOptionsArray = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.data)) return value.data;
    if (Array.isArray(value?.results)) return value.results;
    return [];
  };
  const getOptionsForField = (fieldKey) => {
    const dropdownOptions = normalizeOptionsArray(dropdownData?.[fieldKey]);
    if (dropdownOptions.length > 0) return dropdownOptions;
    return normalizeOptionsArray(mdmFieldOptionsMap[fieldKey]);
  };
  const getOptionValue = (fieldKey, option) => {
    if (fieldKey?.includes("subinventory")) return option.subinventory_code;
    if (fieldKey?.includes("zone")) return option.zone_code;
    if (fieldKey?.includes("location")) return option.code;
    if (fieldKey?.includes("plant")) return option.plant_code;
    if (fieldKey?.includes("aisle")) return option.aisle_code;
    if (fieldKey?.includes("bin")) return option.bin_code;
    if (fieldKey?.includes("rack")) return option.rack_code;
    if (fieldKey?.includes("store")) return option.store_code;
    return option.code || option.value || option.id || "";
  };
  const getOptionLabel = (fieldKey, option) => {
    if (fieldKey?.includes("subinventory")) {
      return `${option.subinventory_name} (${option.subinventory_code})`;
    }
    if (fieldKey?.includes("zone"))
      return `${option.zone_name} (${option.zone_code})`;
    if (fieldKey?.includes("location"))
      return `${option.name} (${option.code})`;
    if (fieldKey?.includes("plant"))
      return `${option.plant_name} (${option.plant_code})`;
    if (fieldKey?.includes("aisle"))
      return `${option.aisle_name} (${option.aisle_code})`;
    if (fieldKey?.includes("bin"))
      return `${option.bin_name} (${option.bin_code})`;
    if (fieldKey?.includes("rack"))
      return `${option.rack_name} (${option.rack_code})`;
    if (fieldKey?.includes("store"))
      return `${option.store_name} (${option.store_code})`;
    return option.label || option.name || option.code || option.id;
  };
  const optionZoneCode = (opt) =>
    String(opt?.zone_code ?? opt?.zone ?? "").trim();
  const optionAisleCode = (opt) =>
    String(opt?.aisle_code ?? opt?.aisle ?? "").trim();
  const optionRackCode = (opt) =>
    String(opt?.rack_code ?? opt?.rack ?? "").trim();
  const codesEqual = (a, b) =>
    String(a ?? "").trim() !== "" &&
    String(a ?? "").trim() === String(b ?? "").trim();
  /** MDM-only lists for To hierarchy (aisle / rack / bin). */
  const getMdmBaseListForSecondaryField = (fieldKey) => {
    if (fieldKey === "to_aisle") return normalizeOptionsArray(aisleList);
    if (fieldKey === "to_rack") return normalizeOptionsArray(rackList);
    if (fieldKey === "to_bin") return normalizeOptionsArray(binList);
    return [];
  };
  const getFilteredToSecondaryOptions = (fieldKey) => {
    const base = getMdmBaseListForSecondaryField(fieldKey);
    if (base.length === 0) return base;
    const zoneCode = String(formData.to_zone ?? "").trim();
    const aisleCtx = String(formData.to_aisle ?? "").trim();
    const rackCtx = String(formData.to_rack ?? "").trim();

    let filtered = base;
    if (fieldKey === "to_aisle" && primaryToField === "to_zone" && zoneCode) {
      filtered = base.filter(
        (o) => !optionZoneCode(o) || codesEqual(optionZoneCode(o), zoneCode),
      );
    }
    if (fieldKey === "to_rack") {
      if (primaryToField === "to_zone" && zoneCode) {
        filtered = filtered.filter(
          (o) => !optionZoneCode(o) || codesEqual(optionZoneCode(o), zoneCode),
        );
      }
      if (
        (primaryToField === "to_zone" || primaryToField === "to_aisle") &&
        aisleCtx
      ) {
        filtered = filtered.filter(
          (o) =>
            !optionAisleCode(o) || codesEqual(optionAisleCode(o), aisleCtx),
        );
      }
    }
    if (fieldKey === "to_bin" && rackCtx) {
      filtered = filtered.filter(
        (o) => !optionRackCode(o) || codesEqual(optionRackCode(o), rackCtx),
      );
    }
    return filtered.length > 0 ? filtered : base;
  };
  const clearDescendantToHierarchyValues = (chain, changedField) => {
    const idx = chain.indexOf(changedField);
    if (idx < 0) return {};
    return chain.slice(idx + 1).reduce((acc, k) => ({ ...acc, [k]: "" }), {});
  };
  const clearAllToHierarchyValues = () => ({
    to_aisle: "",
    to_rack: "",
    to_bin: "",
  });
  const isToSecondarySelectDisabled = (fieldKey) => {
    const chain = getToHierarchyChain();
    const idx = chain.indexOf(fieldKey);
    if (idx <= 0) {
      if (primaryToField === "to_zone") return !formData.to_zone;
      if (primaryToField === "to_aisle") return !formData.to_aisle;
      if (primaryToField === "to_rack") return !formData.to_rack;
      return true;
    }
    const prevKey = chain[idx - 1];
    return !formData[prevKey];
  };
  const getTransferTypeLabelByValue = (value) =>
    TRANSFER_TYPE_OPTIONS.find((option) => option.value === value)?.label || "";
  const getTransferTypeValueByLabel = (label) =>
    TRANSFER_TYPE_OPTIONS.find((option) => option.label === label)?.value || "";
  const getTransferModeLabelByValue = (value) =>
    TRANSFER_MODE_OPTIONS.find((option) => option.value === value)?.label || "";
  const getTransferModeValueByLabel = (label) =>
    TRANSFER_MODE_OPTIONS.find((option) => option.label === label)?.value || "";
  const transferModeOptionsForType = formData.transfer_type?.includes(
    "SUBINVENTORY",
  )
    ? TRANSFER_MODE_OPTIONS.filter(
        (option) => option.value !== "INTERNAL_TRANSFER",
      )
    : TRANSFER_MODE_OPTIONS;
  const clearTransferFieldErrors = (prevErrors) => {
    const nextErrors = { ...prevErrors };
    [
      "transfer_type",
      "transfer_mode",
      "products",
      "quantity",
      "allocation_selection",
      ...TRANSFER_LOCATION_FIELDS,
    ].forEach((field) => {
      delete nextErrors[field];
    });
    return nextErrors;
  };

  const metrics = {
    total: 12,
    pending: 4,
    issued: 6,
    rejected: 1,
    overdue: 1,
  };

  /* ---------------- HELPERS ---------------- */

  const sanitizeQuantityInput = (value) => value.replace(/[^0-9.]/g, "");

  const rackAllocationRows = Array.isArray(rackAllocationList)
    ? rackAllocationList
    : rackAllocationList?.results || rackAllocationList?.data || [];

  const shouldUseRackAllocationProducts =
    formData.transfer_type === "SUBINVENTORY_TO_SUBINVENTORY";
  const productsDropdownOptions = shouldUseRackAllocationProducts
    ? Array.from(
        new Set(
          (Array.isArray(inventoryStockProducts)
            ? inventoryStockProducts
            : inventoryStockProducts?.results ||
              inventoryStockProducts?.data ||
              []
          )
            .map((row) =>
              String(
                row?.product_code ?? row?.item_code ?? row?.code ?? "",
              ).trim(),
            )
            .filter(Boolean),
        ),
      )
    : Array.from(
        new Set(
          rackAllocationRows
            .map((row) => String(row?.product_code ?? "").trim())
            .filter(Boolean),
        ),
      );

  const normalizeAllocationStatusRows = (list) => {
    if (Array.isArray(list)) return list;
    if (Array.isArray(list?.data)) return list.data;
    if (Array.isArray(list?.results)) return list.results;
    return [];
  };
  const allocationStatusRows = normalizeAllocationStatusRows(
    rackAllocationStatusList,
  );
  const selectedProductAllocations = rackAllocationRows.filter(
    (row) =>
      String(row?.product_code ?? "").trim() ===
      String(formData.products ?? "").trim(),
  );
  const usesAllocationStatusForQty = (transferType) =>
    transferType?.includes("SUBINVENTORY") || transferType?.includes("PLANT");
  const shouldUseAllocationStatusForAvailableQty = usesAllocationStatusForQty(
    formData.transfer_type,
  );

  useEffect(() => {
    if (!formData.products) return;
    if (shouldUseAllocationStatusForAvailableQty) return;
    if (!primaryFromField) return;
    if (selectedAllocationKey) return;
    if (!selectedProductAllocations.length) return;

    const firstAllocation = selectedProductAllocations[0];
    const allocationKey = getAllocationRowStableKey(firstAllocation);
    const nextFromValue = getPreferredFromValueForRow(
      primaryFromField,
      firstAllocation,
    );

    setSelectedAllocationKey(allocationKey);
    setSelectedAllocationId(firstAllocation?.id ?? null);

    setFormData((prev) => {
      if (!primaryFromField || !nextFromValue) return prev;
      if (String(prev?.[primaryFromField] ?? "").trim()) return prev;
      return { ...prev, [primaryFromField]: nextFromValue };
    });

    setErrors((prev) => ({
      ...prev,
      allocation_selection: undefined,
      [primaryFromField]: undefined,
      quantity: undefined,
    }));
  }, [
    formData.products,
    primaryFromField,
    selectedAllocationKey,
    selectedProductAllocations,
    shouldUseAllocationStatusForAvailableQty,
  ]);
  const normalizeOptionMatchValue = (value) =>
    String(value ?? "")
      .trim()
      .toLowerCase();
  const getRowCandidatesForFromField = (fieldKey, row) => {
    if (fieldKey?.includes("subinventory")) {
      return [
        row?.sub_inventory,
        row?.subinventory,
        row?.sub_inventory_code,
        row?.subinventory_code,
        row?.sub_inventory_name,
      ];
    }
    if (fieldKey?.includes("zone")) return [row?.zone_code];
    if (fieldKey?.includes("aisle")) return [row?.aisle_code];
    if (fieldKey?.includes("bin")) return [row?.bin_code];
    if (fieldKey?.includes("rack")) return [row?.rack_code];
    if (fieldKey?.includes("plant")) return [row?.plant_code, row?.plant];
    if (fieldKey?.includes("location"))
      return [row?.location_code, row?.location];
    if (fieldKey?.includes("store")) return [row?.store_code, row?.store];
    return [];
  };
  const getPreferredFromValueForRow = (fieldKey, row) =>
    getRowCandidatesForFromField(fieldKey, row).find(
      (candidate) => String(candidate ?? "").trim() !== "",
    ) || "";
  const getAllocationRowKey = (row, index = 0) => {
    const baseKey =
      row?.id ||
      `${row?.product_code || ""}-${row?.zone_code || row?.zone_name || row?.zone || ""}-${row?.aisle_code || ""}-${row?.rack_code || ""}-${row?.bin_code || ""}`;
    return `${baseKey}-${index}`;
  };
  const getAllocationRowStableKey = (row) =>
    row?.id ||
    `${row?.product_code || ""}-${row?.zone_code || row?.zone_name || row?.zone || ""}-${row?.aisle_code || ""}-${row?.rack_code || ""}-${row?.bin_code || ""}`;
  const getMatchedSourceRows = (fd = formData) => {
    const primaryFrom = TRANSFER_FIELD_MAP[fd.transfer_type]?.from?.[0] || "";
    const useAllocationStatus = usesAllocationStatusForQty(fd.transfer_type);
    const productTrim = String(fd.products ?? "").trim();

    if (!productTrim || !primaryFrom) return [];
    const selectedFromValue = fd[primaryFrom];
    if (!selectedFromValue) return [];

    const normalizedSelectedFrom = normalizeOptionMatchValue(selectedFromValue);
    const sourceRows = useAllocationStatus
      ? allocationStatusRows.filter(
          (row) => String(row?.product_code ?? "").trim() === productTrim,
        )
      : rackAllocationRows.filter(
          (row) => String(row?.product_code ?? "").trim() === productTrim,
        );
    if (sourceRows.length === 0) return [];

    const matchedRows = sourceRows.filter((row) => {
      const candidates = getRowCandidatesForFromField(primaryFrom, row)
        .map(normalizeOptionMatchValue)
        .filter(Boolean);
      return candidates.includes(normalizedSelectedFrom);
    });
    if (matchedRows.length === 0) return [];

    const exactRawMatchedRows = matchedRows.filter((row) =>
      getRowCandidatesForFromField(primaryFrom, row).some(
        (candidate) =>
          normalizeOptionMatchValue(candidate) === normalizedSelectedFrom,
      ),
    );
    return exactRawMatchedRows.length > 0 ? exactRawMatchedRows : matchedRows;
  };
  const getAllocationStatusAvailableNumber = (row) => {
    return Number(row?.quantity) || 0;
  };
  const isSubinventoryToSubinventoryTransfer = (transferType) =>
    transferType === "SUBINVENTORY_TO_SUBINVENTORY";
  const getAllocationStatusQtyOptionLabel = (row, index) => {
    const plant = row?.plant ?? "—";
    const status = row?.status ?? "—";
    const avail = getAllocationStatusAvailableNumber(row);
    const totalQty = Number(row?.quantity);
    const alloc = Number(row?.allocated_qty);
    const parts = [
      `${index + 1}`,
      plant,
      status,
      `Avail ${Number.isFinite(avail) ? avail : "—"}`,
      `Total ${Number.isFinite(totalQty) ? totalQty : "—"}`,
    ];
    if (Number.isFinite(alloc)) parts.push(`Allocated ${alloc}`);
    return parts.join(" · ");
  };
  const getMatchedAvailableQuantity = (fd = formData) => {
    const useAllocationStatus = usesAllocationStatusForQty(fd.transfer_type);
    const candidateRows = getMatchedSourceRows(fd);
    if (candidateRows.length === 0) return "";

    const selectedRow = candidateRows.find(
      (row) => getAllocationRowStableKey(row) === selectedAllocationKey,
    );

    if (selectedRow) {
      const qtyValue = useAllocationStatus
        ? getAllocationStatusAvailableNumber(selectedRow)
        : Number(selectedRow?.allocated_qty) || 0;
      return String(qtyValue);
    }

    // Subinventory ↔ subinventory: multiple allocation-status lines — pick one (no sum).
    if (
      useAllocationStatus &&
      isSubinventoryToSubinventoryTransfer(fd.transfer_type) &&
      candidateRows.length > 1
    ) {
      return "";
    }

    // Plant / other allocation-status flows: aggregate when no keyed rack selection applies.
    if (useAllocationStatus) {
      const total = candidateRows.reduce(
        (sum, row) => sum + getAllocationStatusAvailableNumber(row),
        0,
      );
      return String(total);
    }

    if (candidateRows.length === 1) {
      return String(Number(candidateRows[0]?.allocated_qty) || 0);
    }
    return "";
  };

  const matchedRowsSubinventoryQtyPicker =
    isSubinventoryToSubinventoryTransfer(formData.transfer_type) &&
    shouldUseAllocationStatusForAvailableQty
      ? getMatchedSourceRows()
      : [];
  const showSubinventoryAllocationQtyPicker =
    matchedRowsSubinventoryQtyPicker.length > 1;
  const getFilteredFromOptions = (fieldKey) => {
    const baseOptions = getOptionsForField(fieldKey);
    if (!fieldKey || !formData.products) return baseOptions;
    if (shouldUseAllocationStatusForAvailableQty) return baseOptions;

    const sourceRows = shouldUseAllocationStatusForAvailableQty
      ? allocationStatusRows.filter(
          (row) =>
            String(row?.product_code ?? "").trim() ===
            String(formData.products ?? "").trim(),
        )
      : selectedProductAllocations;
    if (sourceRows.length === 0) return [];

    // For aisle-to-aisle flow, From options must come from allocation rows only.
    if (fieldKey?.includes("aisle")) {
      const uniqueAisleCodes = Array.from(
        new Set(sourceRows.map((row) => row?.aisle_code).filter(Boolean)),
      );
      return uniqueAisleCodes.map((code) => ({
        id: code,
        aisle_code: code,
        aisle_name: code,
      }));
    }

    const availableValues = new Set(
      sourceRows
        .flatMap((row) => getRowCandidatesForFromField(fieldKey, row))
        .map(normalizeOptionMatchValue)
        .filter(Boolean),
    );

    return baseOptions.filter((option) => {
      const optionValue = normalizeOptionMatchValue(
        getOptionValue(fieldKey, option),
      );
      if (availableValues.has(optionValue)) return true;
      if (fieldKey?.includes("plant")) {
        const optionPlantName = normalizeOptionMatchValue(option?.plant_name);
        return optionPlantName && availableValues.has(optionPlantName);
      }
      return false;
    });
  };
  const getSubinventoryFromOptionsFromAllocationStatus = () => {
    const mdmSubinventoryOptions = normalizeOptionsArray(subInventoriesList);
    const productTrim = String(formData.products ?? "").trim();

    const statusRows = allocationStatusRows.filter((row) => {
      const statusSub = normalizeOptionMatchValue(row?.sub_inventory);
      if (!statusSub) return false;
      if (!productTrim) return true;
      return String(row?.product_code ?? "").trim() === productTrim;
    });

    const allowedSubinventoryCodes = new Set(
      statusRows
        .map((row) => normalizeOptionMatchValue(row?.sub_inventory))
        .filter(Boolean),
    );

    return mdmSubinventoryOptions.filter((option) => {
      const code = normalizeOptionMatchValue(option?.subinventory_code);
      const name = normalizeOptionMatchValue(option?.subinventory_name);
      return (
        allowedSubinventoryCodes.has(code) || allowedSubinventoryCodes.has(name)
      );
    });
  };
  const shouldUseAllocationStatusForFromSubinventoryOptions =
    formData.transfer_type === "SUBINVENTORY_TO_SUBINVENTORY" &&
    primaryFromField?.includes("subinventory");

  const buildSubinventoryFromOptionsFromInventoryStock = () => {
    const productTrim = String(formData.products ?? "").trim();
    if (!productTrim) return [];

    const stockRows = Array.isArray(inventoryStockProducts)
      ? inventoryStockProducts
      : inventoryStockProducts?.results || inventoryStockProducts?.data || [];

    const getRowProductCode = (row) =>
      String(row?.product_code ?? row?.item_code ?? row?.code ?? "").trim();
    const getRowSubCode = (row) =>
      String(
        row?.subinventory_code ??
          row?.sub_inventory_code ??
          row?.sub_inventory ??
          row?.subinventory ??
          "",
      ).trim();
    const getRowSubName = (row) =>
      String(
        row?.subinventory_name ??
          row?.sub_inventory_name ??
          row?.sub_inventory ??
          row?.subinventory ??
          "",
      ).trim();

    const seen = new Set();
    const options = [];
    stockRows.forEach((row) => {
      if (getRowProductCode(row) !== productTrim) return;
      const code = getRowSubCode(row);
      if (!code || seen.has(code)) return;
      seen.add(code);
      options.push({
        subinventory_code: code,
        subinventory_name: getRowSubName(row) || code,
      });
    });
    return options;
  };

  const buildFromOptionsFromAllocations = (fieldKey) => {
    const productTrim = String(formData.products ?? "").trim();
    if (!productTrim) return [];
    const rowsForProduct = rackAllocationRows.filter(
      (row) => String(row?.product_code ?? "").trim() === productTrim,
    );

    const getCodeForField = (row) => {
      if (fieldKey?.includes("zone")) return row?.zone_code || row?.zone;
      if (fieldKey?.includes("aisle")) return row?.aisle_code || row?.aisle;
      if (fieldKey?.includes("rack")) return row?.rack_code || row?.rack;
      if (fieldKey?.includes("bin")) return row?.bin_code || row?.bin;
      return "";
    };

    const getNameForField = (row, code) => {
      if (fieldKey?.includes("zone")) return row?.zone_name || code;
      if (fieldKey?.includes("aisle")) return row?.aisle_name || code;
      if (fieldKey?.includes("rack")) return row?.rack_name || code;
      if (fieldKey?.includes("bin")) return row?.bin_name || code;
      return code;
    };

    const seen = new Set();
    const options = [];
    rowsForProduct.forEach((row) => {
      const code = String(getCodeForField(row) ?? "").trim();
      if (!code || seen.has(code)) return;
      seen.add(code);
      const name = getNameForField(row, code);

      if (fieldKey?.includes("zone"))
        options.push({ zone_code: code, zone_name: name });
      else if (fieldKey?.includes("aisle"))
        options.push({ aisle_code: code, aisle_name: name });
      else if (fieldKey?.includes("rack"))
        options.push({ rack_code: code, rack_name: name });
      else if (fieldKey?.includes("bin"))
        options.push({ bin_code: code, bin_name: name });
    });

    return options;
  };

  const shouldUseAllocationRowsForFromOptions = [
    "from_zone",
    "from_aisle",
    "from_rack",
    "from_bin",
  ].includes(primaryFromField);

  const getFromSelectOptions = () => {
    if (primaryFromField === "from_subinventory" && formData.products) {
      const fromStock = buildSubinventoryFromOptionsFromInventoryStock();
      if (fromStock.length > 0) return fromStock;
    }
    if (shouldUseAllocationStatusForFromSubinventoryOptions) {
      return getSubinventoryFromOptionsFromAllocationStatus();
    }
    if (shouldUseAllocationRowsForFromOptions) {
      const allocationOptions =
        buildFromOptionsFromAllocations(primaryFromField);
      if (allocationOptions.length > 0) return allocationOptions;
    }
    return getFilteredFromOptions(primaryFromField);
  };

  const getEffectiveAvailableQuantity = useCallback(() => {
    const inventoryQty = Number(inventoryStockProducts?.[0]?.quantity);
    const canUseInventoryQty =
      isSubinventoryToSubinventoryTransfer(formData.transfer_type) &&
      String(formData.from_subinventory ?? "").trim() &&
      Number.isFinite(inventoryQty);
    if (canUseInventoryQty) return inventoryQty;

    const fallback = Number(formData.available_quantity);
    return Number.isFinite(fallback) ? fallback : 0;
  }, [
    formData.available_quantity,
    formData.from_subinventory,
    formData.transfer_type,
    inventoryStockProducts,
  ]);

  const getLabelForDropdownValue = (fieldKey, rawValue, optionRows) => {
    const v = String(rawValue ?? "");
    if (!fieldKey || !v) return "";
    const match = (optionRows || []).find(
      (row) => String(getOptionValue(fieldKey, row) ?? "") === v,
    );
    return match ? getOptionLabel(fieldKey, match) : v;
  };

  const getValueForDropdownLabel = (fieldKey, rawLabel, optionRows) => {
    const label = String(rawLabel ?? "");
    if (!fieldKey || !label) return "";
    const match = (optionRows || []).find(
      (row) => String(getOptionLabel(fieldKey, row) ?? "") === label,
    );
    return match ? getOptionValue(fieldKey, match) : "";
  };

  useEffect(() => {
    const enteredQty = Number(formData.quantity);
    if (!formData.quantity || !Number.isFinite(enteredQty)) return;

    const availableQty = getEffectiveAvailableQuantity();
    const shouldError = enteredQty > availableQty;

    setErrors((prev) => ({
      ...prev,
      quantity: shouldError
        ? "Quantity cannot be greater than available quantity"
        : undefined,
    }));
  }, [formData.quantity, getEffectiveAvailableQuantity]);



  useEffect(() => {
    if (!showForm) return;
    if (formData.transfer_type === "SUBINVENTORY_TO_SUBINVENTORY") {
      const productCode = String(formData.products ?? "").trim();
      const subInventory = String(formData.from_subinventory ?? "").trim();

      dispatch(
        fetchWarehouseInventoryStockProducts({
          page_size: "all",
          search: "",
          product_code: productCode,
          sub_inventory: subInventory || undefined,
        }),
      );
    }

    if (
      formData.products &&
      formData.transfer_type === "SUBINVENTORY_TO_SUBINVENTORY"
    ) {
      dispatch(fetchSubInventoriesList({ search: "" }));
    }
    if (
      formData.transfer_type != "SUBINVENTORY_TO_SUBINVENTORY" &&
      formData.products
    ) {
      dispatch(fetchZonesList({ search: "" }));
      dispatch(fetchAislesList({ page_size: "all" }));
      dispatch(fetchRacksList({ page_size: "all" }));
      dispatch(fetchBinsList({ page_size: "all" }));
    }

    if (
      formData.transfer_type &&
      formData.transfer_type !== "SUBINVENTORY_TO_SUBINVENTORY"
    ) {
      dispatch(
        fetchRackAllocationData(
          formData.products
            ? { product_code: formData.products, page_size: "all" }
            : { page_size: "all" },
        ),
      );
    }
    if (
      formData.products &&
      formData.transfer_type != "SUBINVENTORY_TO_SUBINVENTORY" &&
      formData[primaryFromField] !== "from_subinventory"
    ) {
      dispatch(
        fetchRackAllocationStatus({
          page_size: "all",
          product_code: formData.products,
        }),
      );
    }
  }, [
    dispatch,
    formData.products,
    formData.transfer_type,
    formData.from_subinventory,
    primaryFromField,
    showForm,
  ]);

  // useEffect(() => {
  //   if (!showForm) return;
  //   if (primaryFromField !== "from_subinventory") return;
  //   const productCode = String(formData.products ?? "").trim();
  //   if (!productCode) return;
  //   dispatch(
  //     fetchWarehouseInventoryStockProducts({
  //       page_size: "all",
  //       search: "",
  //       product_code: productCode,
  //     }),
  //   );
  // }, [dispatch, formData.products, primaryFromField, showForm]);

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     dispatch(
  //       fetchWarehouseInventoryStockProducts({
  //         page_size: "all",
  //         search: productSearchText,
  //       }),
  //     );
  //   }, 250);
  //   return () => clearTimeout(timer);
  // }, [dispatch, formData.transfer_type, productSearchText]);

  // useEffect(() => {
  //   if (formData.transfer_type) {
  //     dispatch(
  //       fetchProductTransferTypeList({ transfer_type: formData.transfer_type }),
  //     );
  //   }
  // }, [formData?.transfer_type]);

  

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      available_quantity: getMatchedAvailableQuantity(prev),
    }));
  }, [
    formData.products,
    primaryFromField,
    formData[primaryFromField],
    formData.transfer_type,
    rackAllocationStatusList,
    rackAllocationList,
    selectedAllocationKey,
  ]);

  useEffect(() => {
    const matchedRows = getMatchedSourceRows();

    if (shouldUseAllocationStatusForAvailableQty) {
      if (isSubinventoryToSubinventoryTransfer(formData.transfer_type)) {
        if (matchedRows.length === 0) {
          setSelectedAllocationKey("");
          return;
        }
        if (matchedRows.length === 1) {
          setSelectedAllocationKey(getAllocationRowStableKey(matchedRows[0]));
          return;
        }
        const hasExistingSelection = matchedRows.some(
          (row) => getAllocationRowStableKey(row) === selectedAllocationKey,
        );
        if (!selectedAllocationKey || !hasExistingSelection) {
          setSelectedAllocationKey(getAllocationRowStableKey(matchedRows[0]));
        }
        return;
      }
      setSelectedAllocationKey("");
      return;
    }

    if (matchedRows.length > 0) {
      const defaultKey = getAllocationRowStableKey(matchedRows[0]);
      if (!selectedAllocationKey) {
        setSelectedAllocationKey(defaultKey);
        return;
      }
    }
    if (matchedRows.length === 1) {
      setSelectedAllocationKey(getAllocationRowStableKey(matchedRows[0]));
      return;
    }
    const hasExistingSelection = matchedRows.some(
      (row) => getAllocationRowStableKey(row) === selectedAllocationKey,
    );
    if (!hasExistingSelection) {
      setSelectedAllocationKey(
        matchedRows.length > 0 ? getAllocationRowStableKey(matchedRows[0]) : "",
      );
    }
  }, [
    formData.products,
    primaryFromField,
    formData[primaryFromField],
    formData.transfer_type,
    shouldUseAllocationStatusForAvailableQty,
    rackAllocationStatusList,
    rackAllocationList,
  ]);

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return; // prevent double click

    const newErrors = {};

    if (!formData.transfer_date) {
      newErrors.transfer_date = "Transfer date required";
    }
    if (!formData.transfer_type)
      newErrors.transfer_type = "Transfer type required";
    if (!formData.transfer_mode) {
      newErrors.transfer_mode = "Transfer mode required";
    }
    if (!formData.products) {
      newErrors.products = "Product required";
    }
    if (!formData.quantity) {
      newErrors.quantity = "Quantity required";
    } else {
      const enteredQty = Number(formData.quantity);
      const availableQty = getEffectiveAvailableQuantity();
      if (Number.isFinite(enteredQty) && enteredQty > availableQty) {
        newErrors.quantity =
          "Quantity cannot be greater than available quantity";
      }
    }
    if (primaryFromField && !formData[primaryFromField]) {
      newErrors[primaryFromField] =
        `${FIELD_LABELS[primaryFromField] || "From field"} required`;
    }
    if (primaryToField && !formData[primaryToField]) {
      newErrors[primaryToField] =
        `${FIELD_LABELS[primaryToField] || "To field"} required`;
    }
    getToHierarchyChain().forEach((fieldKey) => {
      if (!formData[fieldKey]) {
        newErrors[fieldKey] = `${FIELD_LABELS[fieldKey] || fieldKey} required`;
      }
    });
    const matchedSourceRows = getMatchedSourceRows();
    if (
      !shouldUseAllocationStatusForAvailableQty &&
      matchedSourceRows.length > 1 &&
      !selectedAllocationKey
    ) {
      newErrors.allocation_selection = "Please select one source stock card";
    }
    if (
      shouldUseAllocationStatusForAvailableQty &&
      isSubinventoryToSubinventoryTransfer(formData.transfer_type) &&
      matchedSourceRows.length > 1 &&
      !selectedAllocationKey
    ) {
      newErrors.allocation_selection =
        "Please select which allocation status line to use for available quantity";
    }



    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      if (
        newErrors.quantity ===
        "Quantity cannot be greater than available quantity"
      ) {
        showError("Quantity cannot be greater than available quantity");
      }
      return;
    }

    setSubmitting(true);

    try {
      const selectedTransferType = TRANSFER_TYPE_OPTIONS.find(
        (option) => option.value === formData.transfer_type,
      );
      const selectedTransferMode = TRANSFER_MODE_OPTIONS.find(
        (option) => option.value === formData.transfer_mode,
      );
      const payload = {
        transfer_date: formData.transfer_date,
        transfer_type: selectedTransferType?.label || formData.transfer_type,
        transfer_mode: selectedTransferMode?.label || formData.transfer_mode,
        product_code: formData.products,
        from_location: primaryFromField ? formData[primaryFromField] : "",
        /** Primary To only (e.g. zone code); aisle/rack/bin refinements go in the three keys below. */
        to_location: primaryToField ? formData[primaryToField] : "",
        quantity: Number(formData.quantity),
        reason: formData.reason ?? "",
        aisle_code: String(formData.to_aisle ?? "").trim(),
        rack_code: String(formData.to_rack ?? "").trim(),
        bin_code: String(formData.to_bin ?? "").trim(),
        allocation_id: selectedAllocationId ?? undefined,
      };

      console.log("Product transfer payload:", payload);

      // ✅ IMPORTANT: await unwrap
      await dispatch(createProductTransfer(payload)).unwrap();

      // ✅ success AFTER API completes
      showSuccess("Product Transfer Requested Created Successfully");

      dispatch(
        fetchProductTransferList({
          page: 1,
          page_size: pagination?.page_size || 10,
        }),
      );

      // reset
      handleCloseForm();
    } catch (rejected) {
      const firstFieldError =
        rejected &&
        typeof rejected === "object" &&
        !Array.isArray(rejected) &&
        Object.values(rejected).find(
          (value) => Array.isArray(value) && value.length > 0,
        )?.[0];
      const message =
        (typeof rejected === "string" && rejected) ||
        rejected?.message ||
        rejected?.error ||
        rejected?.detail ||
        (Array.isArray(rejected?.non_field_errors) &&
          rejected.non_field_errors[0]) ||
        firstFieldError ||
        (Array.isArray(rejected) && rejected[0]) ||
        "Unable to submit product transfer";

      showError(message);
    } finally {
      setSubmitting(false);
    }
  };
  useEffect(() => {
     dispatch(
        fetchProductTransferList({
          page: 1,
          page_size: pagination?.page_size || 10,
        }),
      );
  }, [dispatch, pagination?.page_size]);
  

  const productTransferColumns = [
    {
      key: "transfer_id",
      label: "Transfer Id",
      headerAlign: "center",
    },
    {
      key: "product_code",
      label: "Product Code",
      headerAlign: "center",
    },
    {
      key: "quantity",
      label: "Qty",
      headerAlign: "center",
    },
    // {
    //   key: "plant",
    //   label: "Plant",
    //   headerAlign: "center",
    // },
    {
      key: "transfer_type",
      label: "Transfer Type",
      headerAlign: "center",
    },
    {
      key: "from_location",
      label: "From Location",
      headerAlign: "center",
    },
    {
      key: "to_location",
      label: "To Location",
      headerAlign: "center",
    },
    // {
    //   key: "reference_number",
    //   label: "Reference No",
    //   headerAlign: "center",
    // },
    // {
    //   key: "status",
    //   label: "Status",
    //   headerAlign: "center",
    //   render: (val) => (
    //     <div style={{ textAlign: "center" }}>
    //       <span
    //         className={`px-2 py-1 rounded text-xs ${
    //           val === "PENDING"
    //             ? "bg-yellow-100 text-yellow-700"
    //             : val === "COMPLETED"
    //               ? "bg-green-100 text-green-700"
    //               : "bg-gray-100 text-gray-700"
    //         }`}
    //       >
    //         {val}
    //       </span>
    //     </div>
    //   ),
    // },
    // {
    //   key: "actions",
    //   label: "Actions",
    //   headerAlign: "center",
    //   render: (_, row) => (
    //     <div className="flex justify-center gap-2">
    //       <button
    //         className="px-2 py-1 text-xs bg-blue-500 text-white rounded"
    //         onClick={() => handleView(row)}
    //       >
    //         View
    //       </button>
    //     </div>
    //   ),
    // },
  ];

  // useEffect(() => {
  //   setFormData({ ...EMPTY_FORM });
  // }, [formData.transfer_type]);

  return (
    <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4">
      {/* HEADER */}

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-slate-900">
            Product Transfer
          </h2>
          <p className="text-sm text-slate-500">
            Capture and track product movement.
          </p>
        </div>

        <CommonButton
          type="button"
          size="sm"
          icon={Plus}
          onClick={() => {
            setFormData({ ...EMPTY_FORM });
            setErrors({});
            setProductSearchText("");
            setShowForm(true);
          }}
        >
          New Request
        </CommonButton>
      </div>

      {/* METRICS */}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <MetricCard
          title="Total Requests"
          value={metrics.total}
          tone="primary"
        />
        <MetricCard
          title="Pending"
          value={metrics.pending}
          tone="warning"
        />
        <MetricCard
          title="Issued"
          value={metrics.issued}
          tone="success"
          icon={ClipboardCheck}
        />
        <MetricCard
          title="Rejected"
          value={metrics.rejected}
          tone="violet"
          icon={AlertCircle}
        />
        <MetricCard
          title="Overdue"
          value={metrics.overdue}
          tone="danger"
          icon={AlertTriangle}
        />
      </div>

      {/* FORM */}

      {showForm && (
        <CommonModal
          isOpen={showForm}
          onClose={handleCloseForm}
          closeOnBackdropClick={false}
          title="Transfer Request"
          size="2xl"
        >
          <form
            className={`mt-5 space-y-6 ${transferTypeLoading ? "opacity-60 pointer-events-none" : ""}`}
            onSubmit={handleSubmit}
          >
            <div className="rounded-xl bg-white p-5">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Transfer Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.transfer_date}
                    onChange={(e) => {
                      const nextDate = e.target.value;
                      setSelectedAllocationKey("");
                      setFormData((p) => {
                        const clearedLocationFields =
                          TRANSFER_LOCATION_FIELDS.reduce(
                            (acc, field) => ({ ...acc, [field]: "" }),
                            {},
                          );
                        return {
                          ...p,
                          transfer_date: nextDate,
                          transfer_type: "",
                          transfer_mode: "",
                          products: "",
                          quantity: "",
                          available_quantity: "",
                          reason: "",
                          ...clearedLocationFields,
                        };
                      });
                      setErrors((prev) => clearTransferFieldErrors(prev));
                    }}
                    className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 transition-all duration-150 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  {errors.transfer_date && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.transfer_date}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Transfer Type <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <SearchableInputDropdown
                      value={getTransferTypeLabelByValue(
                        formData.transfer_type,
                      )}
                      onChange={(next) => {
                        const nextType = getTransferTypeValueByLabel(
                          next || "",
                        );
                        setSelectedAllocationKey("");
                        setSelectedAllocationId(null);
                        setFormData((p) => {
                          const clearedDependentFields =
                            TRANSFER_LOCATION_FIELDS.reduce(
                              (acc, field) => ({ ...acc, [field]: "" }),
                              {},
                            );
                          return {
                            ...p,
                            transfer_type: nextType,
                            transfer_mode: "",
                            products: "",
                            quantity: "",
                            available_quantity: "",
                            reason: "",
                            ...clearedDependentFields,
                          };
                        });
                        setErrors((prev) => clearTransferFieldErrors(prev));
                      }}
                      options={TRANSFER_TYPE_OPTIONS.map(
                        (option) => option.label,
                      )}
                      placeholder="Select transfer type"
                      searchPlaceholder="Search transfer type"
                    />
                  </div>
                  {errors.transfer_type && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.transfer_type}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Transfer Mode <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <SearchableInputDropdown
                      value={getTransferModeLabelByValue(
                        formData.transfer_mode,
                      )}
                      onChange={(next) => {
                        const nextMode = getTransferModeValueByLabel(
                          next || "",
                        );
                        setSelectedAllocationKey("");
                        setSelectedAllocationId(null);
                        setFormData((p) => {
                          const clearedLocationFields =
                            TRANSFER_LOCATION_FIELDS.reduce(
                              (acc, field) => ({ ...acc, [field]: "" }),
                              {},
                            );
                          return {
                            ...p,
                            transfer_mode: nextMode,
                            products: "",
                            quantity: "",
                            available_quantity: "",
                            reason: "",
                            ...clearedLocationFields,
                          };
                        });
                        setErrors((prev) => clearTransferFieldErrors(prev));
                      }}
                      options={transferModeOptionsForType.map(
                        (option) => option.label,
                      )}
                      placeholder="Select transfer mode"
                      searchPlaceholder="Search transfer mode"
                    />
                  </div>
                  {errors.transfer_mode && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.transfer_mode}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Products <span className="text-red-500">*</span>
                  </label>
                  <div
                    className="mt-1"
                    onMouseDown={() => {
                      setProductSearchText("");
                    }}
                  >
                    <SearchableInputDropdown
                      value={formData.products}
                      onChange={(next) => {
                        const nextProduct = next || "";
                        setSelectedAllocationKey("");
                        setSelectedAllocationId(null);
                        // if (nextProduct) {
                        //   dispatch(
                        //     fetchRackAllocationData({
                        //       product_code: nextProduct,
                        //     }),
                        //   );
                        // } else {
                        //   dispatch(fetchRackAllocationData());
                        // }
                        setFormData((p) => {
                          const nextData = {
                            ...p,
                            products: nextProduct,
                            quantity: "",
                            available_quantity: "",
                            reason: "",
                            ...clearAllToHierarchyValues(),
                          };
                          if (primaryFromField) nextData[primaryFromField] = "";
                          if (primaryToField) nextData[primaryToField] = "";
                          return nextData;
                        });
                        setErrors((prev) => clearTransferFieldErrors(prev));
                      }}
                      options={productsDropdownOptions}
                      placeholder="Select product"
                      searchPlaceholder="Search product"
                      onSearchChange={setProductSearchText}
                      disabled={!formData.transfer_type}
                    />
                  </div>
                  {errors.products && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.products}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    {(FIELD_LABELS[primaryFromField] || "From") + " "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <SearchableInputDropdown
                      value={
                        primaryFromField
                          ? getLabelForDropdownValue(
                              primaryFromField,
                              formData[primaryFromField],
                              getFromSelectOptions(),
                            )
                          : ""
                      }
                      onChange={(nextLabel) => {
                        setSelectedAllocationKey("");
                        setSelectedAllocationId(null);
                        const nextValue = primaryFromField
                          ? getValueForDropdownLabel(
                              primaryFromField,
                              nextLabel,
                              getFromSelectOptions(),
                            )
                          : "";
                        setFormData((p) => {
                          const nextData = {
                            ...p,
                            [primaryFromField]: nextValue,
                            quantity: "",
                            reason: "",
                            ...clearAllToHierarchyValues(),
                          };
                          if (primaryToField) nextData[primaryToField] = "";
                          return nextData;
                        });
                        setErrors((prev) => ({
                          ...prev,
                          [primaryFromField]: undefined,
                          [primaryToField]: undefined,
                          quantity: undefined,
                          allocation_selection: undefined,
                        }));
                      }}
                      options={
                        primaryFromField
                          ? getFromSelectOptions().map((option) =>
                              getOptionLabel(primaryFromField, option),
                            )
                          : []
                      }
                      placeholder={
                        primaryFromField
                          ? `Select ${FIELD_LABELS[primaryFromField] || "From"}`
                          : "Select transfer type first"
                      }
                      searchPlaceholder="Search..."
                      disabled={!primaryFromField}
                    />
                  </div>
                  {primaryFromField && errors[primaryFromField] && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors[primaryFromField]}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    {(FIELD_LABELS[primaryToField] || "To") + " "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <SearchableInputDropdown
                      value={
                        primaryToField
                          ? getLabelForDropdownValue(
                              primaryToField,
                              formData[primaryToField],
                              getOptionsForField(primaryToField),
                            )
                          : ""
                      }
                      onChange={(nextLabel) => {
                        const nextValue = primaryToField
                          ? getValueForDropdownLabel(
                              primaryToField,
                              nextLabel,
                              getOptionsForField(primaryToField),
                            )
                          : "";
                        const chain = getToHierarchyChain();
                        const cleared = chain.reduce(
                          (acc, k) => ({ ...acc, [k]: "" }),
                          {},
                        );
                        const clearedToErrors = chain.reduce(
                          (acc, k) => ({ ...acc, [k]: undefined }),
                          {},
                        );
                        setFormData((p) => ({
                          ...p,
                          [primaryToField]: nextValue,
                          ...cleared,
                          quantity: "",
                          reason: "",
                        }));
                        setErrors((prev) => ({
                          ...prev,
                          quantity: undefined,
                          [primaryToField]: undefined,
                          ...clearedToErrors,
                        }));
                      }}
                      options={
                        primaryToField
                          ? getOptionsForField(primaryToField).map((option) =>
                              getOptionLabel(primaryToField, option),
                            )
                          : []
                      }
                      placeholder={
                        primaryToField
                          ? `Select ${FIELD_LABELS[primaryToField] || "To"}`
                          : "Select transfer type first"
                      }
                      searchPlaceholder="Search..."
                      disabled={!primaryToField}
                    />
                  </div>
                  {primaryToField && errors[primaryToField] && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors[primaryToField]}
                    </p>
                  )}
                </div>
                {secondaryToChain.length > 0 && (
                  <div className="col-span-full min-w-0">
                    <div
                      className={[
                        "mt-1 grid min-w-0 gap-2",
                        secondaryToChain.length === 1 && "grid-cols-1",
                        secondaryToChain.length === 2 && "grid-cols-2",
                        secondaryToChain.length >= 3 && "grid-cols-3",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {secondaryToChain.map((secondaryField) => (
                        <div key={secondaryField} className="min-w-0">
                          <label className="text-[11px] font-semibold text-slate-600">
                            {FIELD_LABELS[secondaryField] || secondaryField}
                            <span className="text-red-500"> *</span>
                          </label>
                          <select
                            value={formData[secondaryField] || ""}
                            onChange={(e) => {
                              const chain = getToHierarchyChain();
                              const cleared = clearDescendantToHierarchyValues(
                                chain,
                                secondaryField,
                              );
                              setFormData((p) => ({
                                ...p,
                                [secondaryField]: e.target.value,
                                ...cleared,
                                quantity: "",
                                reason: "",
                              }));
                              setErrors((prev) => ({
                                ...prev,
                                quantity: undefined,
                                [secondaryField]: undefined,
                              }));
                            }}
                            disabled={isToSecondarySelectDisabled(
                              secondaryField,
                            )}
                            className="mt-1 h-10 w-full min-w-0 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm"
                          >
                            <option value="">
                              {`Select ${FIELD_LABELS[secondaryField] || secondaryField}`}
                            </option>
                            {getFilteredToSecondaryOptions(secondaryField).map(
                              (option) => (
                                <option
                                  key={
                                    option.id ||
                                    getOptionValue(secondaryField, option)
                                  }
                                  value={getOptionValue(secondaryField, option)}
                                >
                                  {getOptionLabel(secondaryField, option)}
                                </option>
                              ),
                            )}
                          </select>
                          {errors[secondaryField] && (
                            <p className="mt-1 text-xs text-red-500">
                              {errors[secondaryField]}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.quantity}
                    onChange={(e) => {
                      const nextQuantity = sanitizeQuantityInput(
                        e.target.value,
                      );
                      const enteredQty = Number(nextQuantity || 0);
                      const availableQty = getEffectiveAvailableQuantity();
                      setFormData((p) => ({
                        ...p,
                        quantity: nextQuantity,
                      }));
                      setErrors((prev) => ({
                        ...prev,
                        quantity:
                          nextQuantity &&
                          Number.isFinite(enteredQty) &&
                          enteredQty > availableQty
                            ? "Quantity cannot be greater than available quantity"
                            : undefined,
                      }));
                    }}
                    className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 transition-all duration-150 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Enter quantity"
                  />
                  {errors.quantity && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.quantity}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Available Qty
                  </label>
                  {(inventoryStockProducts?.length > 0 && formData?.from_subinventory) ? (
                    <>
                      {/* <select
                        value={selectedAllocationKey}
                        onChange={(e) => {
                          setSelectedAllocationKey(e.target.value);
                          setErrors((prev) => ({
                            ...prev,
                            allocation_selection: undefined,
                          }));
                        }}
                        className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 transition-all duration-150 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        {inventoryStockProducts?.map((row, index) => {
                          const optionKey = getAllocationRowKey(row, index);
                          return (
                            <option key={optionKey} value={optionKey}>
                              {getAllocationStatusQtyOptionLabel(row, index)}
                            </option>
                          );
                        })}
                      </select>
                      <p className="mt-1 text-[11px] text-slate-500">
                        Multiple allocation-status lines match; pick one —
                        quantity limit follows the Avail value shown in the
                        label.
                      </p> */}
                      <input
                        type="text"
                        value={inventoryStockProducts?.[0]?.quantity || ""}
                        readOnly
                        className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 transition-all duration-150 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        placeholder="From allocation status"
                      />
                    </>
                  ) : (
                    <input
                      type="text"
                      value={formData.available_quantity}
                      readOnly
                      className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 transition-all duration-150 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="From allocation status"
                    />
                  )}
                </div>
              </div>
              {formData.products &&
                !shouldUseAllocationStatusForAvailableQty && (
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {selectedProductAllocations.length > 0 ? (
                      selectedProductAllocations.map((allocation, index) => {
                        const allocationKey = getAllocationRowKey(
                          allocation,
                          index,
                        );
                        const allocationStableKey =
                          getAllocationRowStableKey(allocation);
                        const zoneValue =
                          allocation.zone_code ||
                          allocation.zone_name ||
                          allocation.zone ||
                          "-";
                        const locationDetails = [
                          { key: "zone", label: "Zone", value: zoneValue },
                          {
                            key: "aisle",
                            label: "Aisle",
                            value: allocation.aisle_code || "-",
                          },
                          {
                            key: "rack",
                            label: "Rack",
                            value: allocation.rack_code || "-",
                          },
                          {
                            key: "bin",
                            label: "Bin",
                            value: allocation.bin_code || "-",
                          },
                        ];
                        const highlightKey = primaryFromField?.includes("bin")
                          ? "bin"
                          : primaryFromField?.includes("rack")
                            ? "rack"
                            : primaryFromField?.includes("aisle")
                              ? "aisle"
                              : "zone";
                        const highlightedDetail =
                          locationDetails.find(
                            (detail) =>
                              detail.key === highlightKey &&
                              detail.value !== "-",
                          ) ||
                          locationDetails.find(
                            (detail) => detail.value !== "-",
                          ) ||
                          locationDetails[0];
                        const isSelected =
                          selectedAllocationKey === allocationStableKey;
                        return (
                          <button
                            key={allocationKey}
                            type="button"
                            onClick={() => {
                              const nextFromValue = getPreferredFromValueForRow(
                                primaryFromField,
                                allocation,
                              );
                              setSelectedAllocationKey(allocationStableKey);
                              {
                                console.log("allocation", allocation);
                              }
                              setSelectedAllocationId(allocation?.id ?? null);
                              setFormData((prev) => {
                                if (!primaryFromField || !nextFromValue)
                                  return prev;
                                return {
                                  ...prev,
                                  [primaryFromField]: nextFromValue,
                                };
                              });
                              setErrors((prev) => ({
                                ...prev,
                                allocation_selection: undefined,
                                [primaryFromField]: undefined,
                                quantity: undefined,
                              }));
                            }}
                            className="group rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-[0_14px_28px_rgba(99,102,241,0.12)]"
                            aria-pressed={isSelected}
                          >
                            <div
                              className={`grid gap-4 md:grid-cols-[minmax(0,1fr)_170px] ${
                                isSelected ? "rounded-xl ring-2 ring-indigo-200" : ""
                              }`}
                            >
                              <div className="min-w-0 space-y-3">
                                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/80 px-3 py-1.5">
                                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-indigo-700">
                                    {highlightedDetail.label}:{" "}
                                    <span className="font-bold">
                                      {highlightedDetail.value}
                                    </span>
                                  </p>
                                </div>
                                <div className="grid gap-2 sm:grid-cols-2">
                                  {locationDetails
                                    .filter(
                                      (detail) =>
                                        detail.key !== highlightedDetail.key,
                                    )
                                    .map((detail) => (
                                      <div
                                        key={detail.key}
                                        className="rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2"
                                      >
                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                          {detail.label}
                                        </p>
                                        <p className="text-sm font-semibold text-slate-800">
                                          {detail.value}
                                        </p>
                                      </div>
                                    ))}
                                </div>
                              </div>
                              <div className="flex h-full min-h-[116px] flex-col justify-between rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 px-4 py-3 text-right">
                                <div className="mb-2 flex items-center justify-end gap-2">
                                  <span
                                    className={`h-3 w-3 rounded-full border ${
                                      isSelected
                                        ? "border-indigo-500 bg-indigo-500"
                                        : "border-slate-300 bg-white"
                                    }`}
                                  />
                                  <span className="text-[11px] font-medium text-slate-500">
                                    {isSelected ? "Selected" : "Select"}
                                  </span>
                                </div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                                  Available Quantity
                                </p>
                                <p className="mt-1 text-3xl font-black leading-none text-slate-900">
                                  {Number(allocation.allocated_qty) || 0}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <p className="col-span-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                        No source stock details available for the selected
                        product.
                      </p>
                    )}
                  </div>
                )}
              {errors.allocation_selection && (
                <p className="mt-2 text-xs text-red-500">
                  {errors.allocation_selection}
                </p>
              )}
              <div className="mt-4">
                <label className="text-xs font-semibold text-slate-700">
                  Reason
                </label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      reason: e.target.value,
                    }))
                  }
                  className="mt-1 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 transition-all duration-150 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Enter reason"
                />
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {/* <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Reference
                  </label>
                  <input
                    type="text"
                    value={formData.reference_number}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        reference_number: sanitizeQuantityInput(e.target.value),
                      }))
                    }
                    className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm"
                    placeholder="e.g. Inward No / Production Ref"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Enter any reference number for tracking purposes
                  </p>
                  {errors.reference_number && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.reference_number}
                    </p>
                  )}
                </div> */}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <CommonButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCloseForm}
              >
                Cancel
              </CommonButton>
              <CommonButton
                type="submit"
                size="sm"
                disabled={submitting}
                isLoading={submitting}
              >
                Submit
              </CommonButton>
            </div>
          </form>
        </CommonModal>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-1">
        <CommonDataGrid
          columns={productTransferColumns}
          data={productTransferList}
          showSearch={false}
          loading={loading}
          page={pagination.current_page}
          serverPagination
          totalCount={pagination.count}
          onPageChange={(newPage) => {
            const pageSize = pagination?.page_size || 10;
            dispatch(
              fetchProductTransferList({
                page: newPage,
                page_size: pageSize,
              }),
            );
          }}
          onPageSizeChange={(newPageSize) => {
            dispatch(
              fetchProductTransferList({
                page: 1,
                page_size: newPageSize,
              }),
            );
          }}
        />
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </section>
  );
};

export default ProductTransfer;
