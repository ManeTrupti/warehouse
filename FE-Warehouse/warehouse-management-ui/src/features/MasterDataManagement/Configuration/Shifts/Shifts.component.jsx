import { useState, useMemo, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "@core/theme";
import { PlusIcon } from "@heroicons/react/24/outline";
import { CommonButton } from "@shared/components/CommonButton";
import { CommonHeading } from "@shared/components/CommonHeading";
import { DeleteConfirmationDialog } from "@shared/components/DeleteConfirmationDialog";
import { ToastContainer } from "@shared/components/Toast";
import { useToast } from "@shared/hooks/useToast";
import CommonLoader from "@shared/components/CommonLoader";
import ShiftModal from "./ShiftModal.component";
import {
  getShiftsContainerStyles,
  getShiftsGridStyles,
} from "./Shifts.styled";
import { CommonEditDeleteActions } from "@shared/components/CommonEditDeleteActions";
import {
  fetchShifts,
  createShift,
  updateShift,
  deleteShift,
  selectShifts,
  selectShiftsLoading,
  selectShiftsError,
  selectShiftsCreating,
  selectShiftsUpdating,
  selectShiftsDeleting,
  clearError,
} from "@core/store/slices/Configuration/shiftsSlice";

const Shifts = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const shifts = useSelector(selectShifts);
  const loading = useSelector(selectShiftsLoading);
  const error = useSelector(selectShiftsError);
  const creating = useSelector(selectShiftsCreating);
  const updating = useSelector(selectShiftsUpdating);
  const deleting = useSelector(selectShiftsDeleting);
  const { toasts, showError, showSuccess, removeToast } = useToast();
  const hasFetchedRef = useRef(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  // Fetch shifts on component mount (only once)
  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      dispatch(fetchShifts());
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

  // Show success toasts for successful operations
  useEffect(() => {
    if (!creating && !updating && !deleting && shifts.length > 0 && hasFetchedRef.current) {
      // Success is handled in handleSave and handleConfirmDelete
    }
  }, [creating, updating, deleting, shifts.length]);

  const handleAdd = () => {
    setSelectedShift(null);
    setIsModalOpen(true);
  };

  const handleEdit = (shift) => {
    setSelectedShift(shift);
    setIsModalOpen(true);
  };

  const handleDelete = (shift) => {
    setDeleteItem(shift);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async (formData) => {
    try {
    if (selectedShift) {
        // Update existing shift
        await dispatch(updateShift({ 
          id: selectedShift.id, 
          shiftData: {
            name: formData.name,
            start_time: formData.start_time,
            end_time: formData.end_time,
          }
        })).unwrap();
        showSuccess('Shift updated successfully');
    } else {
        // Create new shift
        await dispatch(createShift({
          name: formData.name,
          start_time: formData.start_time,
          end_time: formData.end_time,
        })).unwrap();
        showSuccess('Shift created successfully');
    }
    setIsModalOpen(false);
    setSelectedShift(null);
      // Refresh shifts list
      dispatch(fetchShifts());
    } catch (err) {
      console.error('Failed to save shift:', err);
      const errorMessage =
        err?.message ||
        err?.payload?.message ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Failed to save shift. Please try again.';
      showError(errorMessage);
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteItem) {
      try {
        await dispatch(deleteShift(deleteItem.id)).unwrap();
        showSuccess('Shift deleted successfully');
      setIsDeleteDialogOpen(false);
      setDeleteItem(null);
        // Refresh shifts list
        dispatch(fetchShifts());
      } catch (err) {
        console.error('Failed to delete shift:', err);
        const errorMessage =
          err?.message ||
          err?.payload?.message ||
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          'Failed to delete shift. Please try again.';
        showError(errorMessage);
      }
    }
  };

  const getCardColor = (index) => {
    const colors = [
      theme.colors.primary[50] || "#EFF6FF",
      theme.colors.purple?.[50] || "#F3E8FF",
      theme.colors.primary[50] || "#EFF6FF",
    ];
    return colors[index % colors.length];
  };

  const getCardBorderColor = (index) => {
    const colors = [
      theme.colors.primary[200] || "#BFDBFE",
      theme.colors.purple?.[200] || "#E9D5FF",
      theme.colors.primary[200] || "#BFDBFE",
    ];
    return colors[index % colors.length];
  };

  const containerStyles = useMemo(
    () => getShiftsContainerStyles(theme),
    [theme]
  );

  const gridStyles = useMemo(
    () => getShiftsGridStyles(theme),
    [theme]
  );

  // Calculate duration for display
  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return "N/A";
    const start = new Date(`2000-01-01T${startTime}`);
    let end = new Date(`2000-01-01T${endTime}`);
    if (end <= start) {
      end = new Date(`2000-01-02T${endTime}`);
    }
    const diffMs = end - start;
    const diffHours = diffMs / (1000 * 60 * 60);
    return `${diffHours.toFixed(1)} hours`;
  };

  return (
    <div style={containerStyles}>
      <CommonHeading
        title="Shift Configuration"
        subtitle="Define shift timings and patterns"
        rightContent={
          <CommonButton 
            icon={PlusIcon} 
            onClick={handleAdd} 
            variant="primary"
            disabled={loading || creating}
          >
            Add Shift
          </CommonButton>
        }
      />

      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: theme.spacing.xl,
            minHeight: '400px',
          }}
        >
          <CommonLoader message="Loading shifts..." />
        </div>
      ) : shifts.length === 0 ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: theme.spacing.xl,
            fontSize: theme.typography.fontSize.base[0],
            color: theme.colors.text.secondary,
          }}
        >
          No shifts found. Add a new shift to get started.
        </div>
      ) : (
      <div style={gridStyles}>
        {shifts.map((shift, index) => {
          const cardColor = getCardColor(index);
          const borderColor = getCardBorderColor(index);
            const startTime = shift.start_time || shift.startTime;
            const endTime = shift.end_time || shift.endTime;
            const duration = calculateDuration(startTime, endTime);
            
          return (
          <div
            key={shift.id}
            style={{
              backgroundColor: cardColor,
              border: `2px solid ${borderColor}`,
              borderRadius: theme.borderRadius.xl,
              padding: theme.spacing.xl,
              boxShadow: theme.shadows.md || "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = theme.shadows.lg || "0 10px 15px -3px rgba(0, 0, 0, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = theme.shadows.md || "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: theme.spacing.lg,
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: theme.typography.fontSize.xl[0],
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.text.primary,
                }}
              >
                {shift.name}
              </h3>
              <CommonEditDeleteActions
                onEdit={() => {
                  if (!updating && !deleting) {
                    handleEdit(shift);
                  }
                }}
                onDelete={() => {
                  if (!updating && !deleting) {
                    handleDelete(shift);
                  }
                }}
                editAriaLabel="Edit shift"
                deleteAriaLabel="Delete shift"
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.md }}>
                {shift.shift_code && (
                  <div>
                    <span
                      style={{
                        fontSize: theme.typography.fontSize.sm[0],
                        fontWeight: theme.typography.fontWeight.medium,
                        color: theme.colors.text.secondary,
                      }}
                    >
                      Shift Code:
                    </span>
                    <span
                      style={{
                        fontSize: theme.typography.fontSize.base[0],
                        fontWeight: theme.typography.fontWeight.semibold,
                        color: theme.colors.text.primary,
                        marginLeft: theme.spacing.sm,
                      }}
                    >
                      {shift.shift_code}
                    </span>
                  </div>
                )}
              <div>
                <span
                  style={{
                    fontSize: theme.typography.fontSize.sm[0],
                    fontWeight: theme.typography.fontWeight.medium,
                    color: theme.colors.text.secondary,
                  }}
                >
                  Start Time:
                </span>
                <span
                  style={{
                    fontSize: theme.typography.fontSize.base[0],
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.text.primary,
                    marginLeft: theme.spacing.sm,
                  }}
                >
                    {startTime}
                </span>
              </div>
              <div>
                <span
                  style={{
                    fontSize: theme.typography.fontSize.sm[0],
                    fontWeight: theme.typography.fontWeight.medium,
                    color: theme.colors.text.secondary,
                  }}
                >
                  End Time:
                </span>
                <span
                  style={{
                    fontSize: theme.typography.fontSize.base[0],
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.text.primary,
                    marginLeft: theme.spacing.sm,
                  }}
                >
                    {endTime}
                </span>
              </div>
              <div>
                <span
                  style={{
                    fontSize: theme.typography.fontSize.sm[0],
                    fontWeight: theme.typography.fontWeight.medium,
                    color: theme.colors.text.secondary,
                  }}
                >
                  Duration:
                </span>
                <span
                  style={{
                    fontSize: theme.typography.fontSize.base[0],
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.text.primary,
                    marginLeft: theme.spacing.sm,
                  }}
                >
                    {duration}
                </span>
              </div>
            </div>
          </div>
          );
        })}
      </div>
      )}

      <ShiftModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedShift(null);
          dispatch(clearError());
        }}
        onSave={handleSave}
        shift={selectedShift}
        loading={creating || updating}
        error={error}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDeleteItem(null);
        }}
        onConfirm={handleConfirmDelete}
        itemName={deleteItem?.name}
        title="Delete Shift"
        message={`Are you sure you want to delete the shift "${deleteItem?.name}"? This action cannot be undone.`}
        isLoading={deleting}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default Shifts;

