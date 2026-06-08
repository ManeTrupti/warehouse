import React, { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Loader2,
  Package,
  Clock3,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ClipboardCheck,
  AlertCircle,
  ListChecks,
  Eye,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import { fetchStorePageItemCodeList } from "@core/store/slices/StorePage/storePageSlice";
import {
  createInward,
  fetchAvailableStockQty,
  fetchInventoryProducts,
  fetchInwardDashboard,
  fetchInwardList,
} from "@core/store/slices/StockRequest/stockRequestSlice";
import { fetchLocationItemCodeList } from "@core/store/slices/LocationPage/locarionPageSlice";
import { fetchWarehouseItemCodeList } from "@core/store/slices/WarehousePage/warehousePageSlice";
import {
  fetchLocationCodeList,
  fetchPlantsList,
  fetchProductList,
  fetchSubInventoriesList,
  fetchSubZonesList,
  fetchSuppliersList,
  fetchZonesList,
} from "@core/store/slices/MDM/mdmSlice";
import CommonDataGrid from "@shared/components/CommonDataGrid";
import { ToastContainer } from "@shared/components/Toast";
import { useToast } from "@shared/hooks/useToast";
import SearchableInputDropdown from "@shared/components/SearchableInputDropdown/SearchableInputDropdown";
import { CommonStatCard } from "@shared/components/CommonStatCard";
import { CommonHeading } from "@shared/components/CommonHeading";
import { CommonButton } from "@shared/components/CommonButton";
import { CommonModal } from "@shared/components/CommonModal";

const StockRequest = () => {
  const dispatch = useDispatch();
  const {
    plantList,
    // locationList,
    subInventoriesList,
    // zoneList,
    // subZoneList,
    productList: apiProductList,
    suppliersList,
  } = useSelector((state) => state.mdm);

  const { inwardList, pagination, inwardDashboardData } = useSelector(
    (state) => state.stockRequest,
  );

  const { toasts, showError, showSuccess, removeToast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [plantSearchText, setPlantSearchText] = useState("");
  const [supplierSearchText, setSupplierSearchText] = useState("");
  const [productSearchText, setProductSearchText] = useState("");
  const [productSearchByRow, setProductSearchByRow] = useState({});
  const [subInventorySearchText, setSubInventorySearchText] = useState("");
  const [availableQtyByRow, setAvailableQtyByRow] = useState({});
  const [availableQtyLoadingByRow, setAvailableQtyLoadingByRow] = useState({});

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const getTodayDateValue = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    plant_code: "Plant 1",
    inward_number: "",
    inward_date: getTodayDateValue(),
    // location_code: "",
    supplier: "",
    draft_status: "DRAFT",
    remarks: "",
  });

  const getDefaultItemRow = () => ({
    product_code: "",
    // product_code: productSearchText,
    quantity: "",
    sub_inventory: "",
    inventory_type: "",
    // zone: "",
    // sub_zone: "",
  });
  const [itemRows, setItemRows] = useState([
    { ...getDefaultItemRow(), id: Date.now() },
  ]);

  const getInitialFormData = () => ({
    plant_code: "Plant 1",
    inward_number: "",
    inward_date: getTodayDateValue(),
    // location_code: "",
    supplier: "",
    draft_status: "DRAFT",
    remarks: "",
  });

  const subInventoryOptions = (subInventoriesList?.data || [])
    .filter((s) => s?.subinventory_code === "RM_STORE")
    .map((s) => s?.subinventory_code || "")
    .filter(Boolean);

  const subInventoryTypeOptions = ["Receiving", "Storage", "Transit"];
  // const zoneOptions = (zoneList?.data || [])
  //   .map((z) => z?.zone_code || "")
  //   .filter(Boolean);
  //   console.log("zonelist",zoneOptions);

  // const subZoneOptions = (subZoneList || [])
  //   .map((sz) => sz?.subzone_code || "")
  //   .filter(Boolean);
  const plantOptions = (plantList?.data || [])
    .map((p) => ({
      id: p?.id ?? p?.plant_code ?? p?.code ?? p?.name ?? "",
      code: p?.plant_code ?? p?.code ?? p?.name ?? "",
    }))
    .filter((p) => p.code);

  const supplierOptions = (suppliersList?.data || [])
    .map((s) => ({
      name: s?.name,
      code: s?.code,
    }))
    .filter((s) => s.code);

  const inventoryProductList = (apiProductList?.data || [])
    .map((p) => ({
      ...p,
      code: p?.code ?? p?.code ?? "",
    }))
    .filter((p) => p.code);

  // const locationCodeOptions = (locationList || [])
  //   .map((l) => ({
  //     id: l?.id ?? l?.code ?? l?.location_code ?? l?.name ?? "",
  //     code: l?.code ?? l?.location_code ?? l?.name ?? "",
  //   }))
  //   .filter((l) => l.code);

  useEffect(() => {
    // dispatch(fetchLocationCodeList({ page_size: "all" }));
    // .then((res) =>
    //   setLocationCodeOptions(res?.payload || []),
    // );
    //
    // .then((res) =>
    //   setWarehouseCodeOptions(res?.payload || []),
    // );
    // dispatch(fetchSubInventoriesList({ page_size: "all" }));
    // .then((res) =>
    //     setStoreCodeOptions(res?.payload || []),
    // );
    // dispatch(fetchZonesList({ page_size: "all" }));
    // .then((res) =>
    //     setStoreCodeOptions(res?.payload || []),
    // );
    // dispatch(fetchSubZonesList({ page_size: "all" }));
    // .then((res) =>
    //     setStoreCodeOptions(res?.payload || []),
    // );

    // dispatch(fetchProductList({ page_size: "all" }));
    // dispatch(fetchSuppliersList({ page_size: "all" }));
    dispatch(fetchInwardList({ page: 1 }));
    dispatch(fetchInwardDashboard());
    // dispatch(fetchPlantsList({page_size:"all"}));
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(fetchPlantsList({ page_size: "all", search: plantSearchText }));
    }, 250);
    return () => clearTimeout(timer);
  }, [dispatch, plantSearchText]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(fetchSuppliersList({ search: supplierSearchText }));
    }, 250);
    return () => clearTimeout(timer);
  }, [dispatch, supplierSearchText]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(
        fetchProductList({
          page_size: "all",
          search: productSearchText,
          type: "RM",
        }),
      );
      // resetRequestForm();
    }, 500);
    return () => clearTimeout(timer);
  }, [dispatch, productSearchText]);

  console.log(productSearchText);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(
        fetchSubInventoriesList({
          page_size: "all",
          search: subInventorySearchText,
        }),
      );
    }, 250);
    return () => clearTimeout(timer);
  }, [dispatch, subInventorySearchText]);

  const handleRowChange = (rowId, key, value) => {
    let updatedRow = null;
    setItemRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        updatedRow = { ...row, [key]: value };
        return updatedRow;
      }),
    );

    if (updatedRow) {
      fetchAvailableQtyForRow(rowId, updatedRow, formData.plant_code);
    }
  };

  const fetchAvailableQtyForRow = async (rowId, rowData, plantCode) => {
    if (!plantCode || !rowData?.product_code || !rowData?.sub_inventory) {
      setAvailableQtyByRow((prev) => ({ ...prev, [rowId]: "" }));
      setAvailableQtyLoadingByRow((prev) => ({ ...prev, [rowId]: false }));
      return;
    }

    setAvailableQtyLoadingByRow((prev) => ({ ...prev, [rowId]: true }));
    try {
      const response = await dispatch(
        fetchAvailableStockQty({
          product_code: rowData.product_code,
          plant: plantCode,
          sub_inventory: rowData.sub_inventory,
        }),
      ).unwrap();

      const qty =
        response?.data?.available_qty ?? response?.available_qty ?? "";
      setAvailableQtyByRow((prev) => ({ ...prev, [rowId]: qty }));
    } catch (_) {
      setAvailableQtyByRow((prev) => ({ ...prev, [rowId]: "" }));
    } finally {
      setAvailableQtyLoadingByRow((prev) => ({ ...prev, [rowId]: false }));
    }
  };

  const addNewRow = () => {
    setItemRows((prev) => [
      ...prev,
      { ...getDefaultItemRow(), id: Date.now() },
    ]);
  };

  const resetRequestForm = () => {
    setFormData(getInitialFormData());
    setItemRows([{ ...getDefaultItemRow(), id: Date.now() }]);
    setAvailableQtyByRow({});
    setAvailableQtyLoadingByRow({});
    setErrors({});
    setDate(getTodayDateValue());
  };

  const handleToggleRequestForm = () => {
    if (showForm) {
      setShowForm(false);
      resetRequestForm();
      return;
    }
    resetRequestForm();
    setShowForm(true);
  };

  const handleCancelRequestForm = () => {
    setShowForm(false);
    resetRequestForm();
  };

  const handleFormFieldChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      if (String(value ?? "").trim()) {
        delete next[key];
      }
      return next;
    });
  };

  const removeRow = (rowId) => {
    setItemRows((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((row) => row.id !== rowId);
    });
    setAvailableQtyByRow((prev) => {
      const next = { ...prev };
      delete next[rowId];
      return next;
    });
    setAvailableQtyLoadingByRow((prev) => {
      const next = { ...prev };
      delete next[rowId];
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    // if (!formData.inward_number)
    //   newErrors.inward_number = "Inward number required";
    if (!formData.plant_code) newErrors.plant_code = "Plant  required";
    if (!formData.inward_date) newErrors.inward_date = "Inward date required";
    if (!formData.supplier) newErrors.supplier = "Supplier required";
    if (!itemRows?.length)
      newErrors.items = "At least one item row is required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);
    const payload = {
      plant: formData.plant_code,
      location_code: formData.location_code,
      supplier: formData.supplier,
      remarks: formData.remarks,
      inward_date: formData.inward_date,

      // Strip UI-only row `id` before sending payload
      items: itemRows.map(({ id, ...rest }) => rest),
    };

    try {
      await dispatch(createInward(payload)).unwrap();
      showSuccess("InWard Created Successfully");
      dispatch(fetchInwardList({ page: 1 }));
      dispatch(fetchInwardDashboard());

      handleCancelRequestForm();
    } catch (err) {
      const errorMessage =
        "Please fill in all required fields" ||
        err?.details?.message ||
        err?.message ||
        err?.response?.data?.message ||
        err?.response?.data?.error;
      // "Failed to save breakdown. Please try again.";
      showError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const inwardColumns = [
    {
      key: "inward_number",
      label: "Inward Number",
      headerAlign: "center",
    },
    {
      key: "plant",
      label: "Plant",
      headerAlign: "center",
    },
    // {
    //   key: "location_code",
    //   label: "Location",
    //   headerAlign: "center",
    // },
    {
      key: "supplier",
      label: "Supplier",
      headerAlign: "center",
    },
    {
      key: "inward_date",
      label: "Inward Date",
      headerAlign: "center",
      render: (val) => <div style={{ textAlign: "center" }}>{val}</div>,
    },
    {
      key: "items",
      label: "Items",
      headerAlign: "center",
      render: (val) => (
        <div style={{ textAlign: "center" }}>{val?.length || 0}</div>
      ),
    },
    // {
    //   key: "status",
    //   label: "Status",
    //   headerAlign: "center",
    //   render: (_, row) => (
    //     <div style={{ textAlign: "center" }}>
    //       <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs">
    //         Posted
    //       </span>
    //     </div>
    //   ),
    // },
    {
      key: "actions",
      label: "Actions",
      headerAlign: "center",
      render: (_, row) => (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => handleView(row)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-200 bg-white text-indigo-600 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-400/50"
            aria-label={`View line items for ${row.inward_number ?? "inward"}`}
          >
            <Eye className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      ),
    },
  ];

  const handleView = (row) => {
    setSelectedRow(row);
    setOpenDialog(true);
  };

  const renderExpandedRow = (row) => {
    return (
      <div className="p-3 bg-gray-50">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Product</th>
              <th className="border p-2">Qty</th>
              <th className="border p-2">Sub Inventory</th>
              <th className="border p-2">Type</th>
              {/* <th className="border p-2">Zone</th>
              <th className="border p-2">Sub Zone</th> */}
            </tr>
          </thead>
          <tbody>
            {row.items?.map((item, i) => (
              <tr key={i}>
                <td className="border p-2">{item.product_code}</td>
                <td className="border p-2">{item.quantity}</td>
                <td className="border p-2">{item.sub_inventory}</td>
                <td className="border p-2">{item.inventory_type}</td>
                {/* <td className="border p-2">{item.zone}</td>
                <td className="border p-2">{item.sub_zone}</td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-8 rounded-2xl border border-slate-200 bg-white p-3">
      <CommonHeading
        title="Inward (GRN)"
        subtitle="Capture and track goods receipt notes."
        rightContent={
          <CommonButton
            type="button"
            size="sm"
            action="add"
            onClick={() => {
              resetRequestForm();
              setShowForm(true);
            }}
          >
            New Request
          </CommonButton>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 px-5">
        <CommonStatCard
          title="Total GRNS"
          value={inwardDashboardData.total_grns || 0}
          toneIndex={0}
        />
        <CommonStatCard
          title="Today"
          value={inwardDashboardData.today_grns || 0}
          toneIndex={1}
        />
        <CommonStatCard
          title="Total Quantity Received"
          value={inwardDashboardData.total_quantity_received || 0}
          toneIndex={2}
          icon={ClipboardCheck}
        />
        <CommonStatCard
          title="Top Supplier"
          value={`${inwardDashboardData?.top_supplier?.supplier || "-"}`}
          toneIndex={3}
          icon={AlertCircle}
        />
        <CommonStatCard
          title="Top Product"
          value={`${inwardDashboardData?.top_product?.product_code || "-"}`}
          // value={`${inwardDashboardData.top_product.product_code}(${inwardDashboardData.top_product.total_quantity})`}
          toneIndex={4}
          icon={AlertTriangle}
        />
      </div>

      {showForm && (
        <CommonModal
          isOpen={showForm}
          onClose={handleCancelRequestForm}
          closeOnBackdropClick={false}
          title="Inward Request"
          size="2xl"
        >
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="flex justify-end">
              <span className="rounded-md bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                {formData.draft_status}
              </span>
            </div>

            <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-2">
              {/* <div>
              <label className="text-sm font-medium text-slate-700">
                Location *
              </label>
              <select
                value={formData.location_code}
                onChange={(e) => {
                  const value = e.target.value;

                  setFormData((prev) => ({
                    ...prev,
                    location_code: value,
                    plant_code: value ? prev.plant_code : "",
                  }));
                }}
                className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
              >
                <option value="">Select location</option>
                {locationCodeOptions.map((item) => (
                  <option key={item.id} value={item.code}>
                    {item.code}
                  </option>
                ))}
              </select>
              {errors.location_code && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.location_code}
                </p>
              )}
            </div> */}

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Plant <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <SearchableInputDropdown
                    value={formData.plant_code}
                    onChange={(next) => {
                      const selectedPlant = next || "";
                      handleFormFieldChange("plant_code", selectedPlant);
                      itemRows.forEach((row) => {
                        fetchAvailableQtyForRow(row.id, row, selectedPlant);
                      });
                    }}
                    options={plantOptions.map((plant) => plant.code)}
                    placeholder="Select plant"
                    searchPlaceholder="Search plant"
                    onSearchChange={setPlantSearchText}
                  />
                </div>
                {errors.plant_code && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.plant_code}
                  </p>
                )}
              </div>

              {/* <div>
              <label className="text-sm font-medium text-slate-700">
                Inward Number *
              </label>
              <input
                type="text"
                value={formData.inward_number}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    inward_number: e.target.value,
                  }))
                }
                className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
                placeholder="Enter inward number"
              />
              {errors.inward_number && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.inward_number}
                </p>
              )}
            </div> */}

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Inward Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  // defaultValue={today}
                  // value={formData.inward_date}
                  value={formData.inward_date || date}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      inward_date: e.target.value,
                    }))
                  }
                  className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
                />
                {errors.inward_date && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.inward_date}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Supplier <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <SearchableInputDropdown
                    value={formData.supplier}
                    onChange={(next) =>
                      handleFormFieldChange("supplier", next || "")
                    }
                    options={supplierOptions.map((s) => s.name)}
                    placeholder="Select supplier"
                    searchPlaceholder="Search supplier"
                    onSearchChange={setSupplierSearchText}
                  />
                </div>
                {errors.supplier && (
                  <p className="mt-1 text-xs text-red-500">{errors.supplier}</p>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="mb-3 text-lg font-semibold text-slate-900">
                Items<span className="text-red-500">*</span>
              </h3>
              <div className="space-y-6">
                {itemRows.map((row) => (
                  <div
                    key={row.id}
                    className="grid gap-3 rounded-md border border-slate-200 p-3 md:grid-cols-9"
                  >
                    <div className="md:col-span-3">
                      {/* <SearchableInputDropdown
                      value={row.product_code}
                      onChange={(next) =>
                        handleRowChange(row.id, "product_code", next || "")
                      }
                      options={inventoryProductList.map((item) => item.code)}
                      placeholder="Product Code *"
                      searchPlaceholder="Search product code"
                      onSearchChange={setProductSearchText}
                    /> */}

                      <SearchableInputDropdown
                        value={row.product_code}
                        onChange={(next) => {
                          handleRowChange(row.id, "product_code", next || "");

                          setProductSearchByRow((prev) => ({
                            ...prev,
                            [row.id]: next || "",
                          }));
                        }}
                        options={inventoryProductList.map((item) => item.code)}
                        placeholder="Product Code *"
                        searchPlaceholder="Search product code"
                        searchValue={productSearchByRow[row.id] || ""}
                        onSearchChange={setProductSearchText}
                      />
                      {errors.product_code && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.product_code}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <SearchableInputDropdown
                        value={row.sub_inventory}
                        onChange={(next) =>
                          handleRowChange(row.id, "sub_inventory", next || "")
                        }
                        options={subInventoryOptions}
                        placeholder="Sub Inventory"
                        searchPlaceholder="Search sub inventory"
                        onSearchChange={setSubInventorySearchText}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <SearchableInputDropdown
                        value={row.inventory_type}
                        onChange={(next) =>
                          handleRowChange(row.id, "inventory_type", next || "")
                        }
                        options={subInventoryTypeOptions}
                        placeholder="Type of Sub Inventory"
                        searchPlaceholder="Search type"
                      />
                    </div>

                    <div className="md:col-span-1 space-y-2">
                      <input
                        type="text"
                        readOnly
                        value={
                          availableQtyLoadingByRow[row.id]
                            ? "Loading..."
                            : (availableQtyByRow[row.id] ?? "")
                        }
                        className="h-10 w-full rounded-md border border-slate-300 bg-slate-100 px-2 text-sm"
                        placeholder="Available Qty"
                      />
                      <input
                        type="number"
                        min="0"
                        value={row.quantity}
                        onChange={(e) =>
                          handleRowChange(row.id, "quantity", e.target.value)
                        }
                        className="h-10 w-full rounded-md border border-slate-300 px-2 text-sm"
                        placeholder="Qty *"
                      />
                    </div>

                    {/* <select
                    value={row.zone}
                    onChange={(e) =>
                      handleRowChange(row.id, "zone", e.target.value)
                    }
                    className="h-10 rounded-md border border-slate-300 px-2 text-sm md:col-span-2"
                  >
                    <option value="">Zone</option>
                    {zoneOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>

                  <select
                    value={row.sub_zone}
                    onChange={(e) =>
                      handleRowChange(row.id, "sub_zone", e.target.value)
                    }
                    className="h-10 rounded-md border border-slate-300 px-2 text-sm md:col-span-1"
                  >
                    <option value="">Sub Zone</option>
                    {subZoneOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select> */}

                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      className="inline-flex h-10 items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50 md:col-span-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {errors.items && (
                <p className="mt-2 text-xs text-red-500">{errors.items}</p>
              )}

              <button
                type="button"
                onClick={addNewRow}
                className="mt-3 inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700"
              >
                <Plus size={14} />
                Add Row
              </button>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <label className="text-sm font-medium text-slate-700">
                Remarks
              </label>
              <input
                type="text"
                value={formData.remarks}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, remarks: e.target.value }))
                }
                className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm"
                placeholder="Add remarks"
              />
            </div>

            <div className="flex justify-end gap-3">
              <CommonButton
                type="button"
                action="cancel"
                onClick={handleCancelRequestForm}
              >
                Cancel
              </CommonButton>
              <CommonButton type="submit" action="save" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : null}
                Add
              </CommonButton>
            </div>
          </form>
        </CommonModal>
      )}
      <CommonDataGrid
        columns={inwardColumns}
        data={inwardList}
        showSearch={false}
        // expandable
        // renderExpandedRow={renderExpandedRow}
        // page={pagination.current_page}
        // serverPagination
        // totalCount={pagination.count}
        // onPageChange={(newPage) => {
        //   const pageSize = pagination?.pageSize || 10;
        //   dispatch(
        //     fetchInventoryStocks({
        //       page: newPage,
        //       pageSize,
        //     }),
        //   );
        // }}
        // onPageSizeChange={(newPageSize) => {
        //   dispatch(
        //     fetchInventoryStocks({
        //       page: 1,
        //       pageSize: newPageSize,
        //     }),
        //   );
        // }}
      />

      <CommonModal
        isOpen={openDialog}
        onClose={() => setOpenDialog(false)}
        title={
          selectedRow?.inward_number
            ? `Line items · ${selectedRow.inward_number}`
            : "Line items"
        }
        size="lg"
      >
        {selectedRow && (
          <div className="space-y-6">
            <p className="text-sm text-slate-600">
              Received products for this goods receipt. Quantities shown as
              captured on the GRN.
            </p>

            <dl className="grid gap-4 rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="min-w-0">
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Plant
                </dt>
                <dd className="mt-1 truncate text-sm font-semibold text-slate-900">
                  {selectedRow.plant ?? "—"}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Supplier
                </dt>
                <dd className="mt-1 truncate text-sm font-semibold text-slate-900">
                  {selectedRow.supplier ?? "—"}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Inward date
                </dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900">
                  {selectedRow.inward_date ?? "—"}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Lines
                </dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900">
                  {selectedRow.items?.length ?? 0}
                </dd>
              </div>
            </dl>

            <div>
              <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <Package className="h-4 w-4 text-violet-500" aria-hidden />
                Products
              </h4>
              <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
                <div className="max-h-[min(420px,50vh)] overflow-auto">
                  <table className="w-full min-w-[520px] text-sm">
                    <thead className="sticky top-0 z-10 bg-slate-100">
                      <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                        <th className="whitespace-nowrap px-4 py-3">Product</th>
                        <th className="whitespace-nowrap px-4 py-3 text-right">
                          Qty
                        </th>
                        <th className="whitespace-nowrap px-4 py-3">
                          Sub inventory
                        </th>
                        <th className="whitespace-nowrap px-4 py-3">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {selectedRow.items?.length ? (
                        selectedRow.items.map((item, i) => (
                          <tr
                            key={item.id ?? i}
                            className="transition-colors hover:bg-slate-50/80"
                          >
                            <td className="px-4 py-3 font-medium text-slate-900">
                              {item.product_code ?? "—"}
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums text-slate-800">
                              {item.quantity ?? "—"}
                            </td>
                            <td className="px-4 py-3 text-slate-700">
                              {item.sub_inventory ?? "—"}
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-800 ring-1 ring-inset ring-violet-200">
                                {item.inventory_type ?? "—"}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-4 py-10 text-center text-sm text-slate-500"
                          >
                            No line items for this inward.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </CommonModal>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default StockRequest;
