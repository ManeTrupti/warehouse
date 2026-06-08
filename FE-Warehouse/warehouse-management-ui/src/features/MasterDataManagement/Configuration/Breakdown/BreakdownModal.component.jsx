import { useState, useEffect } from "react";
import { useTheme } from "@core/theme";
import { CommonModal } from "@shared/components/CommonModal";
import { CommonButton } from "@shared/components/CommonButton";
import {
  getFormContainerStyles,
  getFormRowStyles,
  getFormLabelStyles,
  getFormInputStyles,
} from "./Breakdown.styled";

const BreakdownModal = ({ isOpen, onClose, onSave, breakdown }) => {
  const theme = useTheme();
  const [focusedInput, setFocusedInput] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
  });
  const [fieldError, setFieldError] = useState("");

  useEffect(() => {
    if (breakdown) {
      setFormData({
        name: breakdown.name || "",
      });
    } else {
      setFormData({
        name: "",
      });
    }
    setFieldError("");
  }, [breakdown, isOpen]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldError("");
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!formData.name.trim()) {
      setFieldError("Breakdown name is required");
      return;
    }

    onSave({ name: formData.name.trim() });
  };

  const formContainerStyles = getFormContainerStyles(theme);
  const formRowStyles = getFormRowStyles(theme);
  const formLabelStyles = getFormLabelStyles(theme);
  const getFormInputStyle = (fieldName) =>
    getFormInputStyles(
      theme,
      focusedInput === fieldName,
      fieldName === "name" && !!fieldError,
    );

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title={breakdown ? "Edit Breakdown" : "Add New Breakdown"}
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
            {breakdown ? "Update Breakdown" : "Add Breakdown"}
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
        {breakdown
          ? "Update breakdown information"
          : "Create a new breakdown type for categorizing downtime"}
      </p>
      <form onSubmit={handleSubmit}>
        <div style={formContainerStyles}>
          <div style={formRowStyles}>
            <label style={formLabelStyles}>
              Breakdown Name <span style={{ color: theme.colors.error.DEFAULT }}>*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              onFocus={() => setFocusedInput("name")}
              onBlur={() => setFocusedInput(null)}
              placeholder="e.g., Mechanical, Electrical, Oil Leak"
              style={getFormInputStyle("name")}
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

export default BreakdownModal;

