import { useState, useMemo, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "@core/theme";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { CommonDataGrid } from "@shared/components/CommonDataGrid";
import { CommonButton } from "@shared/components/CommonButton";
import { DeleteConfirmationDialog } from "@shared/components/DeleteConfirmationDialog";
import { CommonHeading } from "@shared/components/CommonHeading";
import { ToastContainer } from "@shared/components/Toast";
import { useToast } from "@shared/hooks/useToast";
import { CommonEditDeleteActions } from "@shared/components/CommonEditDeleteActions";
import CommonLoader from "@shared/components/CommonLoader";
import ProductionLossReasonsModal from "./ProductionLossReasonsModal.component";
import {
  getProductionLossReasonsContainerStyles,
  getSearchFilterBarStyles,
  getSearchInputContainerStyles,
  getSearchInputStyles,
  getActionsCellStyles,
} from "./ProductionLossReasons.styled";
import {
  fetchProductionLossReasons,
  createProductionLossReason,
  updateProductionLossReason,
  deleteProductionLossReason,
  selectProductionLossReasons,
  selectProductionLossReasonsLoading,
  selectProductionLossReasonsError,
  selectProductionLossReasonsPagination,
  clearError,
} from "@core/store/slices/Configuration/productionLossReasonsSlice";

function ProductionLossReasons() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const productionLossReasons = useSelector(selectProductionLossReasons) || [];
  const loading = useSelector(selectProductionLossReasonsLoading);
  const error = useSelector(selectProductionLossReasonsError);
  const pagination = useSelector(selectProductionLossReasonsPagination);
  const { toasts, showError, showSuccess, removeToast } = useToast();

  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProductionLossReason, setSelectedProductionLossReason] =
    useState(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const hasFetchedRef = useRef(false);

  // Fetch production loss reasons on mount (only once, even in React StrictMode)
  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      dispatch(fetchProductionLossReasons());
    }
  }, [dispatch]);

  // Show toast for API errors
  useEffect(() => {
    if (error) {
      const errorMessage =
        typeof error === "string"
          ? error
          : error?.message ||
            error?.payload?.message ||
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            "An error occurred. Please try again.";
      showError(errorMessage);
      dispatch(clearError());
    }
  }, [error, showError, dispatch]);

  // Filter production loss reasons based on search
  const filteredProductionLossReasons = useMemo(() => {
    const reasons = productionLossReasons || [];
    return reasons.filter((reason) => {
      const matchesSearch =
        !searchText ||
        reason.reason?.toLowerCase().includes(searchText.toLowerCase()) ||
        reason.production_loss_code
          ?.toLowerCase()
          .includes(searchText.toLowerCase());
      return matchesSearch;
    });
  }, [productionLossReasons, searchText]);

  const handleAdd = () => {
    setSelectedProductionLossReason(null);
    setIsModalOpen(true);
  };

  const handleEdit = (reason) => {
    setSelectedProductionLossReason(reason);
    setIsModalOpen(true);
  };

  const handleDelete = (reason) => {
    setSelectedProductionLossReason(reason);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async (formData) => {
    try {
      if (selectedProductionLossReason) {
        // Update existing production loss reason via API
        await dispatch(
          updateProductionLossReason({
            id: selectedProductionLossReason.id,
            reason: formData.reason,
          }),
        ).unwrap();
        showSuccess("Production loss reason updated successfully");
      } else {
        // Add new production loss reason via API
        await dispatch(
          createProductionLossReason({
            reason: formData.reason,
          }),
        ).unwrap();
        showSuccess("Production loss reason created successfully");
      }
      setIsModalOpen(false);
      setSelectedProductionLossReason(null);
      // Refresh list (stay on current page & page size)
      const currentPage = pagination?.currentPage || 1;
      const pageSize = pagination?.pageSize || 10;
      dispatch(
        fetchProductionLossReasons({
          page: currentPage,
          pageSize,
        }),
      );
    } catch (err) {
      console.error("Failed to save production loss reason:", err);
      const errorMessage =
        err?.message ||
        err?.payload?.message ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to save production loss reason. Please try again.";
      showError(errorMessage);
    }
  };

  const confirmDelete = async () => {
    if (selectedProductionLossReason) {
      try {
        await dispatch(
          deleteProductionLossReason(selectedProductionLossReason.id),
        ).unwrap();
        showSuccess("Production loss reason deleted successfully");
        setIsDeleteDialogOpen(false);
        setSelectedProductionLossReason(null);
        // Refresh current page & page size
        const currentPage = pagination?.currentPage || 1;
        const pageSize = pagination?.pageSize || 10;
        dispatch(
          fetchProductionLossReasons({
            page: currentPage,
            pageSize,
          }),
        );
      } catch (err) {
        console.error("Failed to delete production loss reason:", err);
        const errorMessage =
          err?.message ||
          err?.payload?.message ||
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to delete production loss reason. Please try again.";
        showError(errorMessage);
      }
    }
  };

  const containerStyles = useMemo(
    () => getProductionLossReasonsContainerStyles(theme),
    [theme],
  );

  const searchFilterBarStyles = useMemo(
    () => getSearchFilterBarStyles(theme),
    [theme],
  );

  const searchInputContainerStyles = useMemo(
    () => getSearchInputContainerStyles(theme),
    [theme],
  );

  const searchInputStyles = useMemo(
    () => getSearchInputStyles(theme, searchFocused),
    [theme, searchFocused],
  );

  const columns = [
    {
      key: "reason",
      label: "Production Loss Reason",
      sortable: true,
      minWidth: "18rem",
      render: (value) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: theme.spacing.sm,
          }}
        >
          <TagIcon
            style={{
              width: "1rem",
              height: "1rem",
              color: theme.colors.warning.DEFAULT,
            }}
          />
          <span
            style={{ fontWeight: theme.typography.fontWeight.medium }}
          >
            {value}
          </span>
        </div>
      ),
    },
    {
      key: "production_loss_code",
      label: "Code",
      sortable: true,
      minWidth: "8rem",
      render: (value) => (
        <span
          style={{
            color: theme.colors.text.secondary,
            fontSize: theme.typography.fontSize.sm[0],
          }}
        >
          {value || "-"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      minWidth: "8rem",
      render: (_, row) => (
        <CommonEditDeleteActions
          onEdit={() => handleEdit(row)}
          onDelete={() => handleDelete(row)}
          editAriaLabel="Edit production loss reason"
          deleteAriaLabel="Delete production loss reason"
        />
      ),
    },
  ];

  return (
    <div style={containerStyles}>
      <CommonHeading
        title={`Production Loss Reasons (${pagination?.count ?? productionLossReasons.length ?? 0})`}
        subtitle="Manage reasons for production losses for better OEE and performance analysis"
      />

      <div style={searchFilterBarStyles}>
        <div style={searchInputContainerStyles}>
          <MagnifyingGlassIcon
            style={{
              position: "absolute",
              left: theme.spacing.sm,
              top: "50%",
              transform: "translateY(-50%)",
              width: "1rem",
              height: "1rem",
              color: theme.colors.text.secondary,
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            placeholder="Search production loss reasons or codes..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={searchInputStyles}
          />
        </div>
        <div style={{ marginLeft: "auto" }}>
          <CommonButton variant="primary" icon={PlusIcon} onClick={handleAdd}>
            Add Reason
          </CommonButton>
        </div>
      </div>

      {loading && filteredProductionLossReasons.length === 0 ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
          }}
        >
          <CommonLoader message="Loading production loss reasons..." />
        </div>
      ) : (
        <CommonDataGrid
          columns={columns}
          data={filteredProductionLossReasons}
          showSearch={false}
          serverPagination
          page={pagination?.currentPage || 1}
          totalCount={
            pagination?.count ?? filteredProductionLossReasons.length
          }
          defaultPageSize={pagination?.pageSize || 10}
          pageSizeOptions={[5,10, 25, 50, 100]}
          onPageChange={(newPage) => {
            const pageSize = pagination?.pageSize || 10;
            dispatch(
              fetchProductionLossReasons({
                page: newPage,
                pageSize,
              }),
            );
          }}
          onPageSizeChange={(newPageSize) => {
            dispatch(
              fetchProductionLossReasons({
                page: 1,
                pageSize: newPageSize,
              }),
            );
          }}
        />
      )}

      <ProductionLossReasonsModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProductionLossReason(null);
        }}
        onSave={handleSave}
        productionLossReason={selectedProductionLossReason}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedProductionLossReason(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Production Loss Reason"
        itemName={selectedProductionLossReason?.reason}
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default ProductionLossReasons;

