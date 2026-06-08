import { useState, useEffect } from "react";
import { useTheme } from "@core/theme";
import { CommonModal } from "@shared/components/CommonModal";
import { CommonButton } from "@shared/components/CommonButton";
import {
  getFormContainerStyles,
  getFormRowStyles,
  getFormLabelStyles,
  getFormInputStyles,
  getFormSelectStyles,
} from "./BOM.styled";

const ComponentModal = ({ isOpen, onClose, onSave, component, stepNumber }) => {
  const theme = useTheme();
  const [focusedInput, setFocusedInput] = useState(null);
  const [formData, setFormData] = useState({
    step: "",
    componentCode: "",
    componentName: "",
    category: "Engine",
    quantity: "",
    unit: "Unit",
    leadTime: "",
    critical: false,
  });

  useEffect(() => {
    if (component) {
      setFormData({
        step: component.step?.toString() || "",
        componentCode: component.componentCode || "",
        componentName: component.componentName || "",
        category: component.category || "Engine",
        quantity: component.quantity?.toString() || "",
        unit: component.unit || "Unit",
        leadTime: component.leadTime?.toString() || "",
        critical: component.critical || false,
      });
    } else {
      setFormData({
        step: stepNumber?.toString() || "",
        componentCode: "",
        componentName: "",
        category: "Engine",
        quantity: "",
        unit: "Unit",
        leadTime: "",
        critical: false,
      });
    }
  }, [component, isOpen, stepNumber]);

  const handleChange = (field, value) => {
    if (field === "critical") {
      setFormData((prev) => ({ ...prev, [field]: value === "true" || value === true }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!formData.componentCode.trim() || !formData.componentName.trim()) {
      alert("Component code and name are required");
      return;
    }

    const componentData = {
      ...formData,
      step: parseInt(formData.step) || 0,
      quantity: parseFloat(formData.quantity) || 0,
      leadTime: parseInt(formData.leadTime) || 0,
    };

    onSave(componentData);
  };

  const formContainerStyles = getFormContainerStyles(theme);
  const formRowStyles = getFormRowStyles(theme);
  const formLabelStyles = getFormLabelStyles(theme);
  const getFormInputStyle = (fieldName) =>
    getFormInputStyles(theme, focusedInput === fieldName);
  const getFormSelectStyle = (fieldName) =>
    getFormSelectStyles(theme, focusedInput === fieldName);

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title={component ? "Edit Component" : "Add Component"}
      size="md"
      footer={
        <div style={{ display: "flex", gap: theme.spacing.md, justifyContent: "flex-end" }}>
          <CommonButton variant="secondary" onClick={onClose}>
            Cancel
          </CommonButton>
          <CommonButton variant="primary" onClick={handleSubmit}>
            {component ? "Update Component" : "Add Component"}
          </CommonButton>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        <div style={formContainerStyles}>
          <div style={formRowStyles}>
            <label style={formLabelStyles}>Step</label>
            <input
              type="number"
              value={formData.step}
              onChange={(e) => handleChange("step", e.target.value)}
              onFocus={() => setFocusedInput("step")}
              onBlur={() => setFocusedInput(null)}
              placeholder="1"
              style={getFormInputStyle("step")}
              min="1"
            />
          </div>
          <div style={formRowStyles}>
            <label style={formLabelStyles}>Component Code</label>
            <input
              type="text"
              value={formData.componentCode}
              onChange={(e) => handleChange("componentCode", e.target.value)}
              onFocus={() => setFocusedInput("componentCode")}
              onBlur={() => setFocusedInput(null)}
              placeholder="e.g., RM-001"
              style={getFormInputStyle("componentCode")}
            />
          </div>
          <div style={formRowStyles}>
            <label style={formLabelStyles}>Component Name</label>
            <input
              type="text"
              value={formData.componentName}
              onChange={(e) => handleChange("componentName", e.target.value)}
              onFocus={() => setFocusedInput("componentName")}
              onBlur={() => setFocusedInput(null)}
              placeholder="Component name"
              style={getFormInputStyle("componentName")}
            />
          </div>
          <div style={formRowStyles}>
            <label style={formLabelStyles}>Category</label>
            <select
              value={formData.category}
              onChange={(e) => handleChange("category", e.target.value)}
              onFocus={() => setFocusedInput("category")}
              onBlur={() => setFocusedInput(null)}
              style={getFormSelectStyle("category")}
            >
              <option value="Engine">Engine</option>
              <option value="Axle">Axle</option>
            </select>
          </div>
          <div style={formRowStyles}>
            <label style={formLabelStyles}>Quantity</label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => handleChange("quantity", e.target.value)}
              onFocus={() => setFocusedInput("quantity")}
              onBlur={() => setFocusedInput(null)}
              placeholder="0"
              style={getFormInputStyle("quantity")}
              min="0"
              step="0.01"
            />
          </div>
          <div style={formRowStyles}>
            <label style={formLabelStyles}>Unit</label>
            <input
              type="text"
              value={formData.unit}
              onChange={(e) => handleChange("unit", e.target.value)}
              onFocus={() => setFocusedInput("unit")}
              onBlur={() => setFocusedInput(null)}
              placeholder="Unit"
              style={getFormInputStyle("unit")}
            />
          </div>
          <div style={formRowStyles}>
            <label style={formLabelStyles}>Lead Time (days)</label>
            <input
              type="number"
              value={formData.leadTime}
              onChange={(e) => handleChange("leadTime", e.target.value)}
              onFocus={() => setFocusedInput("leadTime")}
              onBlur={() => setFocusedInput(null)}
              placeholder="0"
              style={getFormInputStyle("leadTime")}
              min="0"
            />
          </div>
          <div style={formRowStyles}>
            <label style={formLabelStyles}>Critical</label>
            <select
              value={formData.critical.toString()}
              onChange={(e) => handleChange("critical", e.target.value)}
              onFocus={() => setFocusedInput("critical")}
              onBlur={() => setFocusedInput(null)}
              style={getFormSelectStyle("critical")}
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>
        </div>
      </form>
    </CommonModal>
  );
};

export default ComponentModal;

