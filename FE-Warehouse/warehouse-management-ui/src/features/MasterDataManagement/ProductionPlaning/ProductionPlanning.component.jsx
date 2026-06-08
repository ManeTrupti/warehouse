import React, { useState, useRef, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "@core/theme";
import { CommonHeading } from "@shared/components/CommonHeading";
import { CommonButton } from "@shared/components/CommonButton";
import { CommonModal } from "@shared/components/CommonModal";
import { DeleteConfirmationDialog } from "@shared/components/DeleteConfirmationDialog";
import { CommonDataGrid } from "@shared/components/CommonDataGrid";
import CommonLoader from "@shared/components/CommonLoader";
import { ToastContainer } from "@shared/components/Toast";
import { useToast } from "@shared/hooks/useToast";
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  PlusIcon,
  EyeIcon,
  TrashIcon,
  CheckCircleIcon,
  CheckIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import productionPlanningData from "./productionPlanningData.json";
import {
  fetchProductionPlans,
  selectProductionPlans,
  selectProductionPlanningLoading,
  selectProductionPlanningError,
  addProductionPlan,
  deleteProductionPlans,
  selectProductionPlanningDeleting,
  fetchChildPlans,
  selectChildPlans,
  selectChildPlansLoading,
  selectChildPlansError,
  fetchPlanningProducts,
  selectPlanningProducts,
  selectPlanningProductsLoading,
  selectPlanningProductsError,
  fetchPlanningResources,
  selectPlanningResources,
  selectPlanningResourcesLoading,
  selectPlanningResourcesError,
} from "@core/store/slices/ProductionPlanning/productionPlanningSlice";

const SHIFT_CELL_STYLE = (theme) => ({
  width: '4rem',
  padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
  borderRadius: theme.borderRadius.md,
  fontSize: theme.typography.fontSize.sm[0],
  backgroundColor: '#f3e8ff',
  textAlign: 'center',
});

function Productionplanning() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [line, setLine] = useState("All Lines");
  const [lineDropdownOpen, setLineDropdownOpen] = useState(false);
  const lineDropdownRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [plans, setPlans] = useState([]);
  const [addPlanModalOpen, setAddPlanModalOpen] = useState(false);
  const [addPlanForm, setAddPlanForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    model: '',
    workstation: '',
    resource: '',
    totalQty: '',
    shift1: '',
    shift2: '',
    shift3: '',
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [viewPlan, setViewPlan] = useState(null);

  const { lines } = productionPlanningData;

  const apiPlans = useSelector(selectProductionPlans);
  const loading = useSelector(selectProductionPlanningLoading);
  const error = useSelector(selectProductionPlanningError);
  const deleting = useSelector(selectProductionPlanningDeleting);
  const apiChildPlans = useSelector(selectChildPlans);
  const childPlansLoading = useSelector(selectChildPlansLoading);
  const childPlansError = useSelector(selectChildPlansError);
  const planningProducts = useSelector(selectPlanningProducts);
  const planningProductsLoading = useSelector(selectPlanningProductsLoading);
  const planningProductsError = useSelector(selectPlanningProductsError);
  const planningResources = useSelector(selectPlanningResources);
  const planningResourcesLoading = useSelector(
    selectPlanningResourcesLoading,
  );
  const planningResourcesError = useSelector(selectPlanningResourcesError);

  const lastFetchedDateRef = useRef(null);
  const lastFetchedChildDateRef = useRef(null);
  const hasFetchedProductsRef = useRef(false);
  const hasFetchedResourcesRef = useRef(false);
  const { toasts, showError, showSuccess, removeToast } = useToast();

  const productOptions = useMemo(() => {
  const map = new Map();

  (planningProducts || []).forEach((item) => {
    const product = item.product_detail;
    if (!product?.id) return;

    if (!map.has(product.id)) {
      map.set(product.id, {
        id: product.id,
        label: product.name,
        quantity: item.quantity, 
      });
    }
  });

  return Array.from(map.values());
}, [planningProducts]);

  const selectedResource = useMemo(() => {
    const resourceId = addPlanForm.resource
      ? Number(addPlanForm.resource)
      : null;
    if (!resourceId) return null;
    return (planningResources || []).find((r) => r.id === resourceId) || null;
  }, [planningResources, addPlanForm.resource]);

  const workstationOptions = useMemo(() => {
    if (!selectedResource || !Array.isArray(selectedResource.workstations)) {
      return [];
    }
    return selectedResource.workstations
      .filter((ws) => ws && ws.id)
      .map((ws) => ({
        id: ws.id,
        label:
          ws.workstation_name ||
          ws.workstation_code ||
          ws.name ||
          ws.code ||
          `Workstation ${ws.id}`,
      }));
  }, [selectedResource]);

  const resourceOptions = useMemo(() => {
    const map = new Map();
    (planningResources || []).forEach((r) => {
      if (!r?.id) return;
      if (map.has(r.id)) return;
      const label =
        r.resource_name ||
        r.resource_code ||
        r.name ||
        r.code ||
        `Resource ${r.id}`;
      map.set(r.id, { id: r.id, label });
    });
    return Array.from(map.values());
  }, [planningResources]);

  const emptyToDash = (v) => (v == null || String(v).trim() === "" ? "–" : v);

  const childPartTableData = useMemo(() => {
    if (!Array.isArray(apiChildPlans)) return [];
    return apiChildPlans.map((row) => ({
      productCode: emptyToDash(
        row.product_code ?? row.productCode ?? row.code ?? "",
      ),
      productName: emptyToDash(
        row.product_name ?? row.productName ?? row.name ?? "",
      ),
      categoryName: emptyToDash(
        row.category_name ?? row.categoryName ?? "",
      ),
      requiredQty: emptyToDash(
        row.required_quantity ?? row.requiredQty ?? row.required_qty ?? "",
      ),
    }));
  }, [apiChildPlans]);

  useEffect(() => {
  if (!addPlanModalOpen) return;

  const productId = Number(addPlanForm.model);
  if (!productId) return;

  const selectedProduct = productOptions.find(
    (p) => p.id === productId
  );

  if (!selectedProduct) return;

  setAddPlanForm((f) => ({
    ...f,
    totalQty: selectedProduct.quantity
      ? String(selectedProduct.quantity)
      : "",
  }));
}, [addPlanModalOpen, addPlanForm.model, productOptions]);

  const openAddPlanModal = () => {
    setAddPlanForm({
      date: new Date().toISOString().slice(0, 10),
      model: '',
      workstation: '',
      resource: '',
      totalQty: '',
      shift1: '',
      shift2: '',
      shift3: '',
    });
    setAddPlanModalOpen(true);
  };

  const closeAddPlanModal = () => setAddPlanModalOpen(false);

  const handleViewClick = (row) => {
    if (row?.rawPlan) {
      setViewPlan(row.rawPlan);
    } else {
      setViewPlan(null);
    }
  };

  const handleDeleteClick = (plan) => {
    setPlanToDelete(plan);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!planToDelete?.id) {
      setIsDeleteDialogOpen(false);
      setPlanToDelete(null);
      return;
    }
    try {
      await dispatch(deleteProductionPlans(planToDelete.id)).unwrap();
      showSuccess("Production plan deleted successfully");
      dispatch(fetchProductionPlans({ date: selectedDate }));
    } catch (err) {
      console.error("Failed to delete production plan:", err);
      const backendMessage =
        (Array.isArray(err?.non_field_errors) && err.non_field_errors[0]) ||
        err?.error ||
        err?.message ||
        "Failed to delete production plan";
      showError(backendMessage);
      dispatch(fetchProductionPlans({ date: selectedDate }));
    } finally {
      setIsDeleteDialogOpen(false);
      setPlanToDelete(null);
    }
  };

  const handleAddPlanSubmit = async () => {
    const total = addPlanForm.totalQty ? parseInt(addPlanForm.totalQty, 10) : 0;
    const s1 = addPlanForm.shift1 ? parseInt(addPlanForm.shift1, 10) : 0;
    const s2 = addPlanForm.shift2 ? parseInt(addPlanForm.shift2, 10) : 0;
    const s3 = addPlanForm.shift3 ? parseInt(addPlanForm.shift3, 10) : 0;
    const productId = addPlanForm.model ? Number(addPlanForm.model) : null;
    const workstationId = addPlanForm.workstation
      ? Number(addPlanForm.workstation)
      : null;
    const resourceId = addPlanForm.resource
      ? Number(addPlanForm.resource)
      : null;

    if (!productId || Number.isNaN(total)) {
      showError("Please select a product and enter total quantity");
      return;
    }

    if (!resourceId) {
      showError("Please select a resource");
      return;
    }

    const requiresWorkstation =
      selectedResource &&
      Array.isArray(selectedResource.workstations) &&
      selectedResource.workstations.length > 0;

    if (requiresWorkstation && !workstationId) {
      showError("Please select a workstation for the chosen resource");
      return;
    }

    const shiftsPayload = [];
    if (s1 > 0) shiftsPayload.push({ shift_id: 1, planned_quantity: s1 });
    if (s2 > 0) shiftsPayload.push({ shift_id: 2, planned_quantity: s2 });
    if (s3 > 0) shiftsPayload.push({ shift_id: 3, planned_quantity: s3 });

    const payload = {
      date: addPlanForm.date || selectedDate,
      product_id: productId,
      total_planned_quantity: total,
      shifts: shiftsPayload,
      ...(workstationId ? { workstation_id: workstationId } : {}),
      ...(resourceId ? { resource_id: resourceId } : {}),
    };

    try {
      await dispatch(addProductionPlan(payload)).unwrap();
      showSuccess("Production plan added successfully");
      setAddPlanModalOpen(false);
      setAddPlanForm((f) => ({
        ...f,
        totalQty: "",
        shift1: "",
        shift2: "",
        shift3: "",
      }));
      dispatch(fetchProductionPlans({ date: payload.date }));
    } catch (err) {
      const backendMessage =
      (Array.isArray(err?.shifts) && err.shifts[0]) ||

      (Array.isArray(err?.non_field_errors) && err.non_field_errors[0]) ||

      err?.error ||

      err?.message ||

      "Failed to add production plan";

      showError(backendMessage);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.gray[300]}`,
    fontSize: theme.typography.fontSize.sm[0],
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.primary,
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (lineDropdownRef.current && !lineDropdownRef.current.contains(event.target)) {
        setLineDropdownOpen(false);
      }
    }
    if (lineDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [lineDropdownOpen]);

  useEffect(() => {
    if (!selectedDate) return;
    if (lastFetchedDateRef.current === selectedDate) return;
    lastFetchedDateRef.current = selectedDate;
    dispatch(fetchProductionPlans({ date: selectedDate }));
  }, [dispatch, selectedDate]);

useEffect(() => {
  if (!selectedDate) return;
  if (hasFetchedProductsRef.current === selectedDate) return;
  hasFetchedProductsRef.current = selectedDate;
  dispatch(fetchPlanningProducts({ date: selectedDate }));
}, [dispatch, selectedDate]);

  useEffect(() => {
    if (hasFetchedResourcesRef.current) return;
    hasFetchedResourcesRef.current = true;
    dispatch(fetchPlanningResources());
  }, [dispatch]);

useEffect(() => {
  if (!selectedDate) return;

  if (lastFetchedChildDateRef.current === selectedDate) return;

  lastFetchedChildDateRef.current = selectedDate;
  dispatch(fetchChildPlans({ date: selectedDate }));
}, [dispatch, selectedDate]);

  useEffect(() => {
    if (!Array.isArray(apiPlans)) {
      setPlans([]);
      return;
    }

    const mappedPlans = apiPlans.map((plan, index) => {
      const product =
        plan.product ||
        plan.product_details ||
        plan.product_detail ||
        null;
      const shifts = Array.isArray(plan.shifts) ? plan.shifts : [];
      const [shift1, shift2, shift3] = shifts;

      const getPlannedQty = (shiftEntry) =>
        shiftEntry && typeof shiftEntry.planned_quantity === "number"
          ? shiftEntry.planned_quantity
          : shiftEntry && typeof shiftEntry.planned_quantity === "string"
            ? Number(shiftEntry.planned_quantity) || 0
            : 0;

      return {
        id: String(plan.id ?? index),
        productName:
          product?.product_name ||
          product?.name ||
          `Product ${product?.id ?? ""}`,
        model:
          product?.model_code ||
          product?.code ||
          product?.name ||
          `Product ${product?.id ?? ""}`,
        totalPlan:
          typeof plan.total_planned_quantity === "number"
            ? plan.total_planned_quantity
            : Number(plan.total_planned_quantity) || 0,
        shift1: getPlannedQty(shift1),
        shift2: getPlannedQty(shift2),
        shift3: getPlannedQty(shift3),
        status: plan.status || "PLANNED",
        rawPlan: plan,
      };
    });

    setPlans(mappedPlans);
  }, [apiPlans]);

  const filterBarStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'nowrap',
    paddingLeft: theme.spacing.lg,
    paddingRight: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    backgroundColor: '#f5f5f5',
  };

  const blueBarStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
    backgroundColor: theme.colors.primary?.DEFAULT ?? theme.colors.info.DEFAULT,
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.base[0],
    fontWeight: theme.typography.fontWeight.semibold,
  };

  const assemblyColumns = [
    {
      key: "model",
      label: "Product Code",
      headerAlign: "center",
      minWidth: "6rem",
      render: (val) => (
        <div style={{ textAlign: "center", width: "100%" }}>
          {emptyToDash(val)}
        </div>
      ),
    },
    {
      key: "productName",
      label: "Product Name",
      headerAlign: "center",
      minWidth: "10rem",
      render: (val) => (
        <div style={{ textAlign: "center", width: "100%" }}>
          {emptyToDash(val)}
        </div>
      ),
    },
    {
      key: "totalPlan",
      label: "Total Plan",
      headerAlign: "center",
      minWidth: "6rem",
      render: (val) => (
        <div style={{ textAlign: "center", width: "100%" }}>
          {emptyToDash(val)}
        </div>
      ),
    },
    {
      key: "shift1",
      label: "Shift 1",
      headerAlign: "center",
      minWidth: "6rem",
      render: (val) => (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <span
            style={{ ...SHIFT_CELL_STYLE(theme), display: "inline-block" }}
          >
            {emptyToDash(val)}
          </span>
        </div>
      ),
    },
    {
      key: "shift2",
      label: "Shift 2",
      headerAlign: "center",
      minWidth: "6rem",
      render: (val) => (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <span
            style={{ ...SHIFT_CELL_STYLE(theme), display: "inline-block" }}
          >
            {emptyToDash(val)}
          </span>
        </div>
      ),
    },
    {
      key: "shift3",
      label: "Shift 3",
      headerAlign: "center",
      minWidth: "6rem",
      render: (val) => (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <span
            style={{ ...SHIFT_CELL_STYLE(theme), display: "inline-block" }}
          >
            {emptyToDash(val)}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      minWidth: "8rem",
      render: (_val, row) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: theme.spacing.sm,
          }}
        >
          <button
            type="button"
            onClick={() => handleViewClick(row)}
            style={{
              padding: theme.spacing.xs,
              border: "none",
              background: "none",
              cursor: "pointer",
              color: theme.colors.primary?.DEFAULT ?? theme.colors.info.DEFAULT,
            }}
            aria-label="View"
          >
            <EyeIcon style={{ width: "1.125rem", height: "1.125rem" }} />
          </button>
          <button
            type="button"
            onClick={() => handleDeleteClick(row)}
            style={{
              padding: theme.spacing.xs,
              border: "none",
              background: "none",
              cursor: "pointer",
              color: theme.colors.error.DEFAULT,
            }}
            aria-label="Delete"
            disabled={deleting}
          >
            <TrashIcon style={{ width: "1.125rem", height: "1.125rem" }} />
          </button>
        </div>
      ),
    },
  ];

  const childPartColumns = [
    {
      key: "productCode",
      label: "Product Code",
      headerAlign: "center",
      minWidth: "8rem",
      render: (val) => (
        <div style={{ textAlign: "center", width: "100%" }}>
          {emptyToDash(val)}
        </div>
      ),
    },
    {
      key: "productName",
      label: "Product Name",
      headerAlign: "center",
      minWidth: "10rem",
      render: (val) => (
        <div style={{ textAlign: "center", width: "100%" }}>
          {emptyToDash(val)}
        </div>
      ),
    },
    {
      key: "categoryName",
      label: "Category Name",
      headerAlign: "center",
      minWidth: "10rem",
      render: (val) => (
        <div style={{ textAlign: "center", width: "100%" }}>
          {emptyToDash(val)}
        </div>
      ),
    },
    {
      key: "requiredQty",
      label: "Required Qty",
      headerAlign: "center",
      minWidth: "8rem",
      render: (val) => (
        <div style={{ textAlign: "center", width: "100%" }}>
          {emptyToDash(val)}
        </div>
      ),
    },
  ];

  const viewProduct =
    (viewPlan &&
      (viewPlan.product ||
        viewPlan.product_details ||
        viewPlan.product_detail)) ||
    null;

  return (
    <div style={{ paddingBottom: theme.spacing.xl }}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <CommonHeading
        title="Production Planning"
        subtitle="Create and manage daily assembly plans"
      />

      <div style={filterBarStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.lg, flexWrap: 'nowrap', flexShrink: 0 }}>
          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: theme.spacing.sm,
              fontSize: theme.typography.fontSize.sm[0],
              color: theme.colors.text.primary,
            }}
          >
            {/* <CalendarDaysIcon style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0 }} /> */}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                borderRadius: theme.borderRadius.md,
                border: `1px solid ${theme.colors.gray[300]}`,
                fontSize: theme.typography.fontSize.sm[0],
                color: theme.colors.text.primary,
                backgroundColor: theme.colors.background.primary,
                cursor: 'pointer',
              }}
            />
          </label>
          {/* <div ref={lineDropdownRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setLineDropdownOpen((o) => !o)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: theme.spacing.sm,
                minWidth: '8rem',
                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                borderRadius: theme.borderRadius.md,
                border: `1px solid ${theme.colors.gray[300]}`,
                fontSize: theme.typography.fontSize.sm[0],
                color: theme.colors.text.primary,
                backgroundColor: theme.colors.background.primary,
                cursor: 'pointer',
              }}
            >
              <span>{line}</span>
              <ChevronDownIcon
                style={{
                  width: '1rem',
                  height: '1rem',
                  flexShrink: 0,
                  transform: lineDropdownOpen ? 'rotate(180deg)' : 'none',
                }}
              />
            </button>
            {lineDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: theme.spacing.xs,
                  minWidth: '100%',
                  backgroundColor: theme.colors.background.primary,
                  border: `1px solid ${theme.colors.gray[200]}`,
                  borderRadius: theme.borderRadius.md,
                  boxShadow: theme.shadows.lg,
                  zIndex: 10,
                  overflow: 'hidden',
                }}
              >
                {lines.map((l) => {
                  const isSelected = l === line;
                  return (
                    <button
                      key={l}
                      type="button"
                      onClick={() => {
                        setLine(l);
                        setLineDropdownOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: theme.spacing.sm,
                        width: '100%',
                        padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                        border: 'none',
                        fontSize: theme.typography.fontSize.sm[0],
                        textAlign: 'left',
                        cursor: 'pointer',
                        backgroundColor: isSelected
                          ? theme.colors.primary?.DEFAULT ?? theme.colors.info.DEFAULT
                          : 'transparent',
                        color: isSelected ? theme.colors.text.inverse : theme.colors.text.primary,
                      }}
                    >
                      {isSelected ? (
                        <CheckIcon style={{ width: '1rem', height: '1rem', flexShrink: 0 }} />
                      ) : (
                        <span style={{ width: '1rem', flexShrink: 0 }} />
                      )}
                      <span>{l}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div> */}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm, flexWrap: 'nowrap', flexShrink: 0 }}>
          <CommonButton
            variant="secondary"
            size="sm"
            icon={ArrowUpTrayIcon}
            onClick={() => {}}
          >
            Import
          </CommonButton>
          <CommonButton
            variant="secondary"
            size="sm"
            icon={ArrowDownTrayIcon}
            onClick={() => {}}
          >
            Export
          </CommonButton>
          <CommonButton
            variant="primary"
            size="sm"
            icon={PlusIcon}
            onClick={openAddPlanModal}
          >
            Add Plan
          </CommonButton>
        </div>
      </div>

      {/* Today's Assembly Plans */}
      <div
        style={{
          marginTop: theme.spacing.lg,
          backgroundColor: theme.colors.background.primary,
          borderRadius: theme.borderRadius.lg,
          boxShadow: theme.shadows.md,
          overflow: 'hidden',
        }}
      >
        <div style={blueBarStyle}>
          <span>Today&apos;s Assembly Plans</span>
        </div>

        {loading && (
          <div
            style={{
              padding: theme.spacing.xl,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CommonLoader message="Loading plans..." size="md" />
          </div>
        )}
        {error && (
          <div
            style={{
              padding: theme.spacing.md,
              textAlign: "center",
              color: theme.colors.error.DEFAULT,
            }}
          >
            {error}
          </div>
        )}

        <CommonDataGrid
          columns={assemblyColumns}
          data={plans}
          showSearch={false}
        />
      </div>

      {/* Auto Calculated Child Part Requirements */}
      <div
        style={{
          marginTop: theme.spacing.xl,
          backgroundColor: theme.colors.background.primary,
          borderRadius: theme.borderRadius.lg,
          boxShadow: theme.shadows.md,
          overflow: 'hidden',
        }}
      >
        <div style={blueBarStyle}>
          <span>Auto Calculated Child Part Requirements</span>
        </div>

        {childPlansLoading && (
          <div
            style={{
              padding: theme.spacing.xl,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CommonLoader message="Loading child part requirements..." size="md" />
          </div>
        )}

        <CommonDataGrid
          columns={childPartColumns}
          data={childPartTableData}
          showSearch={false}
        />
      </div>

      <CommonModal
        isOpen={addPlanModalOpen}
        onClose={closeAddPlanModal}
        title="Add Production Plan"
        size="md"
        showCloseButton
        closeOnBackdropClick
        footer={
          <>
            <CommonButton variant="secondary" size="md" onClick={closeAddPlanModal}>
              Cancel
            </CommonButton>
            <CommonButton variant="primary" size="md" onClick={handleAddPlanSubmit}>
              Add Plan
            </CommonButton>
          </>
        }
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: theme.spacing.lg,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: theme.spacing.lg,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: theme.spacing.xs,
              }}
            >
              <label
                style={{
                  fontSize: theme.typography.fontSize.sm[0],
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.colors.text.primary,
                }}
              >
                Date
              </label>
              <label style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                <input
                  type="date"
                  value={addPlanForm.date}
                  onChange={(e) => setAddPlanForm((f) => ({ ...f, date: e.target.value }))}
                  style={inputStyle}
                />
                <CalendarDaysIcon
                  style={{
                    position: 'absolute',
                    right: theme.spacing.md,
                    width: '1.25rem',
                    height: '1.25rem',
                    color: theme.colors.text.secondary,
                    pointerEvents: 'none',
                  }}
                />
              </label>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
              <label style={{ fontSize: theme.typography.fontSize.sm[0], fontWeight: theme.typography.fontWeight.medium, color: theme.colors.text.primary }}>
                Product Model <span style={{ color: theme.colors.error?.DEFAULT ?? '#dc2626' }}>*</span>
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <select
                  value={addPlanForm.model}
                  onChange={(e) => setAddPlanForm((f) => ({ ...f, model: e.target.value }))}
                  style={{ ...inputStyle, appearance: 'none', paddingRight: '2rem' }}
                >
                  {productOptions.length === 0 ? (
                    <option value="" disabled>
                      No products available
                    </option>
                  ) : (
                    <>
                      <option value="">Select model</option>
                      {productOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </>
                  )}
                </select>
                <ChevronDownIcon
                  style={{
                    position: 'absolute',
                    right: theme.spacing.md,
                    width: '1rem',
                    height: '1rem',
                    color: theme.colors.text.secondary,
                    pointerEvents: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: theme.spacing.lg,
              }}
            >
              {/* Resource first */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
                <label
                  style={{
                    fontSize: theme.typography.fontSize.sm[0],
                    fontWeight: theme.typography.fontWeight.medium,
                    color: theme.colors.text.primary,
                  }}
                >
                  Resource <span style={{ color: theme.colors.error?.DEFAULT ?? '#dc2626' }}>*</span>
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <select
                    value={addPlanForm.resource || ''}
                    onChange={(e) =>
                      setAddPlanForm((f) => ({
                        ...f,
                        resource: e.target.value,
                        workstation: "",
                      }))
                    }
                    style={{ ...inputStyle, appearance: 'none', paddingRight: '2rem' }}
                    disabled={planningResourcesLoading || resourceOptions.length === 0}
                  >
                    {planningResourcesLoading ? (
                      <option value="">Loading resources...</option>
                    ) : resourceOptions.length === 0 ? (
                      <option value="">No resources available</option>
                    ) : (
                      <>
                        <option value="">Select resource</option>
                        {resourceOptions.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                  <ChevronDownIcon
                    style={{
                      position: 'absolute',
                      right: theme.spacing.md,
                      width: '1rem',
                      height: '1rem',
                      color: theme.colors.text.secondary,
                      pointerEvents: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Workstation second */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
                <label
                  style={{
                    fontSize: theme.typography.fontSize.sm[0],
                    fontWeight: theme.typography.fontWeight.medium,
                    color: theme.colors.text.primary,
                  }}
                >
                  Workstation
                  <span style={{ color: theme.colors.error?.DEFAULT ?? '#dc2626' }}>*</span>
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <select
                    value={addPlanForm.workstation || ''}
                    onChange={(e) =>
                      setAddPlanForm((f) => ({
                        ...f,
                        workstation: e.target.value,
                      }))
                    }
                    style={{ ...inputStyle, appearance: 'none', paddingRight: '2rem' }}
                    disabled={
                      planningResourcesLoading ||
                      !addPlanForm.resource ||
                      workstationOptions.length === 0
                    }
                  >
                    {!addPlanForm.resource ? (
                      <option value="">Select resource first</option>
                    ) : workstationOptions.length === 0 ? (
                      <option value="" disabled>
                        No workstations available
                      </option>
                    ) : (
                      <>
                        <option value="">Select workstation</option>
                        {workstationOptions.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                  <ChevronDownIcon
                    style={{
                      position: 'absolute',
                      right: theme.spacing.md,
                      width: '1rem',
                      height: '1rem',
                      color: theme.colors.text.secondary,
                      pointerEvents: 'none',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
            <label style={{ fontSize: theme.typography.fontSize.sm[0], fontWeight: theme.typography.fontWeight.medium, color: theme.colors.text.primary }}>
              Total Planned Quantity
            </label>
            <input
              type="number"
              min={0}
              placeholder="Enter quantity"
              value={addPlanForm.totalQty}
              style={inputStyle}
              disabled
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
            <label style={{ fontSize: theme.typography.fontSize.sm[0], fontWeight: theme.typography.fontWeight.medium, color: theme.colors.text.primary }}>
              Shift-wise Split (Optional)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: theme.spacing.md }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
                <span style={{ fontSize: theme.typography.fontSize.xs[0], color: theme.colors.text.secondary }}>Shift 1</span>
                <input
                  type="number"
                  min={0}
                  placeholder="Qty"
                  value={addPlanForm.shift1}
                  onChange={(e) => setAddPlanForm((f) => ({ ...f, shift1: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
                <span style={{ fontSize: theme.typography.fontSize.xs[0], color: theme.colors.text.secondary }}>Shift 2</span>
                <input
                  type="number"
                  min={0}
                  placeholder="Qty"
                  value={addPlanForm.shift2}
                  onChange={(e) => setAddPlanForm((f) => ({ ...f, shift2: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
                <span style={{ fontSize: theme.typography.fontSize.xs[0], color: theme.colors.text.secondary }}>Shift 3</span>
                <input
                  type="number"
                  min={0}
                  placeholder="Qty"
                  value={addPlanForm.shift3}
                  onChange={(e) => setAddPlanForm((f) => ({ ...f, shift3: e.target.value }))}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        </div>
      </CommonModal>

      <CommonModal
        isOpen={Boolean(viewPlan)}
        onClose={() => setViewPlan(null)}
        title="Production Plan Details"
        size="md"
        showCloseButton
        closeOnBackdropClick
        footer={
          <CommonButton
            variant="danger"
            size="md"
            onClick={() => setViewPlan(null)}
          >
            Close
          </CommonButton>
        }
      >
        {viewPlan && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: theme.spacing.lg,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: theme.spacing.lg,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: theme.spacing.xs,
                }}
              >
                <span
                  style={{
                    fontSize: theme.typography.fontSize.xs[0],
                    color: theme.colors.text.secondary,
                  }}
                >
                  Date
                </span>
                <span
                  style={{
                    fontSize: theme.typography.fontSize.sm[0],
                    fontWeight: theme.typography.fontWeight.medium,
                  }}
                >
                  {viewPlan.date}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: theme.spacing.xs,
                }}
              >
                <span
                  style={{
                    fontSize: theme.typography.fontSize.xs[0],
                    color: theme.colors.text.secondary,
                  }}
                >
                  Product
                </span>
                <span
                  style={{
                    fontSize: theme.typography.fontSize.sm[0],
                    fontWeight: theme.typography.fontWeight.medium,
                  }}
                >
                  {viewProduct
                    ? `${
                        viewProduct.name || viewProduct.product_name || ""
                      }${
                        viewProduct.model_code || viewProduct.code
                          ? ` (${viewProduct.model_code || viewProduct.code})`
                          : ""
                      }`
                    : "–"}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: theme.spacing.xs,
                }}
              >
                <span
                  style={{
                    fontSize: theme.typography.fontSize.xs[0],
                    color: theme.colors.text.secondary,
                  }}
                >
                  Total Planned Qty
                </span>
                <span
                  style={{
                    fontSize: theme.typography.fontSize.sm[0],
                    fontWeight: theme.typography.fontWeight.medium,
                  }}
                >
                  {viewPlan.total_planned_quantity}
                </span>
              </div>
            </div>

            <div>
              <h4
                style={{
                  marginBottom: theme.spacing.sm,
                  fontSize: theme.typography.fontSize.sm[0],
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.text.primary,
                }}
              >
                Shift-wise Plan
              </h4>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: theme.typography.fontSize.sm[0],
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{ textAlign: "left", padding: theme.spacing.sm }}
                    >
                      Shift
                    </th>
                    <th
                      style={{ textAlign: "left", padding: theme.spacing.sm }}
                    >
                      Start Time
                    </th>
                    <th
                      style={{ textAlign: "left", padding: theme.spacing.sm }}
                    >
                      End Time
                    </th>
                    <th
                      style={{ textAlign: "right", padding: theme.spacing.sm }}
                    >
                      Duration (hrs)
                    </th>
                    <th
                      style={{ textAlign: "right", padding: theme.spacing.sm }}
                    >
                      Planned Qty
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(viewPlan.shifts || []).map((item, idx) => {
                    const shift = item.shift || {};
                    return (
                      <tr key={shift.id || idx}>
                        <td
                          style={{
                            padding: theme.spacing.sm,
                            borderTop: `1px solid ${theme.colors.gray[200]}`,
                          }}
                        >
                          {shift.name}
                        </td>
                        <td
                          style={{
                            padding: theme.spacing.sm,
                            borderTop: `1px solid ${theme.colors.gray[200]}`,
                          }}
                        >
                          {emptyToDash(shift.start_time)}
                        </td>
                        <td
                          style={{
                            padding: theme.spacing.sm,
                            borderTop: `1px solid ${theme.colors.gray[200]}`,
                          }}
                        >
                          {emptyToDash(shift.end_time)}
                        </td>
                        <td
                          style={{
                            padding: theme.spacing.sm,
                            borderTop: `1px solid ${theme.colors.gray[200]}`,
                            textAlign: "right",
                          }}
                        >
                          {emptyToDash(shift.duration)}
                        </td>
                        <td
                          style={{
                            padding: theme.spacing.sm,
                            borderTop: `1px solid ${theme.colors.gray[200]}`,
                            textAlign: "right",
                          }}
                        >
                          {item.planned_quantity}
                        </td>
                      </tr>
                    );
                  })}
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        padding: theme.spacing.sm,
                        borderTop: `1px solid ${theme.colors.gray[300]}`,
                        textAlign: "right",
                        fontWeight: theme.typography.fontWeight.medium,
                      }}
                    >
                      Total
                    </td>
                    <td
                      style={{
                        padding: theme.spacing.sm,
                        borderTop: `1px solid ${theme.colors.gray[300]}`,
                        textAlign: "right",
                        fontWeight: theme.typography.fontWeight.medium,
                      }}
                    >
                      {emptyToDash(viewPlan.total_planned_quantity)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CommonModal>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setPlanToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        itemName={planToDelete?.model}
        title="Delete Production Plan"
        isLoading={deleting}
      />
    </div>
  );
}

export default Productionplanning;
