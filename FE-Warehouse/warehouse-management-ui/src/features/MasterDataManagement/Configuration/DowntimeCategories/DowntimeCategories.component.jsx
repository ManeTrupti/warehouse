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
import DowntimeCategoriesModal from "./DowntimeCategoriesModal.component";
import {
  getDowntimeCategoriesContainerStyles,
  getSearchFilterBarStyles,
  getSearchInputContainerStyles,
  getSearchInputStyles,
  getActionsCellStyles,
  getEditIconStyles,
  getDeleteIconStyles,
} from "./DowntimeCategories.styled";
import {
  fetchDowntimeCategories,
  createDowntimeCategory,
  updateDowntimeCategory,
  deleteDowntimeCategory,
  selectDowntimeCategories,
  selectDowntimeCategoriesLoading,
  selectDowntimeCategoriesError,
  selectDowntimeCategoriesPagination,
  clearError as clearDowntimeError,
} from "@core/store/slices/Configuration/downtimeCategoriesSlice";

function DowntimeCategories() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const downtimeCategories = useSelector(selectDowntimeCategories) || [];
  const loading = useSelector(selectDowntimeCategoriesLoading);
  const error = useSelector(selectDowntimeCategoriesError);
  const pagination = useSelector(selectDowntimeCategoriesPagination);
  const { toasts, showError, showSuccess, removeToast } = useToast();
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDowntimeCategory, setSelectedDowntimeCategory] =
    useState(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const hasFetchedRef = useRef(false);

  // Fetch downtime categories on mount (only once, even in React StrictMode)
  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      dispatch(fetchDowntimeCategories());
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
      dispatch(clearDowntimeError());
    }
  }, [error, showError, dispatch]);

  const filteredDowntimeCategories = useMemo(() => {
    return downtimeCategories.filter((category) => {
      const matchesSearch =
        !searchText ||
        category.category?.toLowerCase().includes(searchText.toLowerCase());
      return matchesSearch;
    });
  }, [downtimeCategories, searchText]);

  const handleAdd = () => {
    setSelectedDowntimeCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category) => {
    setSelectedDowntimeCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = (category) => {
    setSelectedDowntimeCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = (formData) => {
    if (selectedDowntimeCategory) {
      // Update existing downtime category via API
      dispatch(
        updateDowntimeCategory({
          id: selectedDowntimeCategory.id,
          category: formData.category,
        }),
      )
        .unwrap()
        .then(() => {
          showSuccess("Downtime category updated successfully");
          dispatch(fetchDowntimeCategories());
        })
        .catch((err) => {
          console.error("Failed to update downtime category:", err);
          const errorMessage =
            err?.message ||
            err?.payload?.message ||
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            'Failed to update downtime category. Please try again.';
          showError(errorMessage);
        });
    } else {
      // Add new downtime category via API
      dispatch(
        createDowntimeCategory({
          category: formData.category,
        }),
      )
        .unwrap()
        .then(() => {
          showSuccess("Downtime category created successfully");
          dispatch(fetchDowntimeCategories());
        })
        .catch((err) => {
          console.error("Failed to create downtime category:", err);
          const errorMessage =
            err?.message ||
            err?.payload?.message ||
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            'Failed to create downtime category. Please try again.';
          showError(errorMessage);
        });
    }
    setIsModalOpen(false);
    setSelectedDowntimeCategory(null);
  };

  const confirmDelete = () => {
    if (selectedDowntimeCategory) {
      dispatch(deleteDowntimeCategory(selectedDowntimeCategory.id))
        .unwrap()
        .then(() => {
          showSuccess("Downtime category deleted successfully");
          setIsDeleteDialogOpen(false);
          setSelectedDowntimeCategory(null);
          dispatch(fetchDowntimeCategories());
        })
        .catch((err) => {
          console.error("Failed to delete downtime category:", err);
          const errorMessage =
            err?.message ||
            err?.payload?.message ||
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            'Failed to delete downtime category. Please try again.';
          showError(errorMessage);
        });
    }
  };

  const containerStyles = useMemo(
    () => getDowntimeCategoriesContainerStyles(theme),
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
      key: "category",
      label: "Downtime Category",
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
          <ClockIcon
            style={{
              width: "1rem",
              height: "1rem",
              color: theme.colors.primary.DEFAULT,
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
          onEdit={() => handleEdit(row)}
          onDelete={() => handleDelete(row)}
          editAriaLabel="Edit category"
          deleteAriaLabel="Delete category"
        />
      ),
    },
  ];

  return (
    <div style={containerStyles}>
      <CommonHeading
        title={`Downtime Categories (${pagination?.count ?? filteredDowntimeCategories.length ?? 0})`}
        subtitle="Manage downtime categories for tracking production interruptions"
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
            placeholder="Search downtime categories..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={searchInputStyles}
          />
        </div>
        <div style={{ marginLeft: "auto" }}>
          <CommonButton variant="primary" icon={PlusIcon} onClick={handleAdd}>
            Add Category
          </CommonButton>
        </div>
      </div>

      {loading && filteredDowntimeCategories.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CommonLoader message="Loading downtime categories..." />
        </div>
      ) : (
        <CommonDataGrid
          columns={columns}
          data={filteredDowntimeCategories}
          showSearch={false}
          serverPagination
          page={pagination?.currentPage || 1}
          totalCount={pagination?.count ?? filteredDowntimeCategories.length}
          defaultPageSize={pagination?.pageSize || 10}
          pageSizeOptions={[5,10, 25, 50, 100]}
          onPageChange={(newPage) => {
            const pageSize = pagination?.pageSize || 10;
            dispatch(
              fetchDowntimeCategories({
                page: newPage,
                pageSize,
              }),
            );
          }}
          onPageSizeChange={(newPageSize) => {
            dispatch(
              fetchDowntimeCategories({
                page: 1,
                pageSize: newPageSize,
              }),
            );
          }}
        />
      )}

      <DowntimeCategoriesModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDowntimeCategory(null);
        }}
        onSave={handleSave}
        downtimeCategory={selectedDowntimeCategory}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedDowntimeCategory(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Downtime Category"
        itemName={selectedDowntimeCategory?.category}
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default DowntimeCategories;
