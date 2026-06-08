import { useState, useEffect } from "react";
import { useTheme } from "@core/theme";
import { CommonModal } from "@shared/components/CommonModal";
import { CommonButton } from "@shared/components/CommonButton";
import {
  getFormContainerStyles,
  getFormRowStyles,
  getFormLabelStyles,
  getFormInputStyles,
} from "./ResourcesCapacity.styled";

const ResourceModal = ({ isOpen, onClose, onSave, resource, generateNextCode }) => {
  const theme = useTheme();
  const [focusedInput, setFocusedInput] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    workCenter: "Assembly",
    name: "",
    capacityPerDay: "",
    capacityUnit: "Units",
  });

  useEffect(() => {
    if (resource) {
      setFormData({
        code: resource.code || "",
        workCenter: resource.workCenter || "Assembly",
        name: resource.name || "",
        capacityPerDay: resource.capacityPerDay?.toString() || "",
        capacityUnit: resource.capacityUnit || "Units",
      });
    } else {
      setFormData({
        code: generateNextCode ? generateNextCode() : "RES-007",
        workCenter: "Assembly",
        name: "",
        capacityPerDay: "",
        capacityUnit: "Units",
      });
    }
  }, [resource, isOpen, generateNextCode]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!formData.name.trim()) {
      alert("Resource name is required");
      return;
    }

    const resourceData = {
      ...formData,
      capacityPerDay: parseInt(formData.capacityPerDay) || 0,
    };

    onSave(resourceData);
  };

  const formContainerStyles = getFormContainerStyles(theme);
  const formRowStyles = getFormRowStyles(theme);
  const formLabelStyles = getFormLabelStyles(theme);
  const getFormInputStyle = (fieldName) =>
    getFormInputStyles(theme, focusedInput === fieldName);

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title={resource ? "Edit Resource" : "Add New Resource"}
      size="md"
      footer={
        <div style={{ display: "flex", gap: theme.spacing.md, justifyContent: "flex-end" }}>
          <CommonButton variant="secondary" onClick={onClose}>
            Cancel
          </CommonButton>
          <CommonButton variant="primary" onClick={handleSubmit}>
            {resource ? "Update Resource" : "Add Resource"}
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
        {resource
          ? "Update resource information"
          : "Create a new assembly line or work center"}
      </p>
      <form onSubmit={handleSubmit}>
        <div style={formContainerStyles}>
          <div style={formRowStyles}>
            <label style={formLabelStyles}>Resource Code</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => handleChange("code", e.target.value)}
              onFocus={() => setFocusedInput("code")}
              onBlur={() => setFocusedInput(null)}
              style={getFormInputStyle("code")}
              disabled={!!resource}
            />
          </div>
          <div style={formRowStyles}>
            <label style={formLabelStyles}>Work Center</label>
            <input
              type="text"
              value={formData.workCenter}
              onChange={(e) => handleChange("workCenter", e.target.value)}
              onFocus={() => setFocusedInput("workCenter")}
              onBlur={() => setFocusedInput(null)}
              placeholder="Assembly"
              style={getFormInputStyle("workCenter")}
            />
          </div>
          <div style={formRowStyles}>
            <label style={formLabelStyles}>Resource Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              onFocus={() => setFocusedInput("name")}
              onBlur={() => setFocusedInput(null)}
              placeholder="Resource name"
              style={getFormInputStyle("name")}
            />
          </div>
          <div style={formRowStyles}>
            <label style={formLabelStyles}>Capacity Per Day</label>
            <input
              type="number"
              value={formData.capacityPerDay}
              onChange={(e) => handleChange("capacityPerDay", e.target.value)}
              onFocus={() => setFocusedInput("capacityPerDay")}
              onBlur={() => setFocusedInput(null)}
              placeholder="0"
              style={getFormInputStyle("capacityPerDay")}
              min="0"
            />
          </div>
          <div style={formRowStyles}>
            <label style={formLabelStyles}>Capacity Unit</label>
            <input
              type="text"
              value={formData.capacityUnit}
              onChange={(e) => handleChange("capacityUnit", e.target.value)}
              onFocus={() => setFocusedInput("capacityUnit")}
              onBlur={() => setFocusedInput(null)}
              placeholder="Units"
              style={getFormInputStyle("capacityUnit")}
            />
          </div>
        </div>
      </form>
    </CommonModal>
  );
};

export default ResourceModal;

