import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  CheckCircle2,
  Package,
  ClipboardList,
  Loader2,
  AlertTriangle,
  AlertCircle,
  ClipboardCheck,
  ListChecks,
} from "lucide-react";
import CommonDataGrid from "@shared/components/CommonDataGrid";
import { CommonHeading } from "@shared/components/CommonHeading";
import { CommonStatCard } from "@shared/components/CommonStatCard";
import { fetchProductTransferList } from "@core/store/slices/ProductTransfer/productTransferSlice";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchRequisitionData,
  updateRequisitionQty,
  createRequisitionIssue,
} from "@core/store/slices/Requisition/requisitionSlice";
import { ToastContainer } from "@shared/components/Toast";
import { useToast } from "@shared/hooks/useToast";
/*
  API imports kept for later use (static mode now).
  import { useDispatch, useSelector } from "react-redux";
  import { fetchStocksIssuesItemCodeList } from "@core/store/slices/StockIssues/stockIssuesSlice";
  import { fetchStorePageItemCodeList } from "@core/store/slices/StorePage/storePageSlice";
  import { createInward, fetchInventoryProducts } from "@core/store/slices/StockRequest/stockRequestSlice";
  import { fetchLocationItemCodeList } from "@core/store/slices/LocationPage/locarionPageSlice";
  import { fetchWarehouseItemCodeList } from "@core/store/slices/WarehousePage/warehousePageSlice";
*/

const StockIssues = () => {
  const dispatch = useDispatch();
  // const { stockIssuesItemList } = useSelector((state) => state.stockIssues);
  // const { storePageItemList } = useSelector((state) => state.storePage);
  // const { inventoryProductList } = useSelector((state) => state.stockRequest);
  const {
    requisitionList: stockIssueList,
    loading,
    pagination,
  } = useSelector((state) => state.requisition);

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [locationCodeOptions, setLocationCodeOptions] = useState([]);

  const [errors, setErrors] = useState({});
  const [storeCodeOptions, setStoreCodeOptions] = useState([]);
  const [warehouseCodeOptions, setWarehouseCodeOptions] = useState([]);
  const [selectStorageType, setSelectStorageType] = useState("store");

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [editRowId, setEditRowId] = useState(null);
  const [editedQtyByRow, setEditedQtyByRow] = useState({});
  const [actionLoadingByRow, setActionLoadingByRow] = useState({});
  const { toasts, showError, showSuccess, removeToast } = useToast();

  const [formData, setFormData] = useState({
    plant_code: "",
    location_code: "",
    reference_type: "",
    reference_number: "",
    issue_type: "",
    issue_date: "",
  });

  /* ---------------- STATIC DATA ---------------- */

  const itemMasters = [
    { id: 1, item_name: "Gear Box", sku_no: "GBX-100" },
    { id: 2, item_name: "Motor Shaft", sku_no: "MS-200" },
    { id: 3, item_name: "Bearing", sku_no: "BRG-300" },
  ];

  const subzones = [
    { id: 1, name: "A1", zone_name: "Zone A", warehouse_name: "Main WH" },
    { id: 2, name: "B1", zone_name: "Zone B", warehouse_name: "Main WH" },
  ];

  const availableSourceOptions = [
    { subzoneId: 1, subzoneName: "A1", quantity: 120 },
    { subzoneId: 2, subzoneName: "B1", quantity: 75 },
  ];

  const metrics = {
    total: 12,
    pending: 4,
    issued: 6,
    rejected: 1,
    overdue: 1,
  };

  const issueNumber = useMemo(() => "ISS-2024-AUTO", []);

  const plantOptions = [
    {
      id: 1,
      label: "Plant 01 - Main Facility",
      value: "Plant 01 - Main Facility",
    },
    {
      id: 2,
      label: "Plant 02 - Secondary Facility",
      value: "Plant 02 - Secondary Facility",
    },
  ];

  const referenceTypeOptions = [
    { id: 1, label: "Production", value: "PRODUCTION" },
    { id: 2, label: "Maintenance", value: "MAINTENANCE" },
    { id: 3, label: "General", value: "GENERAL" },
  ];

  const referenceNumberOptions = [
    { id: 1, label: "REF-0001", value: "REF-0001" },
    { id: 2, label: "REF-0002", value: "REF-0002" },
    { id: 3, label: "REF-0003", value: "REF-0003" },
  ];

  const issueTypeOptions = [
    { id: 1, label: "Issue to Production", value: "ISSUE_TO_PRODUCTION" },
    { id: 2, label: "Issue to Maintenance", value: "ISSUE_TO_MAINTENANCE" },
    { id: 3, label: "General Issue", value: "GENERAL_ISSUE" },
  ];

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!formData.plant_code) newErrors.plant_code = "Plant required";
    if (!formData.location_code) newErrors.location_code = "Location required";
    if (!formData.reference_type)
      newErrors.reference_type = "Reference type required";
    if (!formData.reference_number)
      newErrors.reference_number = "Reference number required";
    if (!formData.issue_type) newErrors.issue_type = "Issue type required";
    if (!formData.issue_date) newErrors.issue_date = "Issue date required";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);

    const payload = {
      ...formData,
      issue_number: issueNumber,
      storage_type: selectStorageType,
    };

    // API submit intentionally disabled for now (UI-only).
    // dispatch(createInward(payload));
    console.log("Static stock issue payload:", payload);
    setFormData({
      plant_code: "",
      location_code: "",
      reference_type: "",
      reference_number: "",
      issue_type: "",
      issue_date: "",
    });

    setSubmitting(false);
    setShowForm(false);
  };

  useEffect(() => {
    dispatch(fetchRequisitionData({ page: 1 }));
  }, [dispatch]);

  // useEffect(() => {
  //   dispatch(
  //     fetchStocksIssuesItemCodeList({
  //       page_size: "all",
  //     }),
  //   );
  //   dispatch(
  //     fetchStorePageItemCodeList({
  //       page_size: "all",
  //     }),
  //   );
  // }, [dispatch]);

  // const plantIdOptions = stockIssuesItemList.map((plant) => {
  //   const plantId = plant.plant_code;
  //   return plantId;
  // });

  // const storeIdOptions = storePageItemList.map((store)=>{
  //   const storeId = store.store_code
  // })

  const getStatusConfig = (status) => {
    const normalizedStatus = String(status || "").toLowerCase();

    const statusMap = {
      open: {
        label: "Open",
        className: "bg-yellow-100 text-yellow-700",
      },
      accepted: {
        label: "Accepted",
        className: "bg-green-100 text-green-700",
      },
      rejected: {
        label: "Rejected",
        className: "bg-red-100 text-red-700",
      },
      closed: {
        label: "Closed",
        className: "bg-blue-100 text-blue-700",
      },
    };

    return (
      statusMap[normalizedStatus] || {
        label: status || "-",
        className: "bg-gray-100 text-gray-700",
      }
    );
  };

  useEffect(() => {
    // API fetches intentionally disabled for now (static mode).
    // dispatch(fetchInventoryProducts());
    // dispatch(fetchLocationItemCodeList({ page_size: "all" })).then((res) =>
    //   setLocationCodeOptions(res?.payload || []),
    // );
    // dispatch(fetchWarehouseItemCodeList({ page_size: "all" })).then((res) =>
    //   setWarehouseCodeOptions(res?.payload || []),
    // );
    // dispatch(fetchStorePageItemCodeList({ page_size: "all" })).then((res) =>
    //   setStoreCodeOptions(res?.payload || []),
    // );

    setLocationCodeOptions([
      { id: 1, code: "Location A" },
      { id: 2, code: "Location B" },
      { id: 3, code: "Location C" },
    ]);
    setWarehouseCodeOptions([
      { id: 1, code: "WH-001" },
      { id: 2, code: "WH-002" },
    ]);
    setStoreCodeOptions([
      { id: 1, store_code: "Store-01" },
      { id: 2, store_code: "Store-02" },
    ]);
  }, []);

  const formatSubInventory = (row) => {
    if (row?.sub_inventory) return row.sub_inventory;
    const from = row?.from_sub_inventory;
    const to = row?.to_sub_inventory;
    if (from || to) return [from, to].filter(Boolean).join(" → ");
    return "—";
  };

  const stockIssueColumns = [
    {
      key: "requisition_num",
      label: "Requisition Num",
      headerAlign: "center",
    },
    {
      key: "product",
      label: "Product Code",
      headerAlign: "center",
    },
    {
      key: "workstation",
      label: "To Workstation",
      headerAlign: "center",
    },
    {
      key: "sub_inventory",
      label: "Sub Inventory",
      headerAlign: "center",
      render: (_, row) => (
        <span
          className="inline-block max-w-[14rem] truncate"
          title={formatSubInventory(row)}
        >
          {formatSubInventory(row)}
        </span>
      ),
    },

    // new code
    {
      key: "remaining_quantity",
      label: "Remaining Qty/Total Qty",

      headerAlign: "center",

      render: (_, row) => {
        const isEditing = editRowId === row.id;

        const totalQty = Number(row.quantity || 0);

        return (
          <div className="flex justify-center">
            {isEditing ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={
                    editedQtyByRow[row.id] !== undefined
                      ? editedQtyByRow[row.id]
                      : String(row.remaining_quantity || "")
                  }
                  

                  onChange={(e) => {
                    const value = e.target.value;

                    // block minus
                    if (value.includes("-")) {
                      showError("Quantity cannot be negative");
                      return;
                    }

                    // allow only positive decimal numbers
                    const cleanValue = value.replace(/[^0-9.]/g, "");

                    // prevent multiple decimals
                    const decimalCount = (cleanValue.match(/\./g) || []).length;

                    if (decimalCount > 1) {
                      showError("Only one decimal point is allowed");
                      return;
                    }

                    // block 0
                    if (Number(cleanValue) === 0 && cleanValue !== "") {
                      showError("Quantity cannot be 0");
                      return;
                    }

                    // block greater than total qty
                    if (Number(cleanValue) > totalQty) {
                      showError(
                        "Remaining quantity cannot exceed total quantity",
                      );
                      return;
                    }

                    setEditedQtyByRow((prev) => ({
                      ...prev,
                      [row.id]: cleanValue,
                    }));
                  }}
                  className="h-8 w-16 rounded border border-slate-300 px-2 text-sm outline-none focus:outline-none focus:ring-0"
                />

                <span className="text-sm font-semibold text-slate-700">
                  / {totalQty}
                </span>
              </div>
            ) : (
              <span>
                {row.remaining_quantity}/{totalQty}
              </span>
            )}
          </div>
        );
      },
    },

    {
      key: "issued_quantity",
      label: "Issued Qty",
      headerAlign: "center",
    },
    {
      key: "available_qty",
      label: "Available Qty",
      headerAlign: "center",
    },
    {
      key: "status",
      label: "Status",
      headerAlign: "center",
      render: (val) => {
        const { label, className } = getStatusConfig(val);

        return (
          <div style={{ textAlign: "center" }}>
            <span className={`px-2 py-1 rounded text-xs ${className}`}>
              {label}
            </span>
          </div>
        );
      },
    },

    // updated
    {
      key: "actions",
      label: "Actions",
      headerAlign: "center",

      render: (_, row) => {
        const isEditing = editRowId === row.id;

        const loadingAction = !!actionLoadingByRow[row.id];

        const normalizedStatus = String(row?.status || "").toLowerCase();

        const isFinalStatus =
          normalizedStatus === "accept" ||
          normalizedStatus === "accepted" ||
          normalizedStatus === "rejected" ||
          normalizedStatus === "closed";

        return (
          <div className="flex items-center justify-center gap-2">
            {/* Edit */}
            <div className="flex w-6 justify-center">
              {!isFinalStatus && (
                <button
                  type="button"
                  className="text-blue-600"
                  onClick={() => {
                    setEditRowId(row.id);

                    setEditedQtyByRow((prev) => ({
                      ...prev,
                      [row.id]: String(row.remaining_quantity || ""),
                    }));
                  }}
                >
                  <Pencil className="h-4 w-4 text-indigo-600" strokeWidth={2} />
                </button>
              )}
            </div>

            {/* Cancel */}
            {isEditing && (
              <button
                type="button"
                className="text-red-600 font-semibold"
                onClick={() => {
                  setEditRowId(null);

                  setEditedQtyByRow((prev) => {
                    const next = { ...prev };

                    delete next[row.id];

                    return next;
                  });
                }}
              >
                ✕
              </button>
            )}

            {/* Action */}
            <select
              value=""
              disabled={!isEditing || loadingAction}
              onChange={async (e) => {
                const selectedAction = e.target.value;

                if (!selectedAction) return;

                const qtyToSend = Number(
                  editedQtyByRow[row.id] !== undefined
                    ? editedQtyByRow[row.id]
                    : row.remaining_quantity,
                );

                if (!qtyToSend || qtyToSend <= 0) {
                  showError("Quantity must be greater than 0");
                  return;
                }

                if (qtyToSend > Number(row.quantity || 0)) {
                  showError("Remaining quantity cannot exceed total quantity");
                  return;
                }

                setActionLoadingByRow((prev) => ({
                  ...prev,
                  [row.id]: true,
                }));

                try {
                  const payload = {
                    requisition: row.id,
                    quantity: qtyToSend,
                    status: selectedAction,
                  };

                  const result = await dispatch(
                    createRequisitionIssue(payload),
                  ).unwrap();

                  showSuccess(
                    result?.message ||
                      `Requisition ${selectedAction} updated successfully`,
                  );

                  await dispatch(fetchRequisitionData({ page: 1 }));

                  setEditRowId(null);

                  setEditedQtyByRow((prev) => {
                    const next = { ...prev };

                    delete next[row.id];

                    return next;
                  });
                } catch (error) {
                  showError(
                    error?.message ||
                      error?.data?.message ||
                      "Failed to update requisition",
                  );
                } finally {
                  setActionLoadingByRow((prev) => ({
                    ...prev,
                    [row.id]: false,
                  }));
                }
              }}
              className="h-8 rounded border border-slate-300 bg-white px-2 text-xs disabled:bg-slate-100 disabled:text-slate-400"
            >
              <option value="">Select</option>
              <option value="accepted">Accept</option>
              <option value="rejected">Reject</option>
            </select>
          </div>
        );
      },
    },
  ];

  const renderRequisitionIssuesExpanded = (parentRow) => {
    const issues = parentRow?.requisition_issues || [];
    if (!issues.length) return null;

    const issueSubColumns = stockIssueColumns.filter((c) =>
      [
        "requisition_num",
        "product",
        "workstation",
        "sub_inventory",
        "remaining_quantity",
      ].includes(c.key),
    );

    return (
      <div className="border-t border-slate-100 bg-slate-50/90 px-2 pb-3 pt-2">
        <p className="mb-2 px-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          Requisition issues
        </p>
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full min-w-[28rem] border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold text-slate-700">
                {issueSubColumns.map((col) => (
                  <th
                    key={col.key}
                    className={`border-b border-slate-200 px-3 py-2 ${
                      col.headerAlign === "center" ? "text-center" : "text-left"
                    }`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {issues.map((issue) => (
                <tr
                  key={issue.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80"
                >
                  {issueSubColumns.map((col) => {
                    if (col.key === "sub_inventory") {
                      return (
                        <td key={col.key} className="px-3 py-2 text-center">
                          <span
                            className="inline-block max-w-[14rem] truncate"
                            title={formatSubInventory(parentRow)}
                          >
                            {formatSubInventory(parentRow)}
                          </span>
                        </td>
                      );
                    }
                    if (col.key === "remaining_quantity") {
                      return (
                        <td
                          key={col.key}
                          className="px-3 py-2 text-center tabular-nums"
                          title={
                            issue.requested_quantity != null ||
                            issue.requisition_remaining_quantity != null
                              ? `Requested: ${issue.requested_quantity ?? "—"}, remaining (record): ${issue.requisition_remaining_quantity ?? "—"}`
                              : undefined
                          }
                        >
                          {issue.quantity ?? "—"}
                        </td>
                      );
                    }
                    return (
                      <td
                        key={col.key}
                        className="px-3 py-2 text-center text-slate-800"
                      >
                        {parentRow[col.key] ?? "—"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 rounded-2xl border border-slate-200 bg-white p-3">
      {/* HEADER */}  

      <CommonHeading
        title="Stock Issue"
        subtitle="Capture and track stock movement or issue requests."
      />

      {/* METRICS */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 px-4">
        <CommonStatCard
          title="Total Requests"
          value={metrics.total || 0}
          toneIndex={0}
          icon={ListChecks}
        />
        <CommonStatCard
          title="Pending"
          value={metrics.pending || 0}
          toneIndex={1}
          icon={ListChecks}
        />
        <CommonStatCard
          title="Issued"
          value={metrics.issued || 0}
          toneIndex={2}
          icon={ClipboardCheck}
        />
        <CommonStatCard
          title="Rejected"
          value={metrics.rejected || 0}
          toneIndex={3}
          icon={AlertCircle}
        />
        <CommonStatCard
          title="Overdue"
          value={metrics.overdue || 0}
          toneIndex={4}
          icon={AlertTriangle}
        />
      </div>

      {/* FORM */}

      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-inner">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-2xl font-semibold text-slate-900">
              Material Issue
            </h3>
            <span className="rounded-md bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
              DRAFT
            </span>
          </div>

          <form className="mt-5 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Plant *
                  </label>
                  <select
                    value={formData.plant_code}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, plant_code: e.target.value }))
                    }
                    className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm"
                  >
                    <option value="">Select plant</option>
                    {plantOptions.map((opt) => (
                      <option key={opt.id} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {errors.plant_code && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.plant_code}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Reference Type *
                  </label>
                  <select
                    value={formData.reference_type}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        reference_type: e.target.value,
                      }))
                    }
                    className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm"
                  >
                    <option value="">Select reference type</option>
                    {referenceTypeOptions.map((opt) => (
                      <option key={opt.id} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {errors.reference_type && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.reference_type}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Location *
                  </label>
                  <select
                    value={formData.location_code}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        location_code: e.target.value,
                      }))
                    }
                    className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm"
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
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Reference Number *
                  </label>
                  <select
                    value={formData.reference_number}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        reference_number: e.target.value,
                      }))
                    }
                    className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm"
                  >
                    <option value="">Search and select reference</option>
                    {referenceNumberOptions.map((opt) => (
                      <option key={opt.id} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {errors.reference_number && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.reference_number}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Issue Number
                  </label>
                  <input
                    type="text"
                    value={issueNumber}
                    readOnly
                    className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-slate-100 px-3 text-sm text-slate-700"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Auto-generated upon posting
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">
                    Issue Type *
                  </label>
                  <select
                    value={formData.issue_type}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, issue_type: e.target.value }))
                    }
                    className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm"
                  >
                    <option value="">Select issue type</option>
                    {issueTypeOptions.map((opt) => (
                      <option key={opt.id} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {errors.issue_type && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.issue_type}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Issue Date *
                  </label>
                  <input
                    type="date"
                    value={formData.issue_date}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, issue_date: e.target.value }))
                    }
                    className="mt-1 h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm md:max-w-[50%]"
                  />
                  {errors.issue_date && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.issue_date}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Save Draft
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-md bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <ClipboardList size={16} />
                )}
                Post Issue
              </button>
            </div>
          </form>
        </div>
      )}

      <CommonDataGrid
        columns={stockIssueColumns}
        data={stockIssueList}
        showSearch={true}
        loading={loading}
        expandable
        expandColumnAtStart
        isRowExpandable={(row) =>
          Array.isArray(row?.requisition_issues) &&
          row.requisition_issues.length > 0
        }
        renderExpandedRow={renderRequisitionIssuesExpanded}
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
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default StockIssues;
