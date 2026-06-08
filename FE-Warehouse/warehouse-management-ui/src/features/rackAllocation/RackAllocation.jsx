import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CommonDataGrid from "@shared/components/CommonDataGrid";

import {
  fetchInwardList,
  createRackAllocation,
  fetchRackAllocationData,
  fetchRackAllocationStatus,
} from "@core/store/slices/RackAllocation/rackAllocationSlice";

import {
  fetchBinsList,
  fetchAislesList,
  fetchZonesList,
  fetchRacksList,
} from "@core/store/slices/MDM/mdmSlice";
import { ToastContainer } from "@shared/components/Toast";
import { useToast } from "@shared/hooks/useToast";
import SearchableInputDropdown from "@shared/components/SearchableInputDropdown";
import CommonModal from "@shared/components/CommonModal";
import { CommonHeading } from "@shared/components/CommonHeading";
import { CommonButton } from "@shared/components/CommonButton";
import { ArchiveBoxIcon } from "@heroicons/react/24/outline";

const RackAllocation = () => {
  const dispatch = useDispatch();

  const {
    inwardList,
    loading,
    rackAllocationData,
    rackAllocationList,
    rackAllocationStatusList,
    pagination,
  } = useSelector((state) => state.rackAllocation);

  const {
    zoneList,
    aisleList,
    rackList,
    binList,
    productList: apiProductList,
    suppliersList,
  } = useSelector((state) => state.mdm);

  const [selectedRow, setSelectedRow] = useState(null);
  const [errors, setErrors] = useState({});
  const { toasts, showError, showSuccess, removeToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [maxQty, setMaxQty] = useState(0);
  const [zoneSearchText, setZoneSearchText] = useState("");
  const [aisleSearchText, setAisleSearchText] = useState("");
  const [rackSearchText, setRackSearchText] = useState("");
  const [binSearchText, setBinSearchText] = useState("");
  const [gridSearchText, setGridSearchText] = useState("");
  const [recentAllocationsSearchText, setRecentAllocationsSearchText] =
    useState("");
  const didInitGridSearchRef = useRef(false);
  const didInitRecentSearchRef = useRef(false);

  const [formData, setFormData] = useState({
    sub_inventory: "",
    product_code: "",
    allocated_qty: "",
    zone_code: "",
    aisle_code: "",
    rack_code: "",
    bin_code: "",
  });


  const zoneOptions = (zoneList?.data || [])
    .map((z) => z?.zone_code || "")
    .filter(Boolean);
  const aisleOptions = (aisleList?.data || [])
    .map((z) => z?.aisle_code || "")
    .filter(Boolean);
  const rackOptions = (rackList?.data || [])
    .map((z) => z?.rack_code || "")
    .filter(Boolean);
  const binOptions = (binList?.data || [])
    .map((z) => z?.bin_code || "")
    .filter(Boolean);

  // ---------------- FETCH ----------------
  useEffect(() => {
    dispatch(fetchRackAllocationStatus({ page: 1 }));
    dispatch(fetchRackAllocationData({ page: 1 }));
    // dispatch(fetchZonesList({ page_size: "all" }));
    // dispatch(fetchAislesList({ page_size: "all" }));
    // dispatch(fetchBinsList({ page_size: "all" }));
    // dispatch(fetchRacksList({ page_size: "all" }));
  }, [dispatch]);

  useEffect(() => {
    const search = gridSearchText.trim();
    if (!didInitGridSearchRef.current) {
      didInitGridSearchRef.current = true;
      return;
    }
    dispatch(fetchRackAllocationStatus({ page: 1, search }));
    dispatch(
      fetchRackAllocationData({
        page: 1,
        page_size: pagination?.page_size || 10,
        search,
      }),
    );
  }, [dispatch, gridSearchText, pagination?.page_size]);

  useEffect(() => {
    const search = recentAllocationsSearchText.trim();
    if (!didInitRecentSearchRef.current) {
      didInitRecentSearchRef.current = true;
      return;
    }
    dispatch(
      fetchRackAllocationData({
        page: 1,
        page_size: pagination?.page_size || 10,
        search,
      }),
    );
  }, [dispatch, recentAllocationsSearchText, pagination?.page_size]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(
        fetchZonesList({ page_size: "all", search: zoneSearchText.trim() }),
      );
    }, 300);
    return () => clearTimeout(timer);
  }, [dispatch, zoneSearchText]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(
        fetchAislesList({ page_size: "all", search: aisleSearchText.trim() }),
      );
    }, 300);
    return () => clearTimeout(timer);
  }, [dispatch, aisleSearchText]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(
        fetchRacksList({ page_size: "all", search: rackSearchText.trim() }),
      );
    }, 300);
    return () => clearTimeout(timer);
  }, [dispatch, rackSearchText]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(
        fetchBinsList({ page_size: "all", search: binSearchText.trim() }),
      );
    }, 300);
    return () => clearTimeout(timer);
  }, [dispatch, binSearchText]);

  // unAllocated  TRANSFORM DATA
  // const gridData = rackAllocationStatusList.flatMap((item) =>
  //   (item.items || []).map((i) => ({
  //     id: i.id,

  //     inward_number: item.inward_number,
  //     plant: item.plant,
  //     location_code: item.location_code,
  //     supplier: item.supplier,
  //     inward_date: item.inward_date,

  //     subinventory: i.sub_inventory,
  //     product: i.product_code,
  //     qty: i.quantity,
  //     zone_code: i.zone_code,
  //   aisle_code: i.aisle_code,
  //   rack_code: i.rack_code,
  //   bin_code: i.bin_code,

  //     grv_line_id: i.id,
  //   })),
  // );

  // rack allocation data

  const allocatedGrid = (rackAllocationList?.results || []).map((item) => ({
    id: item.id,
    subinventory: item.sub_inventory,
    product: item.product_code,
    qty: item.allocated_qty,

    zone: item.zone_code,
    aisle: item.aisle_code,
    rack: item.rack_code,
    bin: item.bin_code,

    grn_number: item.grn_number,
  }));

  const heading = {
    title: "Rack Allocation",
  };
  const allocationDataRows =
    rackAllocationList?.data || rackAllocationData?.data || [];

  // ONLY SELECTED ROW OPTIONS
  const subinventoryOptions = selectedRow ? [selectedRow.sub_inventory] : [];
  const productOptions = selectedRow ? [selectedRow.product_code] : [];

  // ---------------- ACTIONS ----------------
  const handleAllocate = (row) => {
    console.log(row);
    setSelectedRow(row);
    const availableQty = Number(
      row.unallocated_qty ?? row.quantity ?? row.qty ?? row.allocated_qty ?? 0,
    );
    setMaxQty(Number.isFinite(availableQty) ? availableQty : 0);

    setFormData({
      sub_inventory: row.sub_inventory,
      product_code: row.product_code,
      allocated_qty: "",
      zone_code: "",
      aisle_code: "",
      rack_code: "",
      bin_code: "",
    });
    setErrors({});
    setShowForm(true);
  };

  const handleChange = (key, value) => {
    console.log("key:value", key, value);
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      if (value !== "") {
        delete next[key];
      }
      return next;
    });
  };

  const handleCloseForm = () => {
    // setFormData({ ...EMPTY_FORM });
    setErrors({});
    setSubmitting(false);
    setShowForm(false);
  };

  // const handleCancel = () => {
  //   setShowForm(false);
  // };

  // FORM SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!formData.sub_inventory)
      newErrors.sub_inventory = "subinventory required";
    if (!formData.product_code) newErrors.product_code = "Product required";
    // if (!formData.allocated_qty) newErrors.allocated_qty = "Quantity required";
    if (!formData.zone_code) newErrors.zone_code = "Zone required";
    if (!formData.aisle_code) newErrors.aisle_code = "Aisle required";
    if (!formData.rack_code) newErrors.rack_code = "Rack required";
    if (!formData.bin_code) newErrors.bin_code = "Bin required";

    // const clearTransferFieldErrors = (prevErrors) => {
    // const nextErrors = { ...prevErrors };

    const enteredQty = Number(formData.allocated_qty);
    const allowedQty = Number(maxQty);

    if (formData.allocated_qty === "" || formData.allocated_qty === null) {
      newErrors.allocated_qty = "Quantity required";
    } else if (Number.isNaN(enteredQty) || enteredQty <= 0) {
      newErrors.allocated_qty = "Quantity must be a positive number";
    } else if (Number.isFinite(allowedQty) && enteredQty > allowedQty) {
      newErrors.allocated_qty = `Quantity cannot exceed available quantity (${allowedQty})`;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);

    const payload = {
      id: selectedRow.id,
      sub_inventory: formData.sub_inventory,
      product_code: formData.product_code,
      allocated_qty: Number(formData.allocated_qty),
      zone_code: formData.zone_code,
      aisle_code: formData.aisle_code,
      rack_code: formData.rack_code,
      bin_code: formData.bin_code,
    };

    // console.log("PAYLOAD:", payload);

    //  new
    try {
      const result = await dispatch(createRackAllocation(payload)).unwrap();
      const successMessage =
        result?.message ||
        result?.detail ||
        result?.data?.message ||
        "Rack allocated successfully";
      showSuccess(successMessage);
      setTimeout(() => {
        dispatch(fetchRackAllocationStatus({ page: 1 }));
        dispatch(
          fetchRackAllocationData({
            page: pagination?.current_page || 1,
            page_size: pagination?.page_size || 10,
          }),
        );
      }, 1000);
    } catch (err) {
      const errorMessage =
        err?.message ||
        err?.detail ||
        err?.payload?.message ||
        err?.payload?.detail ||
        err?.data?.message ||
        err?.data?.detail ||
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        "Failed to allocate rack. Please try again.";
      showError(errorMessage);
      setSubmitting(false);
      return;
    }

    setFormData({
      sub_inventory: "",
      product_code: "",
      allocated_qty: "",
      zone_code: "",
      aisle_code: "",
      rack_code: "",
      bin_code: "",
    });

    setSubmitting(false);
    setShowForm(false);
  };

  //  UnAllocate table data
  const defaultPageSize = 5;
  const isFullyAllocated = (row) => {
    const availableQty = Number(row?.quantity ?? row?.qty ?? 0);
    const allocatedQty = Number(row?.allocated_qty ?? 0);
    return (
      Number.isFinite(availableQty) &&
      Number.isFinite(allocatedQty) &&
      availableQty === allocatedQty
    );
  };
  const getStatusPillStyles = (statusValue) => {
    const normalized = String(statusValue || "").trim().toLowerCase();
    if (normalized === "allocated") {
      return "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300";
    }
    if (normalized === "unallocated") {
      return "bg-amber-100 text-amber-800 ring-1 ring-amber-300";
    }
    return "bg-slate-100 text-slate-700 ring-1 ring-slate-300";
  };

  const unallocatedColumns = [
    {
      key: "sub_inventory",
      label: "Subinventory",
      headerAlign: "center",
    },
    {
      key: "plant",
      label: "Plant",
      headerAlign: "center",
    },
    {
      key: "product_code",
      label: "Product",
      headerAlign: "center",
    },
    {
      key: "quantity",
      label: "Available Qty",
      headerAlign: "center",
    },
    {
      key: "allocated_qty",
      label: "Allocated Qty",
      headerAlign: "center",
    },
    {
      key: "unallocated_qty",
      label: "Unallocated Qty",
      headerAlign: "center",
    },
    {
      key: "status",
      label: "Status",
      headerAlign: "center",
      render: (item) => (
        <span
          className={`inline-flex min-w-24 justify-center rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusPillStyles(
            item,
          )}`}
        >
          {item || "Unknown"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      headerAlign: "center",
      render: (_, row) => {
        const disabled = isFullyAllocated(row);
        return (
          <button
            onClick={() => handleAllocate(row)}
            disabled={disabled}
            className={`rounded-md px-3 py-1 text-xs font-semibold text-white transition ${
              disabled
                ? "cursor-not-allowed bg-emerald-600"
                : "bg-blue-500 hover:bg-blue-600 animate-pulse [animation-duration:2.2s]"
            }`}
          >
            {disabled ? "Allocated" : "Allocate"}
          </button>
        );
      },
    },
  ];
  const allocationColumns = [
    { key: "subinventory", label: "Subinventory", headerAlign: "center" },
    { key: "zone", label: "Zone", headerAlign: "center" },
    { key: "grn_number", label: "GRN No.", headerAlign: "center" },
    { key: "aisle", label: "Aisle", headerAlign: "center" },
    { key: "rack", label: "Rack", headerAlign: "center" },
    { key: "bin", label: "Bin", headerAlign: "center" },
    { key: "product", label: "Product", headerAlign: "center" },
    { key: "qty", label: "Quantity", headerAlign: "center" },
  ];

  // ---------------- UI ----------------
  return (
    <div className="space-y-8 rounded-2xl border border-slate-200 bg-white p-3">
    

      {/* GRID */}

      <CommonDataGrid
        columns={unallocatedColumns}
        data={rackAllocationStatusList}
        loading={loading}
        showSearch={true}
        searchPlaceholder="Search by Product, Plant..."
        onSearchChange={setGridSearchText}
        defaultPageSize={defaultPageSize}
        title={heading.title}
      />

      {/* FORM */}
      {showForm && (
        <CommonModal
          isOpen={showForm}
          onClose={handleCloseForm}
          closeOnBackdropClick={false}
          title="Transfer Request"
          size="2xl"
        >
          <form onSubmit={handleSubmit}>
            <div className="space-y-1">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/25">
                    <ArchiveBoxIcon className="h-7 w-7" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                      Add allocation
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      Select subinventory and location (zone → aisle → rack → bin), then product and
                      quantity. All fields are required.
                    </p>
                  </div>
                </div>

              <div className="space-y-6 px-6 py-6">
                <div>
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Location
                  </p>
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-slate-700">
                        Subinventory <span className="text-red-500">*</span>
                      </label>
                      <SearchableInputDropdown
                        value={formData.sub_inventory}
                        onChange={(next) => handleChange("sub_inventory", next || "")}
                        options={subinventoryOptions}
                        placeholder="Select subinventory"
                        searchPlaceholder="Search subinventory"
                      />
                      {errors.sub_inventory && (
                        <p className="text-xs text-red-600">{errors.sub_inventory}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-slate-700">
                        Zone <span className="text-red-500">*</span>
                      </label>
                      <SearchableInputDropdown
                        value={formData.zone_code}
                        onChange={(next) => handleChange("zone_code", next || "")}
                        onSearchChange={setZoneSearchText}
                        options={zoneOptions}
                        placeholder="Select zone"
                        searchPlaceholder="Search zone"
                      />
                      {errors.zone_code && (
                        <p className="text-xs text-red-600">{errors.zone_code}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-slate-700">
                        Aisle <span className="text-red-500">*</span>
                      </label>
                      <SearchableInputDropdown
                        value={formData.aisle_code}
                        onChange={(next) => handleChange("aisle_code", next || "")}
                        onSearchChange={setAisleSearchText}
                        options={aisleOptions}
                        placeholder="Select aisle"
                        searchPlaceholder="Search aisle"
                      />
                      {errors.aisle_code && (
                        <p className="text-xs text-red-600">{errors.aisle_code}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-slate-700">
                        Rack <span className="text-red-500">*</span>
                      </label>
                      <SearchableInputDropdown
                        value={formData.rack_code}
                        onChange={(next) => handleChange("rack_code", next || "")}
                        onSearchChange={setRackSearchText}
                        options={rackOptions}
                        placeholder="Select rack"
                        searchPlaceholder="Search rack"
                      />
                      {errors.rack_code && (
                        <p className="text-xs text-red-600">{errors.rack_code}</p>
                      )}
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Bin <span className="text-red-500">*</span>
                      </label>
                      <SearchableInputDropdown
                        value={formData.bin_code}
                        onChange={(next) => handleChange("bin_code", next || "")}
                        onSearchChange={setBinSearchText}
                        options={binOptions}
                        placeholder="Select bin"
                        searchPlaceholder="Search bin"
                      />
                      {errors.bin_code && (
                        <p className="text-xs text-red-600">{errors.bin_code}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-100" aria-hidden />

                <div>
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Product & quantity
                  </p>
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-slate-700">
                        Product <span className="text-red-500">*</span>
                      </label>
                      <SearchableInputDropdown
                        value={formData.product_code}
                        onChange={(next) => handleChange("product_code", next || "")}
                        options={productOptions}
                        placeholder="Select product"
                        searchPlaceholder="Search product"
                      />
                      {errors.product_code && (
                        <p className="text-xs text-red-600">{errors.product_code}</p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-slate-700">
                        Quantity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={formData.allocated_qty}
                        onKeyDown={(e) => {
                          if (["-", "+", "e", "E"].includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        onChange={(e) => {
                          const value = e.target.value;
                          const numeric = Number(value);

                          const sanitizedValue =
                            value !== "" && !Number.isNaN(numeric) && numeric < 0
                              ? "0"
                              : value;

                          setFormData((p) => ({
                            ...p,
                            allocated_qty: sanitizedValue,
                          }));

                          setErrors((prev) => {
                            const next = { ...prev };

                            if (sanitizedValue === "") {
                              next.allocated_qty = "Quantity required";
                            } else if (Number(sanitizedValue) === 0) {
                              next.allocated_qty = "Quantity cannot be 0";
                            } else if (Number(sanitizedValue) > Number(maxQty)) {
                              next.allocated_qty = `Quantity cannot exceed available quantity (${maxQty})`;
                            } else {
                              delete next.allocated_qty;
                            }

                            return next;
                          });
                        }}
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                        placeholder="Enter quantity"
                      />
                      {errors.allocated_qty && (
                        <p className="text-xs text-red-600">{errors.allocated_qty}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
                <CommonButton type="button" action="close" onClick={handleCloseForm}>
                  Cancel
                </CommonButton>
                <CommonButton
                  type="submit"
                  action="create"
                  isLoading={submitting}
                  disabled={submitting}
                >
                  Add allocation
                </CommonButton>
              </div>
            </div>
          </form>
        </CommonModal>
      )}

      <CommonDataGrid
        title="Recent Allocations"
        columns={allocationColumns}
        data={allocatedGrid}
        showSearch={true}
        searchPlaceholder="Search by Product, Rack, Zone..."
        onSearchChange={setRecentAllocationsSearchText}
        defaultPageSize={defaultPageSize}
        serverPagination
        page={pagination?.current_page || 1}
        totalCount={pagination?.count || 0}
        onPageChange={(newPage) => {
          dispatch(
            fetchRackAllocationData({
              page: newPage,
              page_size: pagination?.page_size || 10,
              search: recentAllocationsSearchText.trim(),
            }),
          );
        }}
        onPageSizeChange={(newPageSize) => {
          dispatch(
            fetchRackAllocationData({
              page: 1,
              page_size: newPageSize,
              search: recentAllocationsSearchText.trim(),
            }),
          );
        }}
      />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default RackAllocation;
