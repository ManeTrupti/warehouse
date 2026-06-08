import { useState, useMemo } from "react";
import { useTheme } from "@core/theme";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  Cog6ToothIcon,
  CircleStackIcon,
} from "@heroicons/react/24/outline";
import { CommonDataGrid } from "@shared/components/CommonDataGrid";
import { CommonButton } from "@shared/components/CommonButton";
import { DeleteConfirmationDialog } from "@shared/components/DeleteConfirmationDialog";
import ProductModal from "./ProductModal.component";
import {
  getProductsContainerStyles,
  getSearchFilterBarStyles,
  getSearchInputContainerStyles,
  getSearchInputStyles,
  getCategorySelectStyles,
  getCategoryBadgeStyles,
  getStatusBadgeStyles,
  getActionsCellStyles,
  getEditIconStyles,
  getDeleteIconStyles,
} from "./Products.styled";
import CommonHeading from "@shared/components/CommonHeading";

// Mock data - matching the images
const initialProducts = [
  {
    id: 1,
    code: "ENG-001",
    name: "Diesel Engine 250HP",
    category: "Engine",
    uom: "Unit",
    leadTime: 14,
    safetyStock: 10,
    status: "Active",
    description: "",
  },
  {
    id: 2,
    code: "ENG-002",
    name: "Diesel Engine 350HP",
    category: "Engine",
    uom: "Unit",
    leadTime: 18,
    safetyStock: 8,
    status: "Active",
    description: "",
  },
  {
    id: 3,
    code: "ENG-003",
    name: "CNG Engine 200HP",
    category: "Engine",
    uom: "Unit",
    leadTime: 12,
    safetyStock: 12,
    status: "Active",
    description: "",
  },
  {
    id: 4,
    code: "AXL-001",
    name: "Front Axle Heavy Duty",
    category: "Axle",
    uom: "Unit",
    leadTime: 10,
    safetyStock: 15,
    status: "Active",
    description: "",
  },
  {
    id: 5,
    code: "AXL-002",
    name: "Rear Axle Standard",
    category: "Axle",
    uom: "Unit",
    leadTime: 8,
    safetyStock: 20,
    status: "Active",
    description: "",
  },
  {
    id: 6,
    code: "AXL-003",
    name: "Drive Axle Premium",
    category: "Axle",
    uom: "Unit",
    leadTime: 12,
    safetyStock: 10,
    status: "Active",
    description: "",
  },
];

const CATEGORIES = ["All Categories", "Engine", "Axle"];

function Products() {
  const theme = useTheme();
  const [products, setProducts] = useState(initialProducts);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [categoryFocused, setCategoryFocused] = useState(false);

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        !searchText ||
        product.code.toLowerCase().includes(searchText.toLowerCase()) ||
        product.name.toLowerCase().includes(searchText.toLowerCase());
      const matchesCategory =
        selectedCategory === "All Categories" ||
        product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchText, selectedCategory]);

  // Generate next product code
  const generateNextCode = (category) => {
    const prefix = category === "Engine" ? "ENG" : "AXL";
    const existingCodes = products
      .filter((p) => p.category === category)
      .map((p) => {
        const num = parseInt(p.code.split("-")[1]);
        return isNaN(num) ? 0 : num;
      });
    const nextNum = existingCodes.length > 0 ? Math.max(...existingCodes) + 1 : 1;
    return `${prefix}-${String(nextNum).padStart(3, "0")}`;
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = (product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedProduct) {
      setProducts(products.filter((p) => p.id !== selectedProduct.id));
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
    }
  };

  const handleSaveProduct = (formData) => {
    if (selectedProduct) {
      // Update existing product
      setProducts(
        products.map((p) =>
          p.id === selectedProduct.id
            ? {
                ...p,
                ...formData,
              }
            : p
        )
      );
    } else {
      // Add new product
      const newProduct = {
        id: products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1,
        ...formData,
        status: "Active",
      };
      setProducts([...products, newProduct]);
    }

    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const containerStyles = useMemo(
    () => getProductsContainerStyles(theme),
    [theme]
  );

  const searchFilterBarStyles = useMemo(
    () => getSearchFilterBarStyles(theme),
    [theme]
  );

  const searchInputContainerStyles = useMemo(
    () => getSearchInputContainerStyles(theme),
    [theme]
  );

  const searchInputStyles = useMemo(
    () => getSearchInputStyles(theme, searchFocused),
    [theme, searchFocused]
  );

  const categorySelectStyles = useMemo(
    () => getCategorySelectStyles(theme, categoryFocused),
    [theme, categoryFocused]
  );


  const columns = [
    {
      key: "code",
      label: "Code",
      sortable: true,
      minWidth: "8rem",
    },
    {
      key: "name",
      label: "Name",
      sortable: true,
      minWidth: "12rem",
    },
    {
      key: "category",
      label: "Category",
      sortable: true,
      minWidth: "10rem",
      render: (value) => {
        const CategoryIcon = value === "Engine" ? Cog6ToothIcon : CircleStackIcon;
        return (
          <span style={getCategoryBadgeStyles(theme, value)}>
            <CategoryIcon style={{ width: "0.875rem", height: "0.875rem" }} />
            {value}
          </span>
        );
      },
    },
    {
      key: "uom",
      label: "UoM",
      sortable: true,
      minWidth: "6rem",
    },
    {
      key: "leadTime",
      label: "Lead Time",
      sortable: true,
      minWidth: "8rem",
      render: (value) => `${value} days`,
    },
    {
      key: "safetyStock",
      label: "Safety Stock",
      sortable: true,
      minWidth: "8rem",
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      minWidth: "8rem",
      render: (value) => (
        <span style={getStatusBadgeStyles(theme, value)}>{value}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      minWidth: "8rem",
      render: (_, row) => (
        <div style={getActionsCellStyles(theme)}>
          <CommonButton
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEditProduct(row);
            }}
            aria-label="Edit product"
          >
            <PencilIcon style={getEditIconStyles(theme)} />
          </CommonButton>
          <CommonButton
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteProduct(row);
            }}
            aria-label="Delete product"
          >
            <TrashIcon style={getDeleteIconStyles(theme)} />
          </CommonButton>
        </div>
      ),
    },
  ];

  return (
    <div style={containerStyles}>
      {/* Product Master Title */}
      <CommonHeading
        title={`Product Master (${filteredProducts.length})`}
      />

      {/* Search and Filter Bar */}
      <div style={searchFilterBarStyles}>
        <div style={searchInputContainerStyles}>
          <MagnifyingGlassIcon
            style={{
              position: "absolute",
              left: theme.spacing.sm,
              top: "50%",
              transform: "translateY(-50%)",
              width: "1rem",
              height: "1rem",
              color: theme.colors.text.secondary,
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            placeholder="Search products..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={searchInputStyles}
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          onFocus={() => setCategoryFocused(true)}
          onBlur={() => setCategoryFocused(false)}
          style={categorySelectStyles}
        >
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <div style={{ marginLeft: "auto" }}>
          <CommonButton
            variant="primary"
            icon={PlusIcon}
            onClick={handleAddProduct}
          >
            Add Product
          </CommonButton>
        </div>
      </div>

      {/* Data Grid */}
      <CommonDataGrid
        columns={columns}
        data={filteredProducts}
        showSearch={false}
      />

      {/* Add/Edit Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduct(null);
        }}
        onSave={handleSaveProduct}
        product={selectedProduct}
        generateNextCode={generateNextCode}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedProduct(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Product"
        itemName={selectedProduct?.name}
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
      />
    </div>
  );
}

export default Products;
