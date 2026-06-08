import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTheme } from "@core/theme";
import { CommonModal } from "@shared/components/CommonModal";
import { CommonButton } from "@shared/components/CommonButton";
import {
  getFormContainerStyles,
  getFormRowStyles,
  getFormLabelStyles,
  getFormInputStyles,
} from "./DowntimeReasons.styled";
import {
  selectDowntimeCategories,
  fetchDowntimeCategories,
} from "@core/store/slices/Configuration/downtimeCategoriesSlice";
import GenericSearchSelect from "@shared/components/CommonSearchingSelect/GenericSearchingSelect";

const DowntimeReasonsModal = ({ isOpen, onClose, onSave, downtimeReason }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const downtimeCategories = useSelector(selectDowntimeCategories) || [];
  const [focusedInput, setFocusedInput] = useState(null);
  const [formData, setFormData] = useState({
    reason: "",
    category: "",
  });
  const [fieldErrors, setFieldErrors] = useState({
    reason: "",
    category: "",
  });
  const hasFetchedCategoriesRef = useRef(false);

  // Fetch categories when modal opens (only once per session)
  useEffect(() => {
    if (isOpen && !hasFetchedCategoriesRef.current) {
      hasFetchedCategoriesRef.current = true;
      dispatch(fetchDowntimeCategories());
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (downtimeReason) {
      setFormData({
        reason: downtimeReason.reason || "",
        category:
          downtimeReason.category_details?.id?.toString() ||
          downtimeReason.category?.id?.toString() ||
          "",
      });
    } else {
      setFormData({
        reason: "",
        category: "",
      });
    }
    setFieldErrors({ reason: "", category: "" });
  }, [downtimeReason, isOpen]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const errors = { reason: "", category: "" };
    let isValid = true;

    if (!formData.reason.trim()) {
      errors.reason = "Downtime reason is required";
      isValid = false;
    }

    if (!formData.category) {
      errors.category = "Category is required";
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!validateForm()) {
      return;
    }

    onSave(formData);
  };

  const formContainerStyles = getFormContainerStyles(theme);
  const formRowStyles = getFormRowStyles(theme);
  const formLabelStyles = getFormLabelStyles(theme);
  const getFormInputStyle = (fieldName) =>
    getFormInputStyles(
      theme,
      focusedInput === fieldName,
      !!fieldErrors[fieldName],
    );

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        downtimeReason ? "Edit Downtime Reason" : "Add New Downtime Reason"
      }
      size="md"
      footer={
        <div
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "space-between",
          gap: theme.spacing.md,
        }}
      ><CommonButton variant="secondary" onClick={onClose}>
            Cancel
          </CommonButton>
          <CommonButton variant="primary" onClick={handleSubmit}>
            {downtimeReason ? "Update Reason" : "Add Reason"}
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
        {downtimeReason
          ? "Update downtime reason information"
          : "Create a new downtime reason for tracking specific production interruptions"}
      </p>
      <form onSubmit={handleSubmit}>
        <div style={formContainerStyles}>
          <div style={formRowStyles}>
            <GenericSearchSelect
              label="Category"
              required
              options={downtimeCategories.map((cat) => ({
                label: cat.category,
                value: cat.id,
              }))}
              value={formData.category}
              onChange={(val) => handleChange("category", val)}
              error={fieldErrors.category}
              placeholder="Select a category"
            />
          </div>
          <div style={formRowStyles}>
            <label style={formLabelStyles}>
              Downtime Reason{" "}
              <span style={{ color: theme.colors.error.DEFAULT }}>*</span>
            </label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => handleChange("reason", e.target.value)}
              onFocus={() => setFocusedInput("reason")}
              onBlur={() => setFocusedInput(null)}
              placeholder="e.g., Motor Failure, Belt Replacement"
              style={getFormInputStyle("reason")}
              required
            />
            {fieldErrors.reason && (
              <div
                style={{
                  marginTop: theme.spacing.xs,
                  fontSize: theme.typography.fontSize.xs?.[0] || "12px",
                  color: theme.colors.error?.[600] || "#DC2626",
                }}
              >
                {fieldErrors.reason}
              </div>
            )}
          </div>
        </div>
      </form>
    </CommonModal>
  );
};

export default DowntimeReasonsModal;
