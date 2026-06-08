import { useState, useEffect } from "react";
import { useTheme } from "@core/theme";
import { CommonModal } from "@shared/components/CommonModal";
import { CommonButton } from "@shared/components/CommonButton";
import { validateShiftDuration } from "./shiftValidations";

const ShiftModal = ({ isOpen, onClose, onSave, shift, loading = false, error = null }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    start_time: "",
    end_time: "",
  });
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    start_time: "",
    end_time: "",
  });
  const [validationError, setValidationError] = useState(null);
  const [duration, setDuration] = useState("");

  useEffect(() => {
    if (shift) {
      setFormData({
        name: shift.name || "",
        start_time: shift.start_time || shift.startTime || "",
        end_time: shift.end_time || shift.endTime || "",
      });
    } else {
      setFormData({
        name: "",
        start_time: "",
        end_time: "",
      });
    }
    setValidationError(null);
    setDuration("");
    setFieldErrors({
      name: "",
      start_time: "",
      end_time: "",
      });
  }, [shift, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error when user starts typing
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setValidationError(null);
  };

  const calculateDuration = () => {
    if (formData.start_time && formData.end_time) {
      const validation = validateShiftDuration(formData.start_time, formData.end_time);
      
      if (!validation.isValid) {
        setValidationError(validation.error);
        setFieldErrors((prev) => ({
          ...prev,
          start_time: validation.error,
          end_time: validation.error,
        }));
      } else {
        setValidationError(null);
        setFieldErrors((prev) => ({
          ...prev,
          start_time: "",
          end_time: "",
        }));
      }

      const start = new Date(`2000-01-01T${formData.start_time}`);
      let end = new Date(`2000-01-01T${formData.end_time}`);
      
      // Handle overnight shifts
      if (end <= start) {
        end = new Date(`2000-01-02T${formData.end_time}`);
      }
      
      const diffMs = end - start;
      const diffHours = diffMs / (1000 * 60 * 60);
      
      if (diffHours > 0) {
        setDuration(`${diffHours.toFixed(2)} hours`);
      } else {
        setDuration("");
      }
    } else {
      setDuration("");
      setValidationError(null);
      setFieldErrors((prev) => ({
          ...prev,
        start_time: "",
        end_time: "",
        }));
    }
  };

  useEffect(() => {
    if (formData.start_time && formData.end_time) {
      calculateDuration();
    } else {
      setDuration("");
      setValidationError(null);
    }
  }, [formData.start_time, formData.end_time]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Reset field errors
    const newFieldErrors = {
      name: "",
      start_time: "",
      end_time: "",
    };

    // Validate required fields
    let hasErrors = false;
    if (!formData.name?.trim()) {
      newFieldErrors.name = "Shift name is required";
      hasErrors = true;
    }
    if (!formData.start_time) {
      newFieldErrors.start_time = "Start time is required";
      hasErrors = true;
    }
    if (!formData.end_time) {
      newFieldErrors.end_time = "End time is required";
      hasErrors = true;
    }

    if (hasErrors) {
      setFieldErrors(newFieldErrors);
      return;
    }

    // Validate 8-hour shift duration
    const validation = validateShiftDuration(formData.start_time, formData.end_time);
    if (!validation.isValid) {
      setFieldErrors((prev) => ({
        ...prev,
        start_time: validation.error,
        end_time: validation.error,
      }));
      setValidationError(validation.error);
      return;
    }

    setFieldErrors(newFieldErrors);
    setValidationError(null);
    onSave(formData);
  };


  const getLabelStyles = (isRequired = false) => ({
    display: "block",
    marginBottom: theme.spacing.xs,
    fontSize: theme.typography.fontSize.sm[0],
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  });

  const getRequiredAsterisk = () => (
    <span style={{ color: theme.colors.error?.[600] || "#DC2626", marginLeft: "2px" }}>*</span>
  );

  const getInputStyles = (hasError = false) => ({
    width: "100%",
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${hasError ? (theme.colors.error?.[300] || "#FCA5A5") : theme.colors.gray[300]}`,
    fontSize: theme.typography.fontSize.base[0],
    outline: "none",
    transition: "border-color 0.2s",
  });

  const errorTextStyles = {
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.fontSize.xs?.[0] || "12px",
    color: theme.colors.error?.[600] || "#DC2626",
  };

  const formGroupStyles = {
    marginBottom: theme.spacing.lg,
  };

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title={shift ? "Edit Shift" : "Add Shift"}
      size="md"
      footer={
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            gap: theme.spacing.md,
          }}
        >
          <CommonButton variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </CommonButton>
          <CommonButton variant="primary" onClick={handleSubmit} disabled={loading || !!validationError}>
            {loading ? (shift ? "Updating..." : "Adding...") : (shift ? "Update" : "Add")}
          </CommonButton>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        {(error || validationError) && (
          <div
            style={{
              padding: theme.spacing.md,
              marginBottom: theme.spacing.md,
              backgroundColor: theme.colors.error?.[50] || "#FEF2F2",
              border: `1px solid ${theme.colors.error?.[200] || "#FECACA"}`,
              borderRadius: theme.borderRadius.md,
              color: theme.colors.error?.[700] || "#B91C1C",
              fontSize: theme.typography.fontSize.sm[0],
            }}
          >
            {error || validationError}
          </div>
        )}
        <div style={formGroupStyles}>
          <label style={getLabelStyles(true)} htmlFor="name">
            Shift Name{getRequiredAsterisk()}
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={getInputStyles(!!fieldErrors.name)}
            placeholder="Enter shift name (e.g., evening1)"
            disabled={loading}
          />
          {fieldErrors.name && (
            <div style={errorTextStyles}>{fieldErrors.name}</div>
          )}
        </div>

        <div style={formGroupStyles}>
          <label style={getLabelStyles(true)} htmlFor="start_time">
            Start Time{getRequiredAsterisk()} <span style={{ fontSize: theme.typography.fontSize.xs?.[0] || "12px", color: theme.colors.text.secondary, fontWeight: "normal" }}>(Must be exactly 8 hours from end time)</span>
          </label>
          <input
            type="time"
            id="start_time"
            name="start_time"
            value={formData.start_time}
            onChange={handleChange}
            required
            style={getInputStyles(!!fieldErrors.start_time)}
            disabled={loading}
          />
          {fieldErrors.start_time && (
            <div style={errorTextStyles}>{fieldErrors.start_time}</div>
          )}
        </div>

        <div style={formGroupStyles}>
          <label style={getLabelStyles(true)} htmlFor="end_time">
            End Time{getRequiredAsterisk()} <span style={{ fontSize: theme.typography.fontSize.xs?.[0] || "12px", color: theme.colors.text.secondary, fontWeight: "normal" }}>(Must be exactly 8 hours from start time)</span>
          </label>
          <input
            type="time"
            id="end_time"
            name="end_time"
            value={formData.end_time}
            onChange={handleChange}
            required
            style={getInputStyles(!!fieldErrors.end_time)}
            disabled={loading}
          />
          {fieldErrors.end_time && (
            <div style={errorTextStyles}>{fieldErrors.end_time}</div>
          )}
        </div>

        <div style={formGroupStyles}>
          <label style={getLabelStyles(false)} htmlFor="duration">
            Duration
          </label>
          <input
            type="text"
            id="duration"
            name="duration"
            value={duration}
            readOnly
            style={{
              ...getInputStyles(),
              backgroundColor: theme.colors.gray[50] || "#F9FAFB",
              cursor: "not-allowed",
              color: validationError || fieldErrors.start_time || fieldErrors.end_time ? (theme.colors.error?.[700] || "#B91C1C") : undefined,
            }}
            placeholder="Calculated automatically (must be 8.00 hours)"
          />
        </div>
      </form>
    </CommonModal>
  );
};

export default ShiftModal;

