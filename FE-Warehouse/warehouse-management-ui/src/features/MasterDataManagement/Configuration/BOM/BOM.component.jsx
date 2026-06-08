import { useState, useMemo } from "react";
import { useTheme } from "@core/theme";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  Cog6ToothIcon,
  CircleStackIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";
import { CommonButton } from "@shared/components/CommonButton";
import { CommonDataGrid } from "@shared/components/CommonDataGrid";
import { CommonHeading } from "@shared/components/CommonHeading";
import { DeleteConfirmationDialog } from "@shared/components/DeleteConfirmationDialog";
import BOMModal from "./BOMModal.component";
import ComponentModal from "./ComponentModal.component";
import ProcessRouting from "./ProcessRouting.component";
import {
  getBOMContainerStyles,
  getSearchFilterBarStyles,
  getSearchInputContainerStyles,
  getSearchInputStyles,
  getCategorySelectStyles,
  getBOMCardStyles,
  getBOMCardHeaderStyles,
  getBOMCardHeaderLeftStyles,
  getBOMCardHeaderRightStyles,
  getBOMCardContentStyles,
  getBOMCardMetadataStyles,
  getBOMCardMetadataRowStyles,
  getCategoryBadgeStyles,
  getStatusBadgeStyles,
  getCriticalBadgeStyles,
  getBOMCardActionsStyles,
  getActionsCellStyles,
  getEditIconStyles,
  getDeleteIconStyles,
} from "./BOM.styled";
import {
  getBOMTabsContainerStyles,
  getBOMTabButtonStyles,
} from "./ProcessRouting.styled";

// Mock data - matching the images
const initialBOMs = [
  {
    id: 1,
    productCode: "ENG-001",
    productName: "Diesel Engine 250HP",
    category: "Engine",
    status: "Active",
    version: "1.2",
    componentCount: 12,
    effectiveFrom: "2024-01-01",
    effectiveTo: "2025-12-31",
    components: [
      {
        id: 1,
        step: 1,
        componentCode: "RM-001",
        componentName: "Engine Block Casting",
        category: "Engine",
        quantity: 1,
        unit: "Unit",
        leadTime: 7,
        critical: true,
      },
      {
        id: 2,
        step: 2,
        componentCode: "RM-002",
        componentName: "Crankshaft Forging",
        category: "Engine",
        quantity: 1,
        unit: "Unit",
        leadTime: 5,
        critical: true,
      },
      {
        id: 3,
        step: 3,
        componentCode: "RM-005",
        componentName: "Piston Assembly",
        category: "Engine",
        quantity: 6,
        unit: "Unit",
        leadTime: 3,
        critical: false,
      },
      {
        id: 4,
        step: 4,
        componentCode: "RM-006",
        componentName: "Cylinder Head",
        category: "Engine",
        quantity: 1,
        unit: "Unit",
        leadTime: 4,
        critical: true,
      },
      {
        id: 5,
        step: 5,
        componentCode: "RM-007",
        componentName: "Fuel Injection System",
        category: "Engine",
        quantity: 1,
        unit: "Set",
        leadTime: 6,
        critical: true,
      },
    ],
  },
  {
    id: 2,
    productCode: "ENG-002",
    productName: "Diesel Engine 350HP",
    category: "Engine",
    status: "Active",
    version: "2.0",
    componentCount: 15,
    effectiveFrom: "2024-03-01",
    effectiveTo: "2025-12-31",
    components: [],
  },
  {
    id: 3,
    productCode: "AXL-001",
    productName: "Front Axle Heavy Duty",
    category: "Axle",
    status: "Active",
    version: "1.0",
    componentCount: 8,
    effectiveFrom: "2024-01-15",
    effectiveTo: "2025-12-31",
    components: [],
  },
  {
    id: 4,
    productCode: "AXL-002",
    productName: "Rear Axle Standard",
    category: "Axle",
    status: "Active",
    version: "1.5",
    componentCount: 10,
    effectiveFrom: "2024-02-01",
    effectiveTo: "2025-12-31",
    components: [],
  },
];

const CATEGORIES = ["All Categories", "Engine", "Axle"];


function BOM() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState("bom"); // "bom" or "routing"
  const [boms, setBOMs] = useState(initialBOMs);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [expandedBOMs, setExpandedBOMs] = useState(new Set()); // All BOMs closed by default
  const [isBOMModalOpen, setIsBOMModalOpen] = useState(false);
  const [isComponentModalOpen, setIsComponentModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBOM, setSelectedBOM] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [selectedBOMForComponent, setSelectedBOMForComponent] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [categoryFocused, setCategoryFocused] = useState(false);

  // Filter BOMs based on search and category
  const filteredBOMs = useMemo(() => {
    return boms.filter((bom) => {
      const matchesSearch =
        !searchText ||
        bom.productCode.toLowerCase().includes(searchText.toLowerCase()) ||
        bom.productName.toLowerCase().includes(searchText.toLowerCase());
      const matchesCategory =
        selectedCategory === "All Categories" || bom.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [boms, searchText, selectedCategory]);

  const toggleBOMExpansion = (bomId) => {
    setExpandedBOMs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(bomId)) {
        newSet.delete(bomId);
      } else {
        newSet.add(bomId);
      }
      return newSet;
    });
  };

  const handleCreateBOM = () => {
    setSelectedBOM(null);
    setIsBOMModalOpen(true);
  };

  const handleEditBOM = (bom) => {
    setSelectedBOM(bom);
    setIsBOMModalOpen(true);
  };

  const handleDeleteBOM = (bom) => {
    setSelectedBOM(bom);
    setIsDeleteDialogOpen(true);
  };

  const handleCloneBOM = (bom) => {
    const clonedBOM = {
      ...bom,
      id: boms.length > 0 ? Math.max(...boms.map((b) => b.id)) + 1 : 1,
      version: "1.0",
      productCode: `${bom.productCode}-COPY`,
      components: bom.components.map((comp) => ({
        ...comp,
        id: Date.now() + Math.random(),
      })),
    };
    setBOMs([...boms, clonedBOM]);
  };

  const handleSaveBOM = (formData) => {
    if (selectedBOM) {
      // Update existing BOM
      setBOMs(
        boms.map((b) =>
          b.id === selectedBOM.id
            ? {
                ...b,
                ...formData,
                components: b.components || [],
              }
            : b
        )
      );
    } else {
      // Add new BOM
      const newBOM = {
        id: boms.length > 0 ? Math.max(...boms.map((b) => b.id)) + 1 : 1,
        ...formData,
        status: "Active",
        componentCount: 0,
        components: [],
      };
      setBOMs([...boms, newBOM]);
    }

    setIsBOMModalOpen(false);
    setSelectedBOM(null);
  };

  const handleAddComponent = (bom) => {
    setSelectedBOMForComponent(bom);
    setSelectedComponent(null);
    setIsComponentModalOpen(true);
  };

  const handleEditComponent = (bom, component) => {
    setSelectedBOMForComponent(bom);
    setSelectedComponent(component);
    setIsComponentModalOpen(true);
  };

  const handleDeleteComponent = (bom, component) => {
    setBOMs(
      boms.map((b) =>
        b.id === bom.id
          ? {
              ...b,
              components: b.components.filter((c) => c.id !== component.id),
              componentCount: b.components.filter((c) => c.id !== component.id).length,
            }
          : b
      )
    );
  };

  const handleSaveComponent = (formData) => {
    if (!selectedBOMForComponent) return;

    if (selectedComponent) {
      // Update existing component
      setBOMs(
        boms.map((b) =>
          b.id === selectedBOMForComponent.id
            ? {
                ...b,
                components: b.components.map((c) =>
                  c.id === selectedComponent.id ? { ...c, ...formData } : c
                ),
              }
            : b
        )
      );
    } else {
      // Add new component
      const newComponent = {
        id: Date.now(),
        ...formData,
      };
      setBOMs(
        boms.map((b) =>
          b.id === selectedBOMForComponent.id
            ? {
                ...b,
                components: [...(b.components || []), newComponent],
                componentCount: (b.components || []).length + 1,
              }
            : b
        )
      );
    }

    setIsComponentModalOpen(false);
    setSelectedComponent(null);
    setSelectedBOMForComponent(null);
  };

  const confirmDeleteBOM = () => {
    if (selectedBOM) {
      setBOMs(boms.filter((b) => b.id !== selectedBOM.id));
      setIsDeleteDialogOpen(false);
      setSelectedBOM(null);
    }
  };

  const containerStyles = useMemo(() => getBOMContainerStyles(theme), [theme]);
  const searchFilterBarStyles = useMemo(() => getSearchFilterBarStyles(theme), [theme]);
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

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const bomTabsContainerStyles = useMemo(
    () => getBOMTabsContainerStyles(theme),
    [theme]
  );

  return (
    <div style={containerStyles}>
      {/* Tabs */}
      <div style={bomTabsContainerStyles}>
        <button
          type="button"
          onClick={() => setActiveTab("bom")}
          style={getBOMTabButtonStyles(theme, activeTab === "bom")}
          onMouseEnter={(e) => {
            if (activeTab !== "bom") {
              e.currentTarget.style.color = theme.colors.primary.DEFAULT;
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== "bom") {
              e.currentTarget.style.color = theme.colors.text.secondary;
            }
          }}
        >
          Bill of Materials
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("routing")}
          style={getBOMTabButtonStyles(theme, activeTab === "routing")}
          onMouseEnter={(e) => {
            if (activeTab !== "routing") {
              e.currentTarget.style.color = theme.colors.primary.DEFAULT;
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== "routing") {
              e.currentTarget.style.color = theme.colors.text.secondary;
            }
          }}
        >
          Process Routing
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "bom" ? (
        <>
          {/* Title Section */}
          <CommonHeading
            title="Bill of Materials (BOM)"
            subtitle="Manage product structures and component relationships"
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
            placeholder="Search by product code or name..."
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
          <CommonButton variant="primary" icon={PlusIcon} onClick={handleCreateBOM}>
            Create BOM
          </CommonButton>
        </div>
      </div>

      {/* BOM Cards */}
      {filteredBOMs.map((bom) => {
        const isExpanded = expandedBOMs.has(bom.id);
        const CategoryIcon = bom.category === "Engine" ? Cog6ToothIcon : CircleStackIcon;

        return (
          <div key={bom.id} style={getBOMCardStyles(theme, isExpanded)}>
            {/* Card Header */}
            <div
              style={getBOMCardHeaderStyles(theme)}
              onClick={() => toggleBOMExpansion(bom.id)}
            >
              <div style={getBOMCardHeaderLeftStyles(theme)}>
                <span
                  style={{
                    fontSize: theme.typography.fontSize.base[0],
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.text.primary,
                  }}
                >
                  {bom.productCode}
                </span>
                <span style={getCategoryBadgeStyles(theme, bom.category)}>
                  <CategoryIcon style={{ width: "0.875rem", height: "0.875rem" }} />
                  {bom.category}
                </span>
                <span style={getStatusBadgeStyles(theme, bom.status)}>{bom.status}</span>
                <span
                  style={{
                    fontSize: theme.typography.fontSize.base[0],
                    fontWeight: theme.typography.fontWeight.medium,
                    color: theme.colors.text.primary,
                  }}
                >
                  {bom.productName}
                </span>
              </div>
              <div style={getBOMCardHeaderRightStyles(theme)}>
                <span
                  style={{
                    fontSize: theme.typography.fontSize.sm[0],
                    color: theme.colors.text.secondary,
                  }}
                >
                  {bom.version}
                </span>
                <span
                  style={{
                    fontSize: theme.typography.fontSize.sm[0],
                    color: theme.colors.text.secondary,
                  }}
                >
                  {bom.componentCount} components
                </span>
                {isExpanded ? (
                  <ChevronUpIcon style={{ width: "1.25rem", height: "1.25rem" }} />
                ) : (
                  <ChevronDownIcon style={{ width: "1.25rem", height: "1.25rem" }} />
                )}
              </div>
            </div>

            {/* Card Content (Expanded) */}
            {isExpanded && (
              <div style={getBOMCardContentStyles(theme)}>
                {/* Metadata */}
                <div style={getBOMCardMetadataStyles(theme)}>
                  <div style={getBOMCardMetadataRowStyles(theme)}>
                    <span>
                      <strong>Effective From:</strong> {formatDate(bom.effectiveFrom)}
                    </span>
                    <span>
                      <strong>Effective To:</strong> {formatDate(bom.effectiveTo)}
                    </span>
                  </div>
                </div>

                {/* Components Table */}
                <CommonDataGrid
                  columns={[
                    {
                      key: "step",
                      label: "Step",
                      sortable: true,
                      minWidth: "4rem",
                    },
                    {
                      key: "component",
                      label: "Component",
                      sortable: true,
                      minWidth: "12rem",
                      render: (_, row) => `${row.componentCode} ${row.componentName}`,
                    },
                    {
                      key: "category",
                      label: "Category",
                      sortable: true,
                      minWidth: "8rem",
                      render: (value) => (
                        <span style={getCategoryBadgeStyles(theme, value)}>{value}</span>
                      ),
                    },
                    {
                      key: "quantity",
                      label: "Qty",
                      sortable: true,
                      minWidth: "5rem",
                    },
                    {
                      key: "unit",
                      label: "Unit",
                      sortable: true,
                      minWidth: "5rem",
                    },
                    {
                      key: "leadTime",
                      label: "Lead Time",
                      sortable: true,
                      minWidth: "8rem",
                      render: (value) => `${value} days`,
                    },
                    {
                      key: "critical",
                      label: "Critical",
                      sortable: true,
                      minWidth: "6rem",
                      render: (value) =>
                        value ? (
                          <span style={getCriticalBadgeStyles(theme)}>Critical</span>
                        ) : (
                          "-"
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
                              handleEditComponent(bom, row);
                            }}
                            aria-label="Edit component"
                          >
                            <PencilIcon style={getEditIconStyles(theme)} />
                          </CommonButton>
                          <CommonButton
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteComponent(bom, row);
                            }}
                            aria-label="Delete component"
                          >
                            <TrashIcon style={getDeleteIconStyles(theme)} />
                          </CommonButton>
                        </div>
                      ),
                    },
                  ]}
                  data={bom.components || []}
                  showSearch={false}
                  defaultPageSize={10}
                />

                {/* Action Buttons */}
                <div style={getBOMCardActionsStyles(theme)}>
                  <CommonButton
                    variant="secondary"
                    icon={PlusIcon}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddComponent(bom);
                    }}
                  >
                    Add Component
                  </CommonButton>
                  <CommonButton
                    variant="secondary"
                    icon={DocumentDuplicateIcon}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloneBOM(bom);
                    }}
                  >
                    Clone BOM
                  </CommonButton>
                  <CommonButton
                    variant="danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteBOM(bom);
                    }}
                  >
                    <TrashIcon style={getDeleteIconStyles(theme)} />
                    Delete
                  </CommonButton>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* BOM Modal */}
      <BOMModal
        isOpen={isBOMModalOpen}
        onClose={() => {
          setIsBOMModalOpen(false);
          setSelectedBOM(null);
        }}
        onSave={handleSaveBOM}
        bom={selectedBOM}
      />

      {/* Component Modal */}
      <ComponentModal
        isOpen={isComponentModalOpen}
        onClose={() => {
          setIsComponentModalOpen(false);
          setSelectedComponent(null);
          setSelectedBOMForComponent(null);
        }}
        onSave={handleSaveComponent}
        component={selectedComponent}
        stepNumber={
          selectedBOMForComponent?.components
            ? selectedBOMForComponent.components.length + 1
            : 1
        }
      />

          {/* Delete Confirmation Dialog */}
          <DeleteConfirmationDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => {
              setIsDeleteDialogOpen(false);
              setSelectedBOM(null);
            }}
            onConfirm={confirmDeleteBOM}
            title="Delete BOM"
            itemName={selectedBOM?.productName}
            confirmButtonText="Delete"
            cancelButtonText="Cancel"
          />
        </>
      ) : (
        <ProcessRouting />
      )}
    </div>
  );
}

export default BOM;
