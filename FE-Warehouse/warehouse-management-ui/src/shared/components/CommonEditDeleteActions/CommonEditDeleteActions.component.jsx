import { CommonButton } from "@shared/components/CommonButton";

export function CommonEditDeleteActions({
  onEdit,
  onDelete,
  size = "sm",
  editVariant = "ghost",
  deleteVariant = "ghost",
  editAriaLabel = "Edit",
  deleteAriaLabel = "Delete",
  stopPropagation = true,
}) {
  const handleEditClick = (event) => {
    if (stopPropagation && event?.stopPropagation) {
      event.stopPropagation();
    }
    if (onEdit) {
      onEdit(event);
    }
  };

  const handleDeleteClick = (event) => {
    if (stopPropagation && event?.stopPropagation) {
      event.stopPropagation();
    }
    if (onDelete) {
      onDelete(event);
    }
  };

  return (
    <div className="flex items-center justify-end gap-1">
      {onEdit && (
        <CommonButton
          variant={editVariant}
          action="edit"
          size={size}
          onClick={handleEditClick}
          aria-label={editAriaLabel}
        />
      )}
      {onDelete && (
        <CommonButton
          variant={deleteVariant}
          action="delete"
          size={size}
          onClick={handleDeleteClick}
          aria-label={deleteAriaLabel}
        />
      )}
    </div>
  );
}

export default CommonEditDeleteActions;
