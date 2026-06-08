export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Confirmation",
  message,
  itemName,
  confirmButtonText = "Delete",
  cancelButtonText = "Cancel",
  isLoading = false,
}) {
  const baseButtonClass =
    "inline-flex min-w-20 items-center justify-center rounded-lg px-5 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

  if (!isOpen) return null;

  const displayMessage = message || (
    itemName
      ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
      : "Are you sure you want to delete this item? This action cannot be undone."
  );

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-6" onClick={handleBackdropClick}>
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex flex-col gap-6 p-6">
          <div className="flex items-center justify-between">
            <h3 className="m-0 text-lg font-semibold text-slate-900">{title}</h3>
          </div>
          <p className="m-0 text-base text-slate-500">{displayMessage}</p>
          <div className="mt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              className={`${baseButtonClass} border border-slate-300 bg-white text-slate-700 hover:bg-slate-50`}
              onClick={handleCancel}
              disabled={isLoading}
            >
              {cancelButtonText}
            </button>
            <button
              type="button"
              className={`${baseButtonClass} border border-indigo-500 bg-indigo-500 text-white hover:bg-indigo-600 hover:border-indigo-600`}
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : confirmButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmationDialog;

