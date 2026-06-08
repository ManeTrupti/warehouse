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
} from "./Workstations.styled";

const WorkstationModal = ({ isOpen, onClose, onSave, workstation }) => {
  const theme = useTheme();
  const [focusedInput, setFocusedInput] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    resource: "",
    cycleTime: "",
    setupTime: "",
    efficiency: "",
  });

  // Available resources
  const resources = [
    "Engine Assembly Line 1",
    "Engine Assembly Line 2",
    "Axle Assembly Line 1",
    "Axle Assembly Line 2",
    "Testing Bay",
  ];

  useEffect(() => {
    if (workstation) {
      setFormData({
        code: workstation.code || "",
        name: workstation.name || "",
        resource: workstation.resource || "",
        cycleTime: workstation.cycleTime?.toString() || "",
        setupTime: workstation.setupTime?.toString() || "",
        efficiency: workstation.efficiency?.toString() || "",
      });
    } else {
      setFormData({
        code: "WS-XX-01",
        name: "",
        resource: "",
        cycleTime: "",
        setupTime: "",
        efficiency: "",
      });
    }
  }, [workstation, isOpen]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!formData.code.trim() || !formData.name.trim() || !formData.resource) {
      alert("Workstation code, name, and resource are required");
      return;
    }

    const workstationData = {
      ...formData,
      cycleTime: parseInt(formData.cycleTime) || 0,
      setupTime: parseInt(formData.setupTime) || 0,
      efficiency: parseFloat(formData.efficiency) || 0,
    };

    onSave(workstationData);
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
      title={workstation ? "Edit Workstation" : "Add New Workstation"}
      size="lg"
      footer={
        <div style={{ display: "flex", gap: theme.spacing.md, justifyContent: "flex-end" }}>
          <CommonButton variant="secondary" onClick={onClose}>
            Cancel
          </CommonButton>
          <CommonButton variant="primary" onClick={handleSubmit}>
            {workstation ? "Update Workstation" : "Add Workstation"}
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
        {workstation
          ? "Update workstation information"
          : "Create a new workstation under a resource"}
      </p>
      <form onSubmit={handleSubmit}>
        <div style={formContainerStyles}>
          <div style={formRowStyles}>
            <label style={formLabelStyles}>Workstation Code</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => handleChange("code", e.target.value)}
              onFocus={() => setFocusedInput("code")}
              onBlur={() => setFocusedInput(null)}
              placeholder="WS-XX-01"
              style={getFormInputStyle("code")}
              disabled={!!workstation}
            />
          </div>
          <div style={formRowStyles}>
            <label style={formLabelStyles}>Parent Resource</label>
            <select
              value={formData.resource}
              onChange={(e) => handleChange("resource", e.target.value)}
              onFocus={() => setFocusedInput("resource")}
              onBlur={() => setFocusedInput(null)}
              style={getFormSelectStyle("resource")}
            >
              <option value="">Select resource</option>
              {resources.map((resource) => (
                <option key={resource} value={resource}>
                  {resource}
                </option>
              ))}
            </select>
          </div>
          <div style={formRowStyles}>
            <label style={formLabelStyles}>Workstation Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              onFocus={() => setFocusedInput("name")}
              onBlur={() => setFocusedInput(null)}
              placeholder="Workstation name"
              style={getFormInputStyle("name")}
            />
          </div>
          <div style={formRowStyles}>
            <label style={formLabelStyles}>Cycle Time (min)</label>
            <input
              type="number"
              value={formData.cycleTime}
              onChange={(e) => handleChange("cycleTime", e.target.value)}
              onFocus={() => setFocusedInput("cycleTime")}
              onBlur={() => setFocusedInput(null)}
              placeholder="0"
              style={getFormInputStyle("cycleTime")}
              min="0"
            />
          </div>
          <div style={formRowStyles}>
            <label style={formLabelStyles}>Setup Time (min)</label>
            <input
              type="number"
              value={formData.setupTime}
              onChange={(e) => handleChange("setupTime", e.target.value)}
              onFocus={() => setFocusedInput("setupTime")}
              onBlur={() => setFocusedInput(null)}
              placeholder="0"
              style={getFormInputStyle("setupTime")}
              min="0"
            />
          </div>
        </div>
      </form>
    </CommonModal>
  );
};

export default WorkstationModal;

