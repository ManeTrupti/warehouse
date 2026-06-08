import { useState, useEffect } from "react";
import { useTheme } from "@core/theme";
import { CommonModal } from "@shared/components/CommonModal";
import { CommonButton } from "@shared/components/CommonButton";
import {
  getFormContainerStyles,
  getFormRowStyles,
  getFormLabelStyles,
  getFormInputStyles,
} from "./DowntimeCategories.styled";

const DowntimeCategoriesModal = ({ isOpen, onClose, onSave, downtimeCategory }) => {
  const theme = useTheme();
  const [focusedInput, setFocusedInput] = useState(null);
  const [formData, setFormData] = useState({
    category: "",
  });
  const [fieldError, setFieldError] = useState("");

  useEffect(() => {
    if (downtimeCategory) {
      setFormData({
        category: downtimeCategory.category || "",
      });
    } else {
      setFormData({
        category: "",
      });
    }
    setFieldError("");
  }, [downtimeCategory, isOpen]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldError("");
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!formData.category.trim()) {
      setFieldError("Category is required");
      return;
    }

    onSave({ category: formData.category.trim() });
  };

  const formContainerStyles = getFormContainerStyles(theme);
  const formRowStyles = getFormRowStyles(theme);
  const formLabelStyles = getFormLabelStyles(theme);
  const getFormInputStyle = (fieldName) =>
    getFormInputStyles(
      theme,
      focusedInput === fieldName,
      fieldName === "category" && !!fieldError,
    );

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title={downtimeCategory ? "Edit Downtime Category" : "Add New Downtime Category"}
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
            {downtimeCategory ? "Update Category" : "Add Category"}
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
        {downtimeCategory
          ? "Update downtime category"
          : "Create a new downtime category for tracking production interruptions"}
      </p>
      <form onSubmit={handleSubmit}>
        <div style={formContainerStyles}>
          <div style={formRowStyles}>
            <label style={formLabelStyles}>
              Category <span style={{ color: theme.colors.error.DEFAULT }}>*</span>
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => handleChange("category", e.target.value)}
              onFocus={() => setFocusedInput("category")}
              onBlur={() => setFocusedInput(null)}
              placeholder="e.g., Planned Maintenance"
              style={getFormInputStyle("category")}
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

export default DowntimeCategoriesModal;

