import { useState, useMemo, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "@core/theme";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { CommonDataGrid } from "@shared/components/CommonDataGrid";
import { CommonButton } from "@shared/components/CommonButton";
import { DeleteConfirmationDialog } from "@shared/components/DeleteConfirmationDialog";
import { CommonHeading } from "@shared/components/CommonHeading";
import { ToastContainer } from "@shared/components/Toast";
import { useToast } from "@shared/hooks/useToast";
import { CommonEditDeleteActions } from "@shared/components/CommonEditDeleteActions";
import CommonLoader from "@shared/components/CommonLoader";
import DowntimeReasonsModal from "./DowntimeReasonsModal.component";
import {
  getDowntimeReasonsContainerStyles,
  getSearchFilterBarStyles,
  getSearchInputContainerStyles,
  getSearchInputStyles,
  getActionsCellStyles,
  getEditIconStyles,
  getDeleteIconStyles,
} from "./DowntimeReasons.styled";
import {
  fetchDowntimeReasons,
  createDowntimeReason,
  updateDowntimeReason,
  deleteDowntimeReason,
  selectDowntimeReasons,
  selectDowntimeReasonsLoading,
  selectDowntimeReasonsError,
  selectDowntimeReasonsPagination,
  clearError,
} from "@core/store/slices/Configuration/downtimeReasonsSlice";

function DowntimeReasons() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const downtimeReasons = useSelector(selectDowntimeReasons);
  const loading = useSelector(selectDowntimeReasonsLoading);
  const error = useSelector(selectDowntimeReasonsError);
  const pagination = useSelector(selectDowntimeReasonsPagination);
  const { toasts, showError, showSuccess, removeToast } = useToast();
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDowntimeReason, setSelectedDowntimeReason] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const hasFetchedRef = useRef(false);

  // Fetch downtime reasons on mount (only once, even in React StrictMode)
  // Categories are fetched when modal opens
  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      dispatch(fetchDowntimeReasons());
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

  // Filter downtime reasons based on search
  const filteredDowntimeReasons = useMemo(() => {
    const reasons = downtimeReasons || [];
    return reasons.filter((reason) => {
      const categoryName =
        reason.category_details?.category ||
        reason.category?.category ||
        "";

      const matchesSearch =
        !searchText ||
        reason.reason?.toLowerCase().includes(searchText.toLowerCase()) ||
        categoryName.toLowerCase().includes(searchText.toLowerCase());

      return matchesSearch;
    });
  }, [downtimeReasons, searchText]);

  const handleAdd = () => {
    setSelectedDowntimeReason(null);
    setIsModalOpen(true);
  };

  const handleEdit = (reason) => {
    setSelectedDowntimeReason(reason);
    setIsModalOpen(true);
  };

  const handleDelete = (reason) => {
    setSelectedDowntimeReason(reason);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async (formData) => {
    try {
      if (selectedDowntimeReason) {
        // Update existing downtime reason via API
        await dispatch(
          updateDowntimeReason({
            id: selectedDowntimeReason.id,
            category: formData.category,
            reason: formData.reason,
          }),
        ).unwrap();
        showSuccess('Downtime reason updated successfully');
      } else {
        // Add new downtime reason via API
        await dispatch(
          createDowntimeReason({
            category: formData.category,
            reason: formData.reason,
          }),
        ).unwrap();
        showSuccess('Downtime reason created successfully');
      }
      setIsModalOpen(false);
      setSelectedDowntimeReason(null);
      // Refresh downtime reasons list
      dispatch(fetchDowntimeReasons());
    } catch (err) {
      console.error('Failed to save downtime reason:', err);
      const errorMessage =
        err?.message ||
        err?.payload?.message ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Failed to save downtime reason. Please try again.';
      showError(errorMessage);
    }
  };

  const confirmDelete = async () => {
    if (selectedDowntimeReason) {
      try {
        await dispatch(deleteDowntimeReason(selectedDowntimeReason.id)).unwrap();
        showSuccess('Downtime reason deleted successfully');
        setIsDeleteDialogOpen(false);
        setSelectedDowntimeReason(null);
        // Refresh downtime reasons list
        dispatch(fetchDowntimeReasons());
      } catch (err) {
        console.error('Failed to delete downtime reason:', err);
        const errorMessage =
          err?.message ||
          err?.payload?.message ||
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          'Failed to delete downtime reason. Please try again.';
        showError(errorMessage);
      }
    }
  };

  const containerStyles = useMemo(
    () => getDowntimeReasonsContainerStyles(theme),
    [theme]
  );

  const searchFilterBarStyles = useMemo(
    () => getSearchFilterBarStyles(theme),
    [theme]
  );

  const searchInputContainerStyles = useMemo(
    () => getSearchInputContainerStyles(theme),
    [theme]
  );

  const searchInputStyles = useMemo(
    () => getSearchInputStyles(theme, searchFocused),
    [theme, searchFocused]
  );

  const columns = [
    {
      key: "reason",
      label: "Downtime Reason",
      sortable: true,
      minWidth: "15rem",
      render: (value) => (
        <div style={{ display: "flex", alignItems: "center", gap: theme.spacing.sm }}>
          <ClockIcon
            style={{
              width: "1rem",
              height: "1rem",
              color: theme.colors.warning.DEFAULT,
            }}
          />
          <span style={{ fontWeight: theme.typography.fontWeight.medium }}>
            {value}
          </span>
        </div>
      ),
    },
    {
      key: "category_details",
      label: "Category",
      sortable: true,
      minWidth: "15rem",
      render: (value, row) => {
        const displayCategory =
          row?.category_details?.category ||
          row?.category?.category ||
          "-";

        return (
          <span
            style={{
              color: theme.colors.text.secondary,
              fontSize: theme.typography.fontSize.sm[0],
            }}
          >
            {displayCategory}
          </span>
        );
      },
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
          editAriaLabel="Edit downtime reason"
          deleteAriaLabel="Delete downtime reason"
        />
      ),
    },
  ];

  return (
    <div style={containerStyles}>
      <CommonHeading
        title={`Downtime Reasons (${pagination?.count ?? filteredDowntimeReasons.length ?? 0})`}
        subtitle="Manage specific downtime reasons for production tracking"
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
            placeholder="Search downtime reasons..."
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

      {loading && filteredDowntimeReasons.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CommonLoader message="Loading downtime reasons..." />
        </div>
      ) : (
        <CommonDataGrid
          columns={columns}
          data={filteredDowntimeReasons}
          showSearch={false}
          serverPagination
          page={pagination?.currentPage || 1}
          totalCount={pagination?.count ?? filteredDowntimeReasons.length}
          defaultPageSize={pagination?.pageSize || 10}
          pageSizeOptions={[5,10, 25, 50, 100]}
          onPageChange={(newPage) => {
            const pageSize = pagination?.pageSize || 10;
            dispatch(
              fetchDowntimeReasons({
                page: newPage,
                pageSize,
              }),
            );
          }}
          onPageSizeChange={(newPageSize) => {
            dispatch(
              fetchDowntimeReasons({
                page: 1,
                pageSize: newPageSize,
              }),
            );
          }}
        />
      )}

      <DowntimeReasonsModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDowntimeReason(null);
        }}
        onSave={handleSave}
        downtimeReason={selectedDowntimeReason}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedDowntimeReason(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Downtime Reason"
        itemName={selectedDowntimeReason?.reason}
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default DowntimeReasons;

