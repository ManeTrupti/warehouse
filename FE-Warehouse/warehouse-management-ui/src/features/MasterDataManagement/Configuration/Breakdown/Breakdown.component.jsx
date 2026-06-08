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
import BreakdownModal from "./BreakdownModal.component";
import {
  getBreakdownContainerStyles,
  getSearchFilterBarStyles,
  getSearchInputContainerStyles,
  getSearchInputStyles,
  getActionsCellStyles,
  getEditIconStyles,
  getDeleteIconStyles,
} from "./Breakdown.styled";
import {
  fetchBreakdowns,
  createBreakdown,
  updateBreakdown,
  deleteBreakdown,
  selectBreakdowns,
  selectBreakdownsLoading,
  selectBreakdownsError,
  selectBreakdownsPagination,
  clearError,
} from "@core/store/slices/Configuration/breakdownsSlice";

function Breakdown() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const breakdowns = useSelector(selectBreakdowns) || [];
  const loading = useSelector(selectBreakdownsLoading);
  const error = useSelector(selectBreakdownsError);
  const pagination = useSelector(selectBreakdownsPagination);
  const { toasts, showError, showSuccess, removeToast } = useToast();

  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBreakdown, setSelectedBreakdown] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const hasFetchedRef = useRef(false);

  // Fetch breakdowns on mount (only once, even in React StrictMode)
  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      dispatch(fetchBreakdowns());
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

  // Filter breakdowns based on search
  const filteredBreakdowns = useMemo(() => {
    const list = breakdowns || [];
    return list.filter((item) => {
      const matchesSearch =
        !searchText ||
        item.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.breakdown_code?.toLowerCase().includes(searchText.toLowerCase());
      return matchesSearch;
    });
  }, [breakdowns, searchText]);

  const handleAdd = () => {
    setSelectedBreakdown(null);
    setIsModalOpen(true);
  };

  const handleEdit = (breakdown) => {
    setSelectedBreakdown(breakdown);
    setIsModalOpen(true);
  };

  const handleDelete = (breakdown) => {
    setSelectedBreakdown(breakdown);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async (formData) => {
    try {
      if (selectedBreakdown) {
        // Update existing breakdown via API
        await dispatch(
          updateBreakdown({
            id: selectedBreakdown.id,
            name: formData.name,
          }),
        ).unwrap();
        showSuccess("Breakdown updated successfully");
      } else {
        // Create new breakdown via API
        await dispatch(
          createBreakdown({
            name: formData.name,
          }),
        ).unwrap();
        showSuccess("Breakdown created successfully");
      }

      setIsModalOpen(false);
      setSelectedBreakdown(null);
      // Refresh list (stay on current page & page size)
      const currentPage = pagination?.currentPage || 1;
      const pageSize = pagination?.pageSize || 10;
      dispatch(
        fetchBreakdowns({
          page: currentPage,
          pageSize,
        }),
      );
    } catch (err) {
      console.error("Failed to save breakdown:", err);
      const errorMessage =
        err?.message ||
        err?.payload?.message ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Failed to save breakdown. Please try again.';
      showError(errorMessage);
    }
  };

  const confirmDelete = async () => {
    if (selectedBreakdown) {
      try {
        await dispatch(deleteBreakdown(selectedBreakdown.id)).unwrap();
        showSuccess("Breakdown deleted successfully");
        setIsDeleteDialogOpen(false);
        setSelectedBreakdown(null);
        // Refresh current page & page size
        const currentPage = pagination?.currentPage || 1;
        const pageSize = pagination?.pageSize || 10;
        dispatch(
          fetchBreakdowns({
            page: currentPage,
            pageSize,
          }),
        );
      } catch (err) {
        console.error("Failed to delete breakdown:", err);
        const errorMessage =
          err?.message ||
          err?.payload?.message ||
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          'Failed to delete breakdown. Please try again.';
        showError(errorMessage);
      }
    }
  };

  const containerStyles = useMemo(
    () => getBreakdownContainerStyles(theme),
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
      key: "name",
      label: "Breakdown Type",
      sortable: true,
      minWidth: "16rem",
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
      key: "breakdown_code",
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
          editAriaLabel="Edit breakdown"
          deleteAriaLabel="Delete breakdown"
        />
      ),
    },
  ];

  return (
    <div style={containerStyles}>
      <CommonHeading
        title={`Breakdown Types (${pagination?.count ?? filteredBreakdowns.length ?? 0})`}
        subtitle="Manage breakdown types for classifying equipment downtime"
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
            placeholder="Search breakdown types..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={searchInputStyles}
          />
        </div>
        <div style={{ marginLeft: "auto" }}>
          <CommonButton variant="primary" icon={PlusIcon} onClick={handleAdd}>
            Add Breakdown
          </CommonButton>
        </div>
      </div>

      {loading && filteredBreakdowns.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CommonLoader message="Loading breakdowns..." />
        </div>
      ) : (
        <CommonDataGrid
          columns={columns}
          data={filteredBreakdowns}
          showSearch={false}
          serverPagination
          page={pagination?.currentPage || 1}
          totalCount={pagination?.count ?? filteredBreakdowns.length}
          defaultPageSize={pagination?.pageSize || 10}
          pageSizeOptions={[5, 10, 25, 50, 100]}
          onPageChange={(newPage) => {
            const pageSize = pagination?.pageSize || 10;
            dispatch(
              fetchBreakdowns({
                page: newPage,
                pageSize,
              }),
            );
          }}
          onPageSizeChange={(newPageSize) => {
            dispatch(
              fetchBreakdowns({
                page: 1,
                pageSize: newPageSize,
              }),
            );
          }}
        />
      )}

      <BreakdownModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBreakdown(null);
        }}
        onSave={handleSave}
        breakdown={selectedBreakdown}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedBreakdown(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Breakdown"
        itemName={selectedBreakdown?.name}
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default Breakdown;

