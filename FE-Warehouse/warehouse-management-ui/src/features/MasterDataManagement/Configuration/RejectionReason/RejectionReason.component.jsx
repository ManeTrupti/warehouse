import { useState, useMemo, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "@core/theme";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { CommonDataGrid } from "@shared/components/CommonDataGrid";
import { CommonButton } from "@shared/components/CommonButton";
import { DeleteConfirmationDialog } from "@shared/components/DeleteConfirmationDialog";
import { CommonHeading } from "@shared/components/CommonHeading";
import { ToastContainer } from "@shared/components/Toast";
import { useToast } from "@shared/hooks/useToast";
import { CommonEditDeleteActions } from "@shared/components/CommonEditDeleteActions";
import CommonLoader from "@shared/components/CommonLoader";
import RejectionReasonModal from "./RejectionReasonModal.component";
import {
  getRejectionReasonContainerStyles,
  getSearchFilterBarStyles,
  getSearchInputContainerStyles,
  getSearchInputStyles,
  getActionsCellStyles,
  getEditIconStyles,
  getDeleteIconStyles,
} from "./RejectionReason.styled";
import {
  fetchRejectionReasons,
  createRejectionReason,
  updateRejectionReason,
  deleteRejectionReason,
  selectRejectionReasons,
  selectRejectionReasonsLoading,
  selectRejectionReasonsError,
  selectRejectionReasonsPagination,
  clearError,
} from "@core/store/slices/Configuration/rejectionReasonsSlice";

function RejectionReason() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const rejectionReasons = useSelector(selectRejectionReasons) || [];
  const loading = useSelector(selectRejectionReasonsLoading);
  const error = useSelector(selectRejectionReasonsError);
  const pagination = useSelector(selectRejectionReasonsPagination);
  const { toasts, showError, showSuccess, removeToast } = useToast();
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRejectionReason, setSelectedRejectionReason] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const hasFetchedRef = useRef(false);

  // Fetch rejection reasons on mount (only once, even in React StrictMode)
  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      dispatch(fetchRejectionReasons());
    }
  }, [dispatch]);

  // Show toast for API errors
  useEffect(() => {
    if (error) {
      const errorMessage =
        typeof error === 'string'
          ? error
          : error?.message ||
            error?.payload?.message ||
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            'An error occurred. Please try again.';
      showError(errorMessage);
      dispatch(clearError());
    }
  }, [error, showError, dispatch]);

  // Filter rejection reasons based on search
  const filteredRejectionReasons = useMemo(() => {
    return rejectionReasons.filter((reason) => {
      const matchesSearch =
        !searchText ||
        reason.reason?.toLowerCase().includes(searchText.toLowerCase());
      return matchesSearch;
    });
  }, [rejectionReasons, searchText]);

  const handleAddRejectionReason = () => {
    setSelectedRejectionReason(null);
    setIsModalOpen(true);
  };

  const handleEditRejectionReason = (reason) => {
    setSelectedRejectionReason(reason);
    setIsModalOpen(true);
  };

  const handleDeleteRejectionReason = (reason) => {
    setSelectedRejectionReason(reason);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedRejectionReason) {
      try {
        await dispatch(
          deleteRejectionReason(selectedRejectionReason.id),
        ).unwrap();
        showSuccess("Rejection reason deleted successfully");
        setIsDeleteDialogOpen(false);
        setSelectedRejectionReason(null);
        // Refresh rejection reasons list
        dispatch(fetchRejectionReasons());
      } catch (err) {
        console.error("Failed to delete rejection reason:", err);
        const errorMessage =
          err?.message ||
          err?.payload?.message ||
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          'Failed to delete rejection reason. Please try again.';
        showError(errorMessage);
      }
    }
  };

  const handleSaveRejectionReason = async (formData) => {
    try {
      if (selectedRejectionReason) {
        // Update existing rejection reason via API
        await dispatch(
          updateRejectionReason({
            id: selectedRejectionReason.id,
            reason: formData.reason,
          }),
        ).unwrap();
        showSuccess("Rejection reason updated successfully");
      } else {
        // Add new rejection reason via API
        await dispatch(
          createRejectionReason({
            reason: formData.reason,
          }),
        ).unwrap();
        showSuccess("Rejection reason created successfully");
      }
      setIsModalOpen(false);
      setSelectedRejectionReason(null);
      // Refresh rejection reasons list
      dispatch(fetchRejectionReasons());
    } catch (err) {
      console.error("Failed to save rejection reason:", err);
      const errorMessage =
        err?.message ||
        err?.payload?.message ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Failed to save rejection reason. Please try again.';
      showError(errorMessage);
    }
  };

  const containerStyles = useMemo(
    () => getRejectionReasonContainerStyles(theme),
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
      label: "Rejection Reason",
      sortable: true,
      minWidth: "40rem",
      render: (value) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: theme.spacing.sm,
          }}
        >
          <ExclamationTriangleIcon
            style={{
              width: "1rem",
              height: "1rem",
              color: theme.colors.error.DEFAULT,
            }}
          />
          <span style={{ fontWeight: theme.typography.fontWeight.medium }}>
            {value}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      minWidth: "3rem",
      render: (_, row) => (
        <CommonEditDeleteActions
          onEdit={() => handleEditRejectionReason(row)}
          onDelete={() => handleDeleteRejectionReason(row)}
          editAriaLabel="Edit rejection reason"
          deleteAriaLabel="Delete rejection reason"
        />
      ),
    },
  ];

  return (
    <div style={containerStyles}>
      {/* Rejection Reason Title */}
      <CommonHeading
        title={`Rejection Reasons (${pagination?.count ?? filteredRejectionReasons.length ?? 0})`}
        subtitle="Manage rejection reasons for tracking production quality issues"
      />

      {/* Search and Filter Bar */}
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
            placeholder="Search rejection reasons..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={searchInputStyles}
          />
        </div>
        <div style={{ marginLeft: "auto" }}>
          <CommonButton
            variant="primary"
            icon={PlusIcon}
            onClick={handleAddRejectionReason}
          >
            Add Rejection Reason
          </CommonButton>
        </div>
      </div>

      {/* Data Grid */}
      {loading && filteredRejectionReasons.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CommonLoader message="Loading rejection reasons..." />
        </div>
      ) : (
        <CommonDataGrid
          columns={columns}
          data={filteredRejectionReasons}
          showSearch={false}
          serverPagination
          page={pagination?.currentPage || 1}
          totalCount={pagination?.count ?? filteredRejectionReasons.length}
          defaultPageSize={pagination?.pageSize || 10}
          pageSizeOptions={[5,10, 25, 50, 100]}
          onPageChange={(newPage) => {
            const pageSize = pagination?.pageSize || 10;
            dispatch(
              fetchRejectionReasons({
                page: newPage,
                pageSize,
              }),
            );
          }}
          onPageSizeChange={(newPageSize) => {
            dispatch(
              fetchRejectionReasons({
                page: 1,
                pageSize: newPageSize,
              }),
            );
          }}
        />
      )}

      {/* Add/Edit Modal */}
      <RejectionReasonModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRejectionReason(null);
        }}
        onSave={handleSaveRejectionReason}
        rejectionReason={selectedRejectionReason}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedRejectionReason(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Rejection Reason"
        itemName={selectedRejectionReason?.reason}
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default RejectionReason;
