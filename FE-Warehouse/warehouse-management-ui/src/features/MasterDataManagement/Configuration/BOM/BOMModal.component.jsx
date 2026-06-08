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

const BOMModal = ({ isOpen, onClose, onSave, bom }) => {
  const theme = useTheme();
  const [focusedInput, setFocusedInput] = useState(null);
  const [formData, setFormData] = useState({
    productCode: "",
    version: "1.0",
    productName: "",
    category: "Engine",
    effectiveFrom: "",
    effectiveTo: "",
  });

  useEffect(() => {
    if (bom) {
      setFormData({
        productCode: bom.productCode || "",
        version: bom.version || "1.0",
        productName: bom.productName || "",
        category: bom.category || "Engine",
        effectiveFrom: bom.effectiveFrom || "",
        effectiveTo: bom.effectiveTo || "",
      });
    } else {
      setFormData({
        productCode: "",
        version: "1.0",
        productName: "",
        category: "Engine",
        effectiveFrom: "",
        effectiveTo: "",
      });
    }
  }, [bom, isOpen]);

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
      title={bom ? "Edit BOM" : "Create New BOM"}
      size="lg"
      footer={
        <div style={{ display: "flex", gap: theme.spacing.md, justifyContent: "flex-end" }}>
          <CommonButton variant="secondary" onClick={onClose}>
            Cancel
          </CommonButton>
          <CommonButton variant="primary" onClick={handleSubmit}>
            {bom ? "Update BOM" : "Create BOM"}
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
        {bom ? "Update bill of materials information" : "Define the bill of materials for a product"}
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
              placeholder="e.g., ENG-004"
              style={getFormInputStyle("productCode")}
            />
          </div>
          <div style={formRowStyles}>
            <label style={formLabelStyles}>Version</label>
            <input
              type="text"
              value={formData.version}
              onChange={(e) => handleChange("version", e.target.value)}
              onFocus={() => setFocusedInput("version")}
              onBlur={() => setFocusedInput(null)}
              placeholder="1.0"
              style={getFormInputStyle("version")}
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
          <div style={formRowStyles}>
            <label style={formLabelStyles}>Effective From</label>
            <input
              type="date"
              value={formData.effectiveFrom}
              onChange={(e) => handleChange("effectiveFrom", e.target.value)}
              onFocus={() => setFocusedInput("effectiveFrom")}
              onBlur={() => setFocusedInput(null)}
              style={getFormInputStyle("effectiveFrom")}
            />
          </div>
          <div style={formRowStyles}>
            <label style={formLabelStyles}>Effective To</label>
            <input
              type="date"
              value={formData.effectiveTo}
              onChange={(e) => handleChange("effectiveTo", e.target.value)}
              onFocus={() => setFocusedInput("effectiveTo")}
              onBlur={() => setFocusedInput(null)}
              style={getFormInputStyle("effectiveTo")}
            />
          </div>
        </div>
      </form>
    </CommonModal>
  );
};

export default BOMModal;

