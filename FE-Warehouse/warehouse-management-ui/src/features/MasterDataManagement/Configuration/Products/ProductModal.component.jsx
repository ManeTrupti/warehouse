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
} from "./Products.styled";

const ProductModal = ({ isOpen, onClose, onSave, product, generateNextCode }) => {
  const theme = useTheme();
  const [focusedInput, setFocusedInput] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    category: "Engine",
    description: "",
    uom: "Unit",
    leadTime: "",
    safetyStock: "",
  });

  useEffect(() => {
    if (product) {
      setFormData({
        code: product.code || "",
        name: product.name || "",
        category: product.category || "Engine",
        description: product.description || "",
        uom: product.uom || "Unit",
        leadTime: product.leadTime?.toString() || "",
        safetyStock: product.safetyStock?.toString() || "",
      });
    } else {
      setFormData({
        code: generateNextCode ? generateNextCode("Engine") : "ENG-001",
        name: "",
        category: "Engine",
        description: "",
        uom: "Unit",
        leadTime: "",
        safetyStock: "",
      });
    }
  }, [product, isOpen, generateNextCode]);

  const handleChange = (field, value) => {
    // Auto-generate code when category changes for new products
    if (!product && field === "category") {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
        code: generateNextCode ? generateNextCode(value) : prev.code,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!formData.name.trim()) {
      alert("Product name is required");
      return;
    }

    const productData = {
      ...formData,
      leadTime: parseInt(formData.leadTime) || 0,
      safetyStock: parseInt(formData.safetyStock) || 0,
    };

    onSave(productData);
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
      title={product ? "Edit Product" : "Add New Product"}
      size="lg"
      footer={
        <div style={{ display: "flex", gap: theme.spacing.md, justifyContent: "flex-end" }}>
          <CommonButton variant="secondary" onClick={onClose}>
            Cancel
          </CommonButton>
          <CommonButton variant="primary" onClick={handleSubmit}>
            {product ? "Update Product" : "Add Product"}
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
        {product
          ? "Update product information"
          : "Create a new product in the master data"}
      </p>
      <form onSubmit={handleSubmit}>
        <div style={formContainerStyles}>
          <div style={formRowStyles}>
            <label style={formLabelStyles}>Product Code</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => handleChange("code", e.target.value)}
              onFocus={() => setFocusedInput("code")}
              onBlur={() => setFocusedInput(null)}
              style={getFormInputStyle("code")}
              disabled={!!product}
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
              disabled={!!product}
            >
              <option value="Engine">Engine</option>
              <option value="Axle">Axle</option>
            </select>
          </div>
          <div style={formRowStyles}>
            <label style={formLabelStyles}>Product Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              onFocus={() => setFocusedInput("name")}
              onBlur={() => setFocusedInput(null)}
              placeholder="Product name"
              style={getFormInputStyle("name")}
            />
          </div>
          <div style={formRowStyles}>
            <label style={formLabelStyles}>Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              onFocus={() => setFocusedInput("description")}
              onBlur={() => setFocusedInput(null)}
              placeholder="Product description"
              style={getFormInputStyle("description")}
            />
          </div>
          <div style={formRowStyles}>
            <label style={formLabelStyles}>Unit of Measure</label>
            <input
              type="text"
              value={formData.uom}
              onChange={(e) => handleChange("uom", e.target.value)}
              onFocus={() => setFocusedInput("uom")}
              onBlur={() => setFocusedInput(null)}
              placeholder="Unit"
              style={getFormInputStyle("uom")}
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
            <label style={formLabelStyles}>Safety Stock</label>
            <input
              type="number"
              value={formData.safetyStock}
              onChange={(e) => handleChange("safetyStock", e.target.value)}
              onFocus={() => setFocusedInput("safetyStock")}
              onBlur={() => setFocusedInput(null)}
              placeholder="0"
              style={getFormInputStyle("safetyStock")}
              min="0"
            />
          </div>
        </div>
      </form>
    </CommonModal>
  );
};

export default ProductModal;

