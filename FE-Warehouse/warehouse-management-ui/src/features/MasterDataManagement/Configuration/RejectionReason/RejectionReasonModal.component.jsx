import { useState, useEffect } from "react";
import { useTheme } from "@core/theme";
import { CommonModal } from "@shared/components/CommonModal";
import { CommonButton } from "@shared/components/CommonButton";
import {
  getFormContainerStyles,
  getFormRowStyles,
  getFormLabelStyles,
  getFormInputStyles,
} from "./RejectionReason.styled";

const RejectionReasonModal = ({ isOpen, onClose, onSave, rejectionReason }) => {
  const theme = useTheme();
  const [focusedInput, setFocusedInput] = useState(null);
  const [formData, setFormData] = useState({
    reason: "",
  });
  const [fieldError, setFieldError] = useState("");

  useEffect(() => {
    if (rejectionReason) {
      setFormData({
        reason: rejectionReason.reason || "",
      });
    } else {
      setFormData({
        reason: "",
      });
    }
    setFieldError("");
  }, [rejectionReason, isOpen]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldError("");
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!formData.reason.trim()) {
      setFieldError("Rejection reason is required");
      return;
    }

    // Only send reason to the parent/save handler
    onSave({ reason: formData.reason.trim() });
  };

  const formContainerStyles = getFormContainerStyles(theme);
  const formRowStyles = getFormRowStyles(theme);
  const formLabelStyles = getFormLabelStyles(theme);
  const getFormInputStyle = (fieldName) =>
    getFormInputStyles(
      theme,
      focusedInput === fieldName,
      fieldName === "reason" && !!fieldError,
    );

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title={rejectionReason ? "Edit Rejection Reason" : "Add New Rejection Reason"}
      size="md"
      footer={
        <div
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "space-between",
          gap: theme.spacing.md,
        }}
      > <CommonButton variant="secondary" onClick={onClose}>
            Cancel
          </CommonButton>
          <CommonButton variant="primary" onClick={handleSubmit}>
            {rejectionReason ? "Update Reason" : "Add Reason"}
          </CommonButton>
        </div>
      }
    >
      <p
        style={{
          margin: `0 0 ${theme.spacing.lg} 0`,
          color: theme.colors.text.secondary,
          fontSize: theme.typography.fontSize.sm[0],
        }}
      >
        {rejectionReason
          ? "Update rejection reason"
          : "Create a new rejection reason for tracking production issues"}
      </p>
      <form onSubmit={handleSubmit}>
        <div style={formContainerStyles}>
          <div style={formRowStyles}>
            <label style={formLabelStyles}>
              Rejection Reason <span style={{ color: theme.colors.error.DEFAULT }}>*</span>
            </label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => handleChange("reason", e.target.value)}
              onFocus={() => setFocusedInput("reason")}
              onBlur={() => setFocusedInput(null)}
              placeholder="e.g., Tool Wear"
              style={getFormInputStyle("reason")}
              required
            />
            {fieldError && (
              <div
                style={{
                  marginTop: theme.spacing.xs,
                  fontSize: theme.typography.fontSize.xs?.[0] || "12px",
                  color: theme.colors.error?.[600] || "#DC2626",
                }}
              >
                {fieldError}
          </div>
            )}
          </div>
        </div>
      </form>
    </CommonModal>
  );
};

export default RejectionReasonModal;

