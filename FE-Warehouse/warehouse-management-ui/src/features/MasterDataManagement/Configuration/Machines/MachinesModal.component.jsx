import { useState, useEffect } from "react";
import { useTheme } from "@core/theme";
import { CommonModal } from "@shared/components/CommonModal";
import { CommonButton } from "@shared/components/CommonButton";
import {
  getFormContainerStyles,
  getFormRowStyles,
  getFormLabelStyles,
  getFormInputStyles,
  getFormTextareaStyles,
} from "./Machines.styled";

const MachinesModal = ({ isOpen, onClose, onSave, machine }) => {
  const theme = useTheme();
  const [focusedInput, setFocusedInput] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    type: "",
    location: "",
    description: "",
    status: "Active",
  });

  useEffect(() => {
    if (machine) {
      setFormData({
        code: machine.code || "",
        name: machine.name || "",
        type: machine.type || "",
        location: machine.location || "",
        description: machine.description || "",
        status: machine.status || "Active",
      });
    } else {
      setFormData({
        code: "",
        name: "",
        type: "",
        location: "",
        description: "",
        status: "Active",
      });
    }
  }, [machine, isOpen]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      alert("Machine code and name are required");
      return;
    }

    onSave(formData);
  };

  const formContainerStyles = getFormContainerStyles(theme);
  const formRowStyles = getFormRowStyles(theme);
  const formLabelStyles = getFormLabelStyles(theme);
  const getFormInputStyle = (fieldName) =>
    getFormInputStyles(theme, focusedInput === fieldName);
  const getFormTextareaStyle = (fieldName) =>
    getFormTextareaStyles(theme, focusedInput === fieldName);

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title={machine ? "Edit Machine" : "Add New Machine"}
      size="md"
      footer={
        <div style={{ display: "flex", gap: theme.spacing.md, justifyContent: "flex-end" }}>
          <CommonButton variant="secondary" onClick={onClose}>
            Cancel
          </CommonButton>
          <CommonButton variant="primary" onClick={handleSubmit}>
            {machine ? "Update Machine" : "Add Machine"}
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
        {machine
          ? "Update machine information"
          : "Register a new machine in the production system"}
      </p>
      <form onSubmit={handleSubmit}>
        <div style={formContainerStyles}>
          <div style={formRowStyles}>
            <label style={formLabelStyles}>
              Machine Code <span style={{ color: theme.colors.error.DEFAULT }}>*</span>
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => handleChange("code", e.target.value)}
              onFocus={() => setFocusedInput("code")}
              onBlur={() => setFocusedInput(null)}
              placeholder="e.g., MACH-001"
              style={getFormInputStyle("code")}
              required
            />
          </div>
          <div style={formRowStyles}>
            <label style={formLabelStyles}>
              Machine Name <span style={{ color: theme.colors.error.DEFAULT }}>*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              onFocus={() => setFocusedInput("name")}
              onBlur={() => setFocusedInput(null)}
              placeholder="e.g., CNC Lathe Machine"
              style={getFormInputStyle("name")}
              required
            />
          </div>
          <div style={formRowStyles}>
            <label style={formLabelStyles}>Machine Type</label>
            <input
              type="text"
              value={formData.type}
              onChange={(e) => handleChange("type", e.target.value)}
              onFocus={() => setFocusedInput("type")}
              onBlur={() => setFocusedInput(null)}
              placeholder="e.g., CNC, Milling, Assembly"
              style={getFormInputStyle("type")}
            />
          </div>
          <div style={formRowStyles}>
            <label style={formLabelStyles}>Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleChange("location", e.target.value)}
              onFocus={() => setFocusedInput("location")}
              onBlur={() => setFocusedInput(null)}
              placeholder="e.g., Production Line 1, Bay A"
              style={getFormInputStyle("location")}
            />
          </div>
          <div style={formRowStyles}>
            <label style={formLabelStyles}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              onFocus={() => setFocusedInput("description")}
              onBlur={() => setFocusedInput(null)}
              placeholder="Optional description about this machine"
              style={getFormTextareaStyle("description")}
              rows={3}
            />
          </div>
          <div style={formRowStyles}>
            <label style={formLabelStyles}>Status</label>
            <select
              value={formData.status}
              onChange={(e) => handleChange("status", e.target.value)}
              onFocus={() => setFocusedInput("status")}
              onBlur={() => setFocusedInput(null)}
              style={getFormInputStyle("status")}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </form>
    </CommonModal>
  );
};

export default MachinesModal;

