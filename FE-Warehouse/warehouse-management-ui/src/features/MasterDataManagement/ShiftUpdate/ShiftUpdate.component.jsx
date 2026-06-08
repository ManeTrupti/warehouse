import React, { useState, useRef } from "react";
import CommonModal from "@shared/components/CommonModal";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { Toast, ToastContainer } from "@shared/components/Toast";
import GenericSearchSelect from "@shared/components/CommonSearchingSelect/GenericSearchingSelect";
import TicketRaisedModal from "./TicketRaisedModal";
import CommonHeading from "@shared/components/CommonHeading";
import {
  fetchProductAndPlans,
  selectProductAndPlans,
} from "@core/store/slices/ShiftUpdate/shiftUpdateSlice";
import {
  inputClass,
  
  gridContainerClass,
  leftCardClass,
  rightCardClass,
  
} from "./UpdateShift.style";

import {
  fetchResources,
  selectResources,
  selectShiftUpdateLoading,
  fetchShifts,
  selectShifts,
  selectProducts,
  createShiftUpdate,
  selectProductionLossReasons,
  selectRejectionReasons,
} from "@core/store/slices/ShiftUpdate/shiftUpdateSlice";

import {
  fetchRecentEntries,
  selectRecentEntries,
  selectRecentEntriesLoading,
} from "@core/store/slices/ShiftUpdate/shiftUpdateSlice";

import {
  fetchBreakdownTypes,
  selectBreakdownTypes,
  createTicket,
} from "@core/store/slices/Breakdown/breakdownSlice";

import { useToast } from "@shared/hooks/useToast";

const initialFormState = {
  resource: "",
  workstation: "",
  shift: "",
  hour: "",
  product: "",
  producedQty: "",
  ProductionLossQty: "",
  ProductionLossDetails: [
    { workDoneType: "", reasonId: "", qty: "", remark: "" },
  ],
  rejectionQty: "",
  rejectionDetails: [{ qty: "", workDoneType: "", reasonId: "", remark: "" }],
  remarks: "",
};

function ShiftUpdate() {
  const [form, setForm] = useState(initialFormState);

  const dispatch = useDispatch();

  const hasFetched = React.useRef(false);

  const resources = useSelector(selectResources);
  const { loadingResources } = useSelector(selectShiftUpdateLoading);
  const shifts = useSelector(selectShifts);
  const products = useSelector(selectProducts);
  const rejectionReasons = useSelector(selectRejectionReasons);
  const productionLossReasons = useSelector(selectProductionLossReasons);
  const { toasts, showError, showSuccess, removeToast } = useToast();
  const breakdownTypes = useSelector(selectBreakdownTypes);
  const productionPlans = useSelector(selectProductAndPlans);

  const recentEntries = useSelector(selectRecentEntries);
  const loadingRecentEntries = useSelector(selectRecentEntriesLoading);
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const lastFetchedDateRef = useRef(null);

  const initialBreakdownState = {
    resource: "",
    workstation: "",
    breakdownType: "",
    reason: "",
    remark: "",
  };

  const [breakdownForm, setBreakdownForm] = useState(initialBreakdownState);
  const [breakdownErrors, setBreakdownErrors] = useState({});

  const selectedResource = React.useMemo(() => {
    if (!form.resource) return null;

    return resources.find((r) => r.id === Number(form.resource)) || null;
  }, [resources, form.resource]);

  const workstationOptions = React.useMemo(() => {
    if (!selectedResource || !Array.isArray(selectedResource.workstations)) {
      return [];
    }

    return selectedResource.workstations
      .filter((ws) => ws && ws.id)
      .map((ws) => ({
        label:
          ws.workstation_name || ws.workstation_code || `Workstation ${ws.id}`,
        value: ws.id,
      }));
  }, [selectedResource]);

  const validateBreakdownForm = () => {
    const newErrors = {};

    if (!breakdownForm.resource) newErrors.resource = "Section is required";

    if (!breakdownForm.workstation)
      newErrors.workstation = "Work Station is required";

    if (!breakdownForm.breakdownType)
      newErrors.breakdownType = "Breakdown type is required";

    if (!breakdownForm.reason) newErrors.reason = "Reason is required";

    if (!breakdownForm.remark) newErrors.remark = "Remark is required";

    setBreakdownErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (!form.resource) return;

    const today = new Date().toISOString().split("T")[0];

    dispatch(
      fetchRecentEntries({
        date: today,
        resource_id: form.resource,
        workstation_id: form.workstation || null,
        shift: form.shift || null,
        product_id: form.product || null,
      }),
    );
  }, [form.resource, form.workstation, form.shift, form.product, dispatch]);

  const handleBreakdownChange = (field, value) => {
    setBreakdownErrors((prev) => ({
      ...prev,
      [field]: "",
    }));

    setBreakdownForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRaiseTicket = async () => {
    if (!validateBreakdownForm()) return;

    const payload = {
      resource_id: Number(breakdownForm.resource),
      workstation_id: Number(breakdownForm.workstation),
      breakdown: Number(breakdownForm.breakdownType),
      reason: breakdownForm.reason,
      remarks: breakdownForm.remark,
    };

    try {
      await dispatch(createTicket(payload)).unwrap();
      showSuccess("Breakdown ticket raised successfully");
      closeBreakdownModal();
    } catch (error) {
      showError(error?.message || "Failed to raise ticket");
    }
  };

  const closeBreakdownModal = () => {
    setIsBreakdownOpen(false);
    setBreakdownForm(initialBreakdownState);
    setBreakdownErrors({});
  };

  const resetForm = () => {
    setForm(initialFormState);
    setErrors({});
    setMode("shift");
  };
  useEffect(() => {
    if (hasFetched.current) return;

    hasFetched.current = true;

    dispatch(fetchResources());
    dispatch(fetchShifts());
  }, [dispatch]);

  useEffect(() => {
    if (!selectedDate || !form.shift) return;

    dispatch(
      fetchProductAndPlans({
        date: selectedDate,
        shift: Number(form.shift),
      }),
    );
  }, [dispatch, selectedDate, form.shift]);

  const [mode, setMode] = useState("shift");
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedShift = shifts.find((s) => s.id === Number(form.shift));

  const shiftDuration = selectedShift?.duration || 0;

  const validateForm = () => {
    const newErrors = {};

    if (!form.resource) {
      newErrors.resource = "Section is required";
    }

    if (!form.workstation) {
      newErrors.workstation = "Work Station is required";
    }

    if (!form.shift) {
      newErrors.shift = "Shift is required";
    }

    if (mode === "hourly" && !form.hour) {
      newErrors.hour = "Hour is required";
    }

    if (!form.product) {
      newErrors.product = "Product is required";
    }

    if (!form.producedQty || Number(form.producedQty) <= 0) {
      newErrors.producedQty = "Produced quantity must be greater than 0";
    }

    const totalPL = form.ProductionLossDetails.reduce(
      (sum, r) => sum + Number(r.qty || 0),
      0,
    );

    if (
      Number(form.ProductionLossQty) > 0 &&
      Number(form.ProductionLossQty) !== totalPL
    ) {
      newErrors.productionLossSplit = "Production loss split must match total";
    }

    const totalRJ = form.rejectionDetails.reduce(
      (sum, r) => sum + Number(r.qty || 0),
      0,
    );

    if (
      Number(form.rejectionQty) > 0 &&
      Number(form.rejectionQty) !== totalRJ
    ) {
      newErrors.rejectionSplit = "Rejection split must match total";
    }

    // 🔹 Production Loss duplicate reason validation
    if (Number(form.ProductionLossQty) > 0) {
      const reasons = form.ProductionLossDetails.map(
        (row) => row.reasonId,
      ).filter(Boolean);

      const hasDuplicate = new Set(reasons).size !== reasons.length;

      if (hasDuplicate) {
        newErrors.productionLossDuplicate =
          "Duplicate production loss reason not allowed";
      }
    }

    // 🔹 Rejection duplicate reason + work type validation
    if (Number(form.rejectionQty) > 0) {
      const combinations = form.rejectionDetails
        .filter((row) => row.reasonId && row.workDoneType)
        .map((row) => `${row.reasonId}_${row.workDoneType}`);

      const hasDuplicate = new Set(combinations).size !== combinations.length;

      if (hasDuplicate) {
        newErrors.rejectionDuplicate =
          "Same rejection reason with same work type not allowed";
      }
    }

    if (Number(form.ProductionLossQty) > 0) {
      form.ProductionLossDetails.forEach((row, index) => {
        if (!row.qty || Number(row.qty) <= 0) {
          newErrors[`pl_qty_${index}`] = "Qty required";
        }

        if (!row.reasonId) {
          newErrors[`pl_reason_${index}`] = "Reason required";
        }
      });
    }

    if (Number(form.rejectionQty) > 0) {
      form.rejectionDetails.forEach((row, index) => {
        if (!row.qty || Number(row.qty) <= 0) {
          newErrors[`rej_qty_${index}`] = "Qty required";
        }

        if (!row.workDoneType) {
          newErrors[`rej_work_${index}`] = "Work type required";
        }

        if (!row.reasonId) {
          newErrors[`rej_reason_${index}`] = "Reason required";
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!validateForm()) {
      showError("Please fix validation errors");
      return;
    }

    const payload = {
      resource_id: Number(form.resource),
      workstation_id: Number(form.workstation),
      product_id: Number(form.product),
      shift: Number(form.shift),
      entry_type: mode === "hourly" ? "HOURLY" : "SHIFT",
      hour: mode === "hourly" ? Number(form.hour) : null,
      planned_qty: plannedQty,
      produced_qty: Number(form.producedQty),
      rejection_qty: Number(form.rejectionQty || 0),
      production_loss_qty: Number(form.ProductionLossQty || 0),
      remark: form.remarks || "",

      production_losses: form.ProductionLossDetails.filter(
        (row) => Number(row.qty) > 0,
      ).map((row) => ({
        loss_quantity: Number(row.qty),
        loss_reason: Number(row.reasonId),
        remark: row.remark || "",
      })),

      rejections: form.rejectionDetails
        .filter((row) => Number(row.qty) > 0)
        .map((row) => ({
          rejection_quantity: Number(row.qty),
          rejection_reason: Number(row.reasonId),
          work_type:
            row.workDoneType?.toUpperCase() === "SCRAP" ? "SCRAP" : "REWORK",
          remark: row.remark || "",
        })),
    };

    try {
      setIsSubmitting(true);

      await dispatch(createShiftUpdate(payload)).unwrap();

      showSuccess("Production entry submitted successfully");

      resetForm();
    } catch (error) {
      showError(error?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));

    if (field === "ProductionLossQty") {
      setForm((prev) => ({
        ...prev,
        ProductionLossQty: value,
        ProductionLossDetails: [{ reasonId: "", qty: "", remark: "" }],
      }));
      return;
    }

    if (field === "rejectionQty") {
      setForm((prev) => ({
        ...prev,
        rejectionQty: value,
        rejectionDetails: [
          { qty: "", workDoneType: "", reasonId: "", remark: "" },
        ],
      }));
      return;
    }

    if (field === "resource") {
      setForm((prev) => ({
        ...prev,
        resource: value,
        workstation: "",
      }));

      return;
    }

    if (field === "shift") {
      setForm((prev) => ({
        ...prev,
        shift: value,
        hour: "",
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const plannedQty = React.useMemo(() => {
    if (!form.product || !productionPlans.length) return 0;

    const selectedPlan = productionPlans.find(
      (plan) => Number(plan.product_id) === Number(form.product),
    );

    return Number(selectedPlan?.planned_qty || 0);
  }, [productionPlans, form.product]);

  const produced = Number(form.producedQty || 0);

  const variance = produced - plannedQty;

  const achievement =
    plannedQty > 0 ? ((produced / plannedQty) * 100).toFixed(1) : 0;

  const isTargetMet = produced >= plannedQty;

  /* ================= ProductionLoss SPLIT ================= */

  const totalProductionLoss = form.ProductionLossDetails.reduce(
    (sum, r) => sum + Number(r.qty || 0),
    0,
  );

  const isProductionLossMatched =
    Number(form.ProductionLossQty || 0) === totalProductionLoss;

  const addProductionLossRow = () => {
    setForm((prev) => ({
      ...prev,
      ProductionLossDetails: [
        ...prev.ProductionLossDetails,
        { reasonId: "", qty: "", remark: "" },
      ],
    }));
  };

  const handleProductionLossChange = (index, field, value) => {
    const updated = [...form.ProductionLossDetails];
    updated[index][field] = value;

    setForm((prev) => ({
      ...prev,
      ProductionLossDetails: updated,
    }));

    // ✅ Clear ONLY the specific field error
    setErrors((prev) => {
      const newErrors = { ...prev };

      if (field === "qty") {
        delete newErrors[`pl_qty_${index}`];
      }

      if (field === "reasonId") {
        delete newErrors[`pl_reason_${index}`];
      }

      return newErrors;
    });
  };

  useEffect(() => {
    if (
      Number(form.ProductionLossQty) > 0 &&
      Number(form.ProductionLossQty) === totalProductionLoss
    ) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.productionLossSplit;
        return newErrors;
      });
    }
  }, [totalProductionLoss, form.ProductionLossQty]);

  /* ================= Rejection SPLIT ================= */

  const totalRejectionSplit = form.rejectionDetails.reduce(
    (sum, r) => sum + Number(r.qty || 0),
    0,
  );

  const isRejectionMatched =
    Number(form.rejectionQty || 0) === totalRejectionSplit;

  const addRejectionRow = () => {
    setForm((prev) => ({
      ...prev,
      rejectionDetails: [
        ...prev.rejectionDetails,
        { qty: "", workDoneType: "", reasonId: "", remark: "" },
      ],
    }));
  };

  const removeRejectionRow = (index) => {
    const updated = form.rejectionDetails.filter((_, i) => i !== index);

    setForm((prev) => ({
      ...prev,
      rejectionDetails:
        updated.length > 0 ? updated : [{ qty: "", reasonId: "", remark: "" }],
    }));
  };

  const handleRejectionChange = (index, field, value) => {
    if (field === "qty" && Number(value) < 0) return;

    const updated = [...form.rejectionDetails];
    updated[index][field] = value;

    setForm((prev) => ({
      ...prev,
      rejectionDetails: updated,
    }));

    // ✅ Clear ONLY the specific field error
    setErrors((prev) => {
      const newErrors = { ...prev };

      if (field === "qty") {
        delete newErrors[`rej_qty_${index}`];
      }

      if (field === "workDoneType") {
        delete newErrors[`rej_work_${index}`];
      }

      if (field === "reasonId") {
        delete newErrors[`rej_reason_${index}`];
      }

      return newErrors;
    });
  };

  useEffect(() => {
    if (
      Number(form.rejectionQty) > 0 &&
      Number(form.rejectionQty) === totalRejectionSplit
    ) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.rejectionSplit;
        return newErrors;
      });
    }
  }, [totalRejectionSplit, form.rejectionQty]);

  return (
    <div className="p-2 space-y-2">
      <CommonHeading
        title="Shift Production Update"
        subtitle="Submit end-of-shift or hourly production data"
      />
      <div className={gridContainerClass}>
        {/* LEFT CARD */}
        <div className={leftCardClass}>
          {/* HEADER */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg font-semibold text-gray-900">
              Production Entry Form
            </h2>

            <div className="flex bg-gray-100 rounded-lg p-1 text-sm">
              <button
                onClick={() => setMode("shift")}
                className={`px-4 py-1.5 rounded-md transition ${
                  mode === "shift"
                    ? "bg-white shadow text-blue-600 font-medium"
                    : "text-gray-500"
                }`}
              >
                Shift
              </button>
              <button
                onClick={() => setMode("hourly")}
                className={`px-4 py-1.5 rounded-md transition ${
                  mode === "hourly"
                    ? "bg-white shadow text-blue-600 font-medium"
                    : "text-gray-500"
                }`}
              >
                Hourly
              </button>
            </div>
          </div>

          <div
            className={`grid gap-x-12 gap-y-6 ${
              mode === "hourly" ? "md:grid-cols-4" : "md:grid-cols-3"
            }`}
          >
            {/* Section*/}
            <div>
              <GenericSearchSelect
                label="Section"
                required
                options={resources.map((res) => ({
                  label: res.resource_name,
                  value: res.id, // ✅ use id (NOT resource_id)
                }))}
                value={form.resource}
                onChange={(val) => handleChange("resource", val)}
                error={errors.resource}
                placeholder="Select Section"
              />
            </div>

            {/* Work Station */}
            <div>
              <GenericSearchSelect
                label="Work Station"
                required
                options={workstationOptions}
                value={form.workstation}
                onChange={(val) => handleChange("workstation", val)}
                error={errors.workstation}
                placeholder="Select Work Station"
                disabled={!form.resource || workstationOptions.length === 0}
              />
            </div>

            {/* Shift */}
            <div>
              <GenericSearchSelect
                label="Shift"
                required
                options={shifts.map((shift) => ({
                  label: `${shift.name} (${shift.start_time} - ${shift.end_time})`,
                  value: shift.id,
                }))}
                value={form.shift}
                onChange={(val) => handleChange("shift", val)}
                error={errors.shift}
                placeholder="Select Shift"
              />
            </div>

            {/* Hour (keeps space in shift mode) */}
            {mode === "hourly" && (
              <div>
                <GenericSearchSelect
                  label="Hour"
                  required
                  options={[...Array(Math.floor(shiftDuration))].map(
                    (_, i) => ({
                      label: `Hour ${i + 1}`,
                      value: i + 1,
                    }),
                  )}
                  value={form.hour}
                  onChange={(val) => handleChange("hour", val)}
                  error={errors.hour}
                  placeholder="Select Hour"
                  disabled={!form.shift}
                />
              </div>
            )}
          </div>
          <br />
          <div className="grid md:grid-cols-3 gap-x-12 gap-y-6">
            {/* Product - Full Width */}
            <div className="md:col-span-3">
              <GenericSearchSelect
                label="Item / Product"
                required
                options={productionPlans.map((p) => ({
                  label: p.product_name,
                  value: p.product_id,
                }))}
                value={form.product}
                onChange={(val) => handleChange("product", val)}
                error={errors.product}
                placeholder="Search Product"
              />
            </div>

            {/* Planned */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Planned Qty (Auto)
              </label>
              <input
                disabled
                value={plannedQty}
                className="mt-2 h-11 w-full rounded-lg border border-gray-200 bg-gray-100 px-4 text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">From Assembly Plan</p>
            </div>

            {/* Produced */}
            <div>
              <label className="text-sm font-medium">
                Produced Qty <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="number"
                value={form.producedQty}
                onChange={(e) => handleChange("producedQty", e.target.value)}
                className={`${inputClass} ${
                  errors.producedQty ? "border-red-500" : ""
                }`}
              />

              {errors.producedQty && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.producedQty}
                </p>
              )}
            </div>

            {/* Production Loss*/}
            <div>
              <label className="text-sm font-medium">ProductionLoss Qty</label>
              <input
                type="number"
                value={form.ProductionLossQty}
                onChange={(e) =>
                  handleChange("ProductionLossQty", e.target.value)
                }
                className={`${inputClass} ${
                  errors.producedQty ? "border-red-500" : ""
                }`}
              />
              <p className="text-xs text-gray-400 mt-1">
                Enter actual Production loss quantity
              </p>
            </div>

            {/* ProductionLoss Reason */}
            {Number(form.ProductionLossQty) > 0 && (
              <div className="md:col-span-3 space-y-3">
                <label className="text-sm font-medium">
                  Production Loss Split <span style={{ color: "red" }}>*</span>
                </label>

                {form.ProductionLossDetails.map((row, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-4 items-start"
                  >
                    {/* Qty FIRST */}
                    <div className="col-span-2">
                      <label className="text-xs text-gray-600">Qty</label>
                      <input
                        type="number"
                        value={row.qty}
                        onChange={(e) =>
                          handleProductionLossChange(
                            index,
                            "qty",
                            e.target.value,
                          )
                        }
                        className={`mt-1 h-11 border rounded-lg px-3 text-sm w-full ${
                          errors[`pl_qty_${index}`] ? "border-red-500" : ""
                        }`}
                      />
                      {errors[`pl_qty_${index}`] && (
                        <p className="text-red-600 text-xs">
                          {errors[`pl_qty_${index}`]}
                        </p>
                      )}
                    </div>

                    {/* Reason SECOND */}
                    <div className="col-span-4">
                      <label className="text-xs text-gray-600">Reason</label>
                      <select
                        value={row.reasonId}
                        onChange={(e) =>
                          handleProductionLossChange(
                            index,
                            "reasonId",
                            e.target.value,
                          )
                        }
                        className={`mt-1 h-11 border rounded-lg px-3 text-sm w-full ${
                          errors[`pl_reason_${index}`] ? "border-red-500" : ""
                        }`}
                      >
                        <option value="">Select Reason</option>
                        {productionLossReasons.map((reason) => (
                          <option key={reason.id} value={reason.id}>
                            {reason.reason}
                          </option>
                        ))}
                      </select>
                      {errors[`pl_reason_${index}`] && (
                        <p className="text-red-600 text-xs">
                          {errors[`pl_reason_${index}`]}
                        </p>
                      )}
                    </div>

                    {/* Remark THIRD */}
                    <div className="col-span-5">
                      <label className="text-xs text-gray-600">Remark</label>

                      <input
                        type="text"
                        value={row.remark}
                        onChange={(e) =>
                          handleProductionLossChange(
                            index,
                            "remark",
                            e.target.value,
                          )
                        }
                        className="mt-1 h-11 border rounded-lg px-3 text-sm w-full"
                      />
                    </div>

                    {/* Delete LAST */}
                    <div className="col-span-1 flex items-center justify-center pb-4">
                      {form.ProductionLossDetails.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = form.ProductionLossDetails.filter(
                              (_, i) => i !== index,
                            );
                            setForm((prev) => ({
                              ...prev,
                              ProductionLossDetails:
                                updated.length > 0
                                  ? updated
                                  : [{ reasonId: "", qty: "", remark: "" }],
                            }));
                          }}
                          className="text-red-600 text-xl mt-8 "
                        >
                          ☒
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {!isProductionLossMatched &&
                  totalProductionLoss < Number(form.ProductionLossQty) && (
                    <button
                      type="button"
                      onClick={addProductionLossRow}
                      className="text-blue-600 text-sm"
                    >
                      + Add More
                    </button>
                  )}

                {errors.productionLossSplit && (
                  <p className="text-red-600 text-xs">
                    {errors.productionLossSplit}
                  </p>
                )}
              </div>
            )}
            {errors.productionLossDuplicate && (
              <p className="text-red-600 text-xs">
                {errors.productionLossDuplicate}
              </p>
            )}

            {form.producedQty && (
              <div
                className={`md:col-span-3 rounded-lg p-4 flex justify-between ${
                  isTargetMet
                    ? "bg-green-100 border border-green-500"
                    : "bg-yellow-100 border border-yellow-500"
                }`}
              >
                <span className="font-medium">
                  {isTargetMet ? "Target Achieved!" : "Below Target"}
                </span>

                <span>
                  Variance: {variance} &nbsp; | &nbsp; Achievement:{" "}
                  {achievement}%
                </span>
              </div>
            )}
          </div>

          {/* Rejection Qty */}
          <div className="grid md:grid-cols-2 gap-6 items-end">
            {/* Rejection Qty */}
            <div>
              <label className="text-sm font-medium">Rejection Qty</label>
              <input
                type="number"
                min="0"
                value={form.rejectionQty}
                onChange={(e) => handleChange("rejectionQty", e.target.value)}
                className={`${inputClass} ${
                  errors.producedQty ? "border-red-500" : ""
                }`}
              />
            </div>
          </div>

          {/* Split Section */}
          {Number(form.rejectionQty) > 0 && (
            <div className="md:col-span-3 space-y-3 mt-4">
              {form.rejectionDetails.map((row, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-4 items-start"
                >
                  {/* Qty */}
                  <div className="col-span-2">
                    <label className="text-xs">Qty</label>
                    <input
                      type="number"
                      min="0"
                      value={row.qty}
                      onChange={(e) =>
                        handleRejectionChange(index, "qty", e.target.value)
                      }
                      className={`mt-1 h-11 border rounded-lg px-3 text-sm w-full ${
                        errors[`rej_qty_${index}`] ? "border-red-500" : ""
                      }`}
                    />
                    {errors[`rej_qty_${index}`] && (
                      <p className="text-red-600 text-xs">
                        {errors[`rej_qty_${index}`]}
                      </p>
                    )}
                  </div>

                  {/* Work Done */}
                  <div className="col-span-2">
                    <label className="text-xs">Work Done</label>
                    <select
                      value={row.workDoneType}
                      onChange={(e) =>
                        handleRejectionChange(
                          index,
                          "workDoneType",
                          e.target.value,
                        )
                      }
                      className={`mt-1 h-11 border rounded-lg px-3 text-sm w-full ${
                        errors[`rej_work_${index}`] ? "border-red-500" : ""
                      }`}
                    >
                      <option value="">Select</option>
                      <option value="rework">Rework</option>
                      <option value="scrap">Scrap</option>
                    </select>
                    {errors[`rej_work_${index}`] && (
                      <p className="text-red-600 text-xs">
                        {errors[`rej_work_${index}`]}
                      </p>
                    )}
                  </div>

                  {/* Reason */}
                  <div className="col-span-3">
                    <label className="text-xs">Reason</label>
                    <select
                      value={row.reasonId}
                      onChange={(e) =>
                        handleRejectionChange(index, "reasonId", e.target.value)
                      }
                      className={`mt-1 h-11 border rounded-lg px-3 text-sm w-full ${
                        errors[`rej_reason_${index}`] ? "border-red-500" : ""
                      }`}
                    >
                      <option value="">Select Reason</option>
                      {rejectionReasons.map((reason) => (
                        <option key={reason.id} value={reason.id}>
                          {reason.reason}
                        </option>
                      ))}
                    </select>
                    {errors[`rej_reason_${index}`] && (
                      <p className="text-red-600 text-xs">
                        {errors[`rej_reason_${index}`]}
                      </p>
                    )}
                  </div>

                  {/* Remark */}
                  <div className="col-span-4">
                    <label className="text-xs">Remark</label>
                    <input
                      type="text"
                      value={row.remark}
                      onChange={(e) =>
                        handleRejectionChange(index, "remark", e.target.value)
                      }
                      className="mt-1 h-11 border rounded-lg px-3 text-sm w-full"
                    />
                  </div>

                  {/* Delete */}
                  <div className="col-span-1 flex items-center justify-center pb-4">
                    {form.rejectionDetails.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRejectionRow(index)}
                        className="text-red-600 text-xl mt-8 "
                      >
                        ☒
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Add More */}
              {!isRejectionMatched &&
                totalRejectionSplit < Number(form.rejectionQty) && (
                  <button
                    type="button"
                    onClick={addRejectionRow}
                    className="text-blue-600 text-sm"
                  >
                    + Add More
                  </button>
                )}

              {errors.rejectionSplit && (
                <p className="text-red-600 text-xs">{errors.rejectionSplit}</p>
              )}
            </div>
          )}
          {errors.rejectionDuplicate && (
            <p className="text-red-600 text-xs">{errors.rejectionDuplicate}</p>
          )}

          {/* Remarks */}
          <div className="mt-8">
            <label className="text-sm font-medium">Remarks / Issues</label>
            <textarea
              rows="4"
              value={form.remarks}
              onChange={(e) => handleChange("remarks", e.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm"
            />
          </div>

          {/* Buttons */}
          <div className="mt-8 flex justify-between items-center">
            <button
              onClick={async () => {
                await dispatch(fetchBreakdownTypes());
                setIsBreakdownOpen(true);
              }}
              className="px-6 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600"
            >
              Raise Breakdown Slip
            </button>

            <div className="flex gap-4">
              <button
                onClick={resetForm}
                className="px-5 py-2 rounded-full border border-gray-300 bg-gray-50 text-sm text-gray-800 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className={rightCardClass}>
          <h3 className="text-lg font-semibold mb-6">Today's Submissions</h3>

          {/* <div className="space-y-3">
            {() => (
              <div
                // key={}
                className="flex justify-between items-center px-4 py-3 rounded-lg border border-gray-200"
              >
                <span className="text-sm text-gray-800">{}</span>

                {submittedWorkstations.includes(ws.id) ? (
                  <span className="text-green-600 font-semibold">✔</span>
                ) : (
                  <span className="text-yellow-500 font-semibold">⚠</span>
                )}
              </div>
            )}
          </div> */}

          {loadingRecentEntries && (
            <p className="text-sm text-gray-500">Loading...</p>
          )}

          {!loadingRecentEntries && recentEntries.length === 0 && null}

          {!loadingRecentEntries && recentEntries.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-6">Recent Entries</h3>

              <div className="space-y-3">
                {recentEntries.map((entry, index) => {
                  const isGreen =
                    Number(entry.produced_qty) >= Number(entry.planned_qty);

                  return (
                    <div
                      key={index}
                      className="px-4 py-3 rounded-lg bg-gray-100"
                    >
                      {/* Top Row */}
                      <div className="flex justify-between items-center">
                        {/* Product Code (BLACK BOLD) */}
                        <span className="font-semibold text-black">
                          {entry.product_code}
                        </span>

                        {/* Produced / Planned */}
                        <span
                          className={`font-semibold ${
                            isGreen ? "text-green-600" : "text-yellow-600"
                          }`}
                        >
                          {entry.produced_qty} / {entry.planned_qty}
                        </span>
                      </div>

                      {/* Product Name (RED TEXT) */}
                      <p className="text-sm text-red-600 mt-1">
                        {entry.product_name}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <TicketRaisedModal
        isOpen={isBreakdownOpen}
        onClose={closeBreakdownModal}
        resources={resources}
        breakdownTypes={breakdownTypes}
        form={breakdownForm}
        errors={breakdownErrors}
        handleChange={handleBreakdownChange}
        onSubmit={handleRaiseTicket}
      />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default ShiftUpdate;
