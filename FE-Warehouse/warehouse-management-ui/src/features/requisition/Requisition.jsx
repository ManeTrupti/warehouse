import { useEffect, useMemo, useState } from "react";
import CommonDataGrid from "@shared/components/CommonDataGrid";
import {
  fetchProductList,
  fetchSubInventoriesList,
  fetchWorkstationsList,
} from "@core/store/slices/MDM/mdmSlice";
import {
  createRequisition,
  fetchRequisitionData,
} from "@core/store/slices/Requisition/requisitionSlice";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "@shared/components/Toast";
import { useToast } from "@shared/hooks/useToast";
import SearchableInputDropdown from "@shared/components/SearchableInputDropdown";
import { Trash2 } from "lucide-react";
import { CommonButton } from "@shared/components/CommonButton";
import { CommonModal } from "@shared/components/CommonModal";
import { CommonHeading } from "@shared/components/CommonHeading";

const INITIAL_REQUISITIONS = [
  {
    id: "REQ-3001",
    date: "2026-04-17",
    requestedFor: "WS-01 Assembly",
    subinventory: "Sub-01",
    product: "Steel Rods",
    quantity: 100,
    status: "Open",
  },
  {
    id: "REQ-3002",
    date: "2026-04-16",
    requestedFor: "WS-02 Packing",
    subinventory: "Sub-02",
    product: "Bolts",
    quantity: 200,
    status: "Approved",
  },
  {
    id: "REQ-3003",
    date: "2026-04-15",
    requestedFor: "WS-03 QC",
    subinventory: "Sub-03",
    product: "Bearings",
    quantity: 50,
    status: "Issued",
  },
];

const Requisition = () => {
  const dispatch = useDispatch();

  const {
    workstationsList,
    subInventoriesList,
    productList: apiProductList,
  } = useSelector((state) => state.mdm);
  const { rackAllocationData, requisitionList, loading, error, pagination } =
    useSelector((state) => state.requisition);

  const [formData, setFormData] = useState({
    workstation_code: "",
    sub_inventory: "RM_STORE",
    // product: "",
    // quantity: "",
  });

  const getDefaultItemRow = () => ({
    id: Date.now(),
    product: "",
    quantity: "",
  });

  const [itemRows, setItemRows] = useState([getDefaultItemRow()]);
  const { toasts, showError, showSuccess, removeToast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [workstationSearchText, setWorkstationSearchText] = useState("");
  const [productListSearch, setProductListSearch] = useState("");
  const [rows, setRows] = useState(INITIAL_REQUISITIONS);

  const nextReqId = useMemo(() => {
    const maxNo = rows.reduce((max, item) => {
      const value = Number(item.id.replace("REQ-", ""));
      return Number.isFinite(value) ? Math.max(max, value) : max;
    }, 3000);
    return `REQ-${maxNo + 1}`;
  }, [rows]);

  const requisitionColumns = useMemo(
    () => [
      { key: "date", label: "Date", headerAlign: "center" },
      { key: "id", label: "Req ID", headerAlign: "center" },
      { key: "requestedFor", label: "Requested For Workstation", headerAlign: "center" },
      {
        key: "from_sub_inventory",
        label: "From Subinventory",
        headerAlign: "center",
      },
      // {
      //   key: "to_sub_inventory",
      //   label: "To Subinventory",
      //   headerAlign: "center",
      // },
      { key: "product", label: "Product", headerAlign: "center" },
      { key: "quantity", label: "Quantity", headerAlign: "center" },
      {
        key: "status",
        label: "Status",
        headerAlign: "center",
        render: (val) => (
          <div style={{ textAlign: "center" }}>
            {(() => {
              const normalizedStatus = String(val || "").toLowerCase();
              const statusLabel =
                normalizedStatus === "open"
                  ? "Open"
                  : normalizedStatus === "accept" ||
                      normalizedStatus === "accepted"
                    ? "Accept"
                    : normalizedStatus === "reject" ||
                        normalizedStatus === "rejected"
                      ? "Reject"
                      : String(val || "-");
              const statusClass =
                normalizedStatus === "open"
                  ? "bg-yellow-100 text-yellow-700"
                  : normalizedStatus === "accept" ||
                      normalizedStatus === "accepted"
                    ? "bg-green-100 text-green-700"
                    : normalizedStatus === "reject" ||
                        normalizedStatus === "rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700";
              return (
                <span className={`px-2 py-1 rounded text-xs ${statusClass}`}>
                  {statusLabel}
                </span>
              );
            })()}
          </div>
        ),
      },
    ],
    [],
  );

  useEffect(() => {
    dispatch(fetchWorkstationsList({ page_size: "all", search: "" }));
    dispatch(fetchSubInventoriesList({ search: "" }));
    dispatch(fetchProductList({ page_size: "all", search: "", type: "RM" }));
    dispatch(fetchRequisitionData({ page: 1, page_size: 10 }));
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(
        fetchWorkstationsList({
          page_size: "all",
          search: workstationSearchText.trim(),
        }),
      );
    }, 300);
    return () => clearTimeout(timer);
  }, [dispatch, workstationSearchText]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(
        fetchProductList({
          page_size: "all",
          search: productListSearch.trim(),
          type: "RM",
        }),
      );
    }, 300);
    return () => clearTimeout(timer);
  }, [dispatch, productListSearch]);

  // const workstationsOptions = Array.isArray(workstationsList)
  //   ? workstationsList.map((w) => w.workstation_code)
  //   : [];

  const workstationOptionsWithMeta = Array.isArray(workstationsList)
    ? workstationsList.map((w) => ({
        label: `${w.workstation_name} (${w.workstation_code})`,
        workstationCode: w.workstation_code || "",
        subInventoryCode: w.sub_inventory_details?.subinventory_code || "",
      }))
    : [];

  const workstationsOptions = workstationOptionsWithMeta.map((w) => w.label);

  const selectedWorkstation = workstationOptionsWithMeta.find(
    (w) => w.label === formData.workstation_code,
  );
  const workstationSubinventoryCode =
    selectedWorkstation?.subInventoryCode || "";

  const productOptions = Array.isArray(apiProductList?.data)
    ? apiProductList.data.map((p) => p.code)
    : [];

  // const subInventoryOptions = (subInventoriesList?.data || [])
  //   .map((s) => s?.subinventory_code || "")
  //   .filter(Boolean);

  const subInventoryOptions = ["RM_STORE"];

  const subinventoryOptions = selectedRow ? [selectedRow.sub_inventory] : [];

  const sanitizeQuantityInput = (value) => value.replace(/[^0-9.]/g, "");

  // row change handler for dynamic item rows

  const handleRowChange = (rowId, key, value, index) => {
    let updatedValue = value;

    if (key === "quantity") {
      updatedValue = sanitizeQuantityInput(value);

      const enteredQty = Number(updatedValue || 0);

      setErrors((prev) => {
        const next = { ...prev };

        if (!updatedValue) {
          next[`quantity_${index}`] = "Quantity required";
        } else if (enteredQty <= 0) {
          next[`quantity_${index}`] = "Quantity must be greater than 0";
        } else {
          delete next[`quantity_${index}`];
        }

        return next;
      });
    }

    if (key === "product" && value) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[`product_${index}`];
        return next;
      });
    }

    setItemRows((prev) =>
      prev.map((row) =>
        row.id === rowId ? { ...row, [key]: updatedValue } : row,
      ),
    );
  };

  const addRow = () => {
    setItemRows((prev) => [...prev, getDefaultItemRow()]);
  };

  const removeRow = (rowId) => {
    setItemRows((prev) =>
      prev.length === 1 ? prev : prev.filter((row) => row.id !== rowId),
    );
  };

  const handleChange = (key, value) => {
    // console.log("key:value", key, value);
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      if (value !== "" && value !== null && value !== undefined) {
        delete next[key];
      }
      return next;
    });
  };

  // form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!formData.workstation_code)
      newErrors.workstation_code = "Workstation required";
    if (!formData.sub_inventory)
      newErrors.sub_inventory = "Subinventory required";
    // if (!formData.product) newErrors.product = "Product required";

    // const enteredQty = Number(formData.quantity);

    // if (!formData.quantity || enteredQty === 0) {
    //   newErrors.quantity = !formData.quantity
    //     ? "Quantity required"
    //     : "Quantity cannot be 0";
    // }
    if (!itemRows.length) {
      newErrors.items = "At least one item is required";
    }

    itemRows.forEach((row, index) => {
      const enteredQty = Number(row.quantity);

      if (!row.product) {
        newErrors[`product_${index}`] = "Product required";
      }

      if (!row.quantity) {
        newErrors[`quantity_${index}`] = "Quantity required";
      } else if (enteredQty <= 0) {
        newErrors[`quantity_${index}`] = "Quantity must be greater than 0";
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setSubmitting(true);
    // const payload = {
    //   workstation:
    //     selectedWorkstation?.workstationCode || formData.workstation_code,
    //   from_sub_inventory: formData.sub_inventory,
    //   to_sub_inventory: workstationSubinventoryCode,
    //   product: formData.product,
    //   quantity: Number(formData.quantity),
    // };

    const payload = itemRows.map((row) => ({
      workstation:
        selectedWorkstation?.workstationCode || formData.workstation_code,
      from_sub_inventory: formData.sub_inventory,
      to_sub_inventory: workstationSubinventoryCode,
      product: row.product,
      quantity: Number(row.quantity),
    }));

    

    try {
      const result = await dispatch(createRequisition(payload)).unwrap();
      const successMessage =
        result?.message ||
        result?.detail ||
        result?.data?.message ||
        "Requisition created successfully";
      showSuccess(successMessage);

      await dispatch(
        fetchRequisitionData({
          page: 1,
          page_size: pagination.page_size || 10,
        }),
      );

      setFormData({
        workstation_code: "",
        sub_inventory: "RM_STORE",
        // product: "",
        // quantity: "",
      });
      setItemRows([getDefaultItemRow()]);

      setShowForm(false);

      setRows((prev) => [
        {
          id: nextReqId,
          date: new Date().toISOString().slice(0, 10),
          requestedFor: formData.workstation_code,
          subinventory: formData.sub_inventory,
          product: formData.product,
          quantity: Number(formData.quantity) || 0,
          status: "Open",
        },
        ...prev,
      ]);
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
        "Failed to create requisition. Please try again.";
      showError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const requisitionGrid = (requisitionList || []).map((item) => ({
    id: item.requisition_num,
    date: new Date(item.created_on).toLocaleDateString(),
    requestedFor: item.workstation,
    to_sub_inventory: item.to_sub_inventory,
    from_sub_inventory: item.from_sub_inventory,
    product: item.product,
    quantity: item.quantity,
    status: item.status,
  }));

  return (
    <div className="space-y-8 rounded-2xl border border-slate-200 bg-white p-3">
      <CommonHeading
        title="Requisition Management"
        subtitle="Create workstation requisitions with required product quantities."
        rightContent={(
          <CommonButton
            type="button"
            size="sm"
            action="add"
            onClick={() => setShowForm(true)}
          >
            New Request
          </CommonButton>
        )}
      />

      {showForm && (
        <CommonModal
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          closeOnBackdropClick={false}
          title="Add New Requisition"
          size="xl"
        >
          <form className="mt-2" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">
                Workstation <span className="text-red-500">*</span>
              </label>
              <SearchableInputDropdown
                value={formData.workstation_code}
                onChange={(value) =>
                  handleChange("workstation_code", value || "")
                }
                options={workstationsOptions}
                placeholder="Select Workstation"
                searchPlaceholder="Search workstation"
                onSearchChange={(text) => setWorkstationSearchText(text)}
              />
              {errors.workstation_code && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.workstation_code}
                </p>
              )}
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">
                To Subinventory <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={workstationSubinventoryCode}
                disabled
                placeholder="Auto from selected workstation"
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-100 px-3 text-sm text-slate-600"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">
                From SubInventory <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                {/* <SearchableInputDropdown
                  value={formData.sub_inventory}
                  onChange={(next) => handleChange("sub_inventory", next || "")}
                  options={subInventoryOptions}
                  placeholder="Select Subinventory"
                  searchPlaceholder="Search subinventory"
                /> */}

                <input
                  type="text"
                  value={subInventoryOptions}
                  disabled
                  placeholder="Auto from selected workstation"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-100 px-3 text-sm text-slate-600"
                />
              </div>

              {errors.sub_inventory && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.sub_inventory}
                </p>
              )}
            </div>

            {/* <div>
              <label className="text-xs font-semibold text-slate-700">
                Product <span className="text-red-500">*</span>
              </label>
              <SearchableInputDropdown
                value={formData.product}
                onChange={(value) => handleChange("product", value || "")}
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
                options={productOptions}
                placeholder="Select Product"
                searchPlaceholder="Search product"
                onSearchChange={(text) => setProductListSearch(text)}
              />

              {errors.product && (
                <p className="mt-1 text-xs text-red-500">{errors.product}</p>
              )}
            </div>

            <div className="md:col-span-1">
              <label className="text-xs font-semibold text-slate-700">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => {
                  const value = e.target.value;

                  setFormData((prev) => ({
                    ...prev,
                    quantity: value,
                  }));

                  setErrors((prev) => {
                    const next = { ...prev };
                    const numeric = Number(value);

                    if (value === "") {
                      next.quantity = "Quantity required";
                    } else if (numeric === 0) {
                      next.quantity = "Quantity cannot be 0";
                    } else if (numeric < 0) {
                      next.quantity = "Quantity cannot be less than 0";
                    } else {
                      delete next.quantity;
                    }

                    return next;
                  });
                }}
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"
              />
              {errors.quantity && (
                <p className="mt-1 text-xs text-red-500">{errors.quantity}</p>
              )}
            </div> */}
            <div className="md:col-span-3 mx-auto w-full  rounded-lg  border-slate-200 bg-white p-0">
              <div className="md:col-span-4 rounded-lg border border-slate-200 bg-white p-4">
                <label className="text-xs font-semibold text-slate-700">
                  Items <span className="text-red-500">*</span>
                </label>

                {itemRows.map((row, index) => (
                  <div key={row.id} className="grid grid-cols-6 gap-3 mt-2">
                    {/* Product */}
                    <div className="col-span-2">
                      <SearchableInputDropdown
                        value={row.product}
                        onChange={(val) =>
                          handleRowChange(row.id, "product", val || "", index)
                        }
                        // options={productOptions}
                        options={productOptions.filter(
                          (option) =>
                            !itemRows.some(
                              (item) =>
                                item.product === option && item.id !== row.id,
                            ),
                        )}
                        placeholder="Select Product"
                        searchPlaceholder="Search product"
                        onSearchChange={(text) => setProductListSearch(text)}
                      />

                      {errors[`product_${index}`] && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors[`product_${index}`]}
                        </p>
                      )}
                    </div>

                    {/* Quantity */}
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={row.quantity}
                        onChange={(e) =>
                          handleRowChange(
                            row.id,
                            "quantity",
                            e.target.value,
                            index,
                          )
                        }
                        className="mt-0 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 transition-all duration-150 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        placeholder="Enter quantity"
                      />

                      {errors[`quantity_${index}`] && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors[`quantity_${index}`]}
                        </p>
                      )}
                    </div>

                    {/* Remove */}

                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      className="text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addRow}
                  className="mt-2 text-blue-600 text-sm "
                >
                  + Add Row
                </button>
              </div>
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-3">
            <CommonButton
              type="button"
              action="cancel"
              variant="ghost"
              size="sm"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </CommonButton>
            <CommonButton
              type="submit"
              action="save"
              size="sm"
              disabled={submitting}
              isLoading={submitting}
            >
              Add
            </CommonButton>
          </div>
          </form>
        </CommonModal>
      )}

      <div>
        <h2 className="text-lg font-semibold text-slate-800">
          Recent Requisitions
        </h2>
        <div className="mt-4">
          <CommonDataGrid
            columns={requisitionColumns}
            data={requisitionGrid}
            showPagination={true}
            showSearch={true}
            page={pagination.current_page}
            serverPagination
            totalCount={pagination.count}
            onPageChange={(newPage) => {
              dispatch(
                fetchRequisitionData({
                  page: newPage,
                  page_size: pagination.page_size || 10,
                }),
              );
            }}
            onPageSizeChange={(newPageSize) => {
              dispatch(
                fetchRequisitionData({
                  page: 1,
                  page_size: newPageSize,
                }),
              );
            }}
          />
        </div>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default Requisition;


