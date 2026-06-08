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

const RoutingModal = ({ isOpen, onClose, onSave, routing }) => {
  const theme = useTheme();
  const [focusedInput, setFocusedInput] = useState(null);
  const [formData, setFormData] = useState({
    productCode: "",
    productName: "",
    category: "Engine",
  });

  useEffect(() => {
    if (routing) {
      setFormData({
        productCode: routing.productCode || "",
        productName: routing.productName || "",
        category: routing.category || "Engine",
      });
    } else {
      setFormData({
        productCode: "",
        productName: "",
        category: "Engine",
      });
    }
  }, [routing, isOpen]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!formData.productCode.trim() || !formData.productName.trim()) {
      alert("Product code and name are required");
      return;
    }

    onSave(formData);
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
      title={routing ? "Edit Routing" : "Create New Routing"}
      size="md"
      footer={
        <div style={{ display: "flex", gap: theme.spacing.md, justifyContent: "flex-end" }}>
          <CommonButton variant="secondary" onClick={onClose}>
            Cancel
          </CommonButton>
          <CommonButton variant="primary" onClick={handleSubmit}>
            {routing ? "Update Routing" : "Create Routing"}
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
        {routing
          ? "Update process routing information"
          : "Define the process routing for a product"}
      </p>
      <form onSubmit={handleSubmit}>
        <div style={formContainerStyles}>
          <div style={formRowStyles}>
            <label style={formLabelStyles}>Product Code</label>
            <input
              type="text"
              value={formData.productCode}
              onChange={(e) => handleChange("productCode", e.target.value)}
              onFocus={() => setFocusedInput("productCode")}
              onBlur={() => setFocusedInput(null)}
              placeholder="e.g., ENG-001"
              style={getFormInputStyle("productCode")}
            />
          </div>
          <div style={formRowStyles}>
            <label style={formLabelStyles}>Product Name</label>
            <input
              type="text"
              value={formData.productName}
              onChange={(e) => handleChange("productName", e.target.value)}
              onFocus={() => setFocusedInput("productName")}
              onBlur={() => setFocusedInput(null)}
              placeholder="Product name"
              style={getFormInputStyle("productName")}
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
        </div>
      </form>
    </CommonModal>
  );
};

export default RoutingModal;

