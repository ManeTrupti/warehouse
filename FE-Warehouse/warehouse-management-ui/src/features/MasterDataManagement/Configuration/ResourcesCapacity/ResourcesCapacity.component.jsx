import { useState, useMemo } from "react";
import { useTheme } from "@core/theme";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { CommonButton } from "@shared/components/CommonButton";
import { CommonHeading } from "@shared/components/CommonHeading";
import { DeleteConfirmationDialog } from "@shared/components/DeleteConfirmationDialog";
import ResourceModal from "./ResourceModal.component";
import {
  getResourcesContainerStyles,
  getSearchFilterBarStyles,
  getSearchInputContainerStyles,
  getSearchInputStyles,
  getWorkCenterCardStyles,
  getWorkCenterCardHeaderStyles,
  getWorkCenterCardHeaderLeftStyles,
  getWorkCenterCardHeaderRightStyles,
  getWorkCenterCardContentStyles,
  getStatusBadgeStyles,
  getProgressBarContainerStyles,
  getProgressBarStyles,
  getProgressBarFillStyles,
  getWorkstationTableStyles,
  getWorkstationTableHeaderStyles,
  getWorkstationTableHeaderCellStyles,
  getWorkstationTableRowStyles,
  getWorkstationTableCellStyles,
  getEfficiencyStyles,
  getActionsCellStyles,
  getEditIconStyles,
  getDeleteIconStyles,
} from "./ResourcesCapacity.styled";

// Mock data - matching the images
const initialWorkCenters = [
  {
    id: 1,
    code: "WC-001",
    name: "Engine Assembly Line 1",
    status: "available",
    capacityPerDay: 50,
    utilization: 78,
    workstations: [
      {
        id: 1,
        code: "WS-E1-01",
        name: "Block Machining Station",
        cycleTime: 45,
        setupTime: 15,
        efficiency: 92,
        status: "available",
      },
      {
        id: 2,
        code: "WS-E1-02",
        name: "Crankshaft Installation",
        cycleTime: 30,
        setupTime: 10,
        efficiency: 88,
        status: "in-use",
      },
      {
        id: 3,
        code: "WS-E1-03",
        name: "Piston Assembly Station",
        cycleTime: 25,
        setupTime: 8,
        efficiency: 95,
        status: "available",
      },
    ],
  },
  {
    id: 2,
    code: "WC-002",
    name: "Engine Assembly Line 2",
    status: "in-use",
    capacityPerDay: 45,
    utilization: 92,
    workstations: [
      {
        id: 4,
        code: "WS-E2-01",
        name: "Head Assembly Station",
        cycleTime: 40,
        setupTime: 12,
        efficiency: 90,
        status: "in-use",
      },
    ],
  },
  {
    id: 3,
    code: "WC-003",
    name: "Axle Assembly Line 1",
    status: "available",
    capacityPerDay: 80,
    utilization: 65,
    workstations: [
      {
        id: 5,
        code: "WS-A1-01",
        name: "Housing Preparation",
        cycleTime: 35,
        setupTime: 10,
        efficiency: 94,
        status: "available",
      },
      {
        id: 6,
        code: "WS-A1-02",
        name: "Differential Assembly",
        cycleTime: 50,
        setupTime: 15,
        efficiency: 78,
        status: "bottleneck",
      },
    ],
  },
  {
    id: 4,
    code: "WC-004",
    name: "Axle Assembly Line 2",
    status: "bottleneck",
    capacityPerDay: 75,
    utilization: 95,
    workstations: [],
  },
  {
    id: 5,
    code: "WC-005",
    name: "Testing Bay",
    status: "available",
    capacityPerDay: 100,
    utilization: 55,
    workstations: [],
  },
];

const ResourcesCapacity = () => {
  const theme = useTheme();
  const [workCenters, setWorkCenters] = useState(initialWorkCenters);
  const [expandedWorkCenters, setExpandedWorkCenters] = useState(new Set()); // All work centers closed by default
  const [searchText, setSearchText] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  const containerStyles = useMemo(
    () => getResourcesContainerStyles(theme),
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

  const filteredWorkCenters = useMemo(() => {
    if (!searchText.trim()) return workCenters;
    const searchLower = searchText.toLowerCase();
    return workCenters.filter(
      (wc) =>
        wc.code.toLowerCase().includes(searchLower) ||
        wc.name.toLowerCase().includes(searchLower)
    );
  }, [workCenters, searchText]);

  const toggleWorkCenterExpansion = (workCenterId) => {
    setExpandedWorkCenters((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(workCenterId)) {
        newSet.delete(workCenterId);
      } else {
        newSet.add(workCenterId);
      }
      return newSet;
    });
  };

  const handleCreateResource = () => {
    setEditingResource(null);
    setIsModalOpen(true);
  };

  const handleEditResource = (workCenter) => {
    setEditingResource(workCenter);
    setIsModalOpen(true);
  };

  const handleDeleteResource = (workCenter) => {
    setDeleteConfirmation({
      title: "Delete Work Center",
      message: `Are you sure you want to delete ${workCenter.code} - ${workCenter.name}? This action cannot be undone.`,
      onConfirm: () => {
        setWorkCenters((prev) => prev.filter((wc) => wc.id !== workCenter.id));
        setDeleteConfirmation(null);
      },
    });
  };

  const handleSaveResource = (resourceData) => {
    if (editingResource) {
      setWorkCenters((prev) =>
        prev.map((wc) => (wc.id === editingResource.id ? { ...wc, ...resourceData } : wc))
      );
    } else {
      const newResource = {
        id: Date.now(),
        ...resourceData,
        workstations: [],
      };
      setWorkCenters((prev) => [...prev, newResource]);
    }
    setIsModalOpen(false);
    setEditingResource(null);
  };

  const generateNextCode = () => {
    const maxCode = workCenters.reduce((max, wc) => {
      const match = wc.code.match(/WC-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 0);
    return `WC-${String(maxCode + 1).padStart(3, "0")}`;
  };

  return (
    <div style={containerStyles}>
      <CommonHeading
        title="Resources & Capacity"
        subtitle="Manage work centers and their capacity"
        rightContent={
          <CommonButton variant="primary" icon={PlusIcon} onClick={handleCreateResource}>
            Add Resource
          </CommonButton>
        }
      />

      {/* Search Bar */}
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
            placeholder="Search resources..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={searchInputStyles}
          />
        </div>
      </div>

      {/* Work Center Cards */}
      {filteredWorkCenters.map((workCenter) => {
        const isExpanded = expandedWorkCenters.has(workCenter.id);

        return (
          <div key={workCenter.id} style={getWorkCenterCardStyles(theme, isExpanded)}>
            {/* Card Header */}
            <div
              style={getWorkCenterCardHeaderStyles(theme)}
              onClick={() => toggleWorkCenterExpansion(workCenter.id)}
            >
              <div style={getWorkCenterCardHeaderLeftStyles(theme)}>
                <BuildingOfficeIcon
                  style={{
                    width: "1.25rem",
                    height: "1.25rem",
                    color: theme.colors.text.secondary,
                  }}
                />
                <span
                  style={{
                    fontSize: theme.typography.fontSize.base[0],
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.text.primary,
                  }}
                >
                  {workCenter.code}
                </span>
                <span
                  style={{
                    fontSize: theme.typography.fontSize.base[0],
                    fontWeight: theme.typography.fontWeight.medium,
                    color: theme.colors.text.primary,
                  }}
                >
                  {workCenter.name}
                </span>
                <span style={getStatusBadgeStyles(theme, workCenter.status)}>
                  {workCenter.status}
                </span>
              </div>
              <div style={getWorkCenterCardHeaderRightStyles(theme)}>
                <div style={getProgressBarContainerStyles(theme)}>
                  <span
                    style={{
                      fontSize: theme.typography.fontSize.sm[0],
                      color: theme.colors.text.secondary,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {workCenter.capacityPerDay} Units/day
                  </span>
                  <div style={getProgressBarStyles(theme, workCenter.utilization)}>
                    <div
                      style={getProgressBarFillStyles(theme, workCenter.utilization)}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: theme.typography.fontSize.sm[0],
                      color: theme.colors.text.secondary,
                      minWidth: "2.5rem",
                      textAlign: "right",
                    }}
                  >
                    {workCenter.utilization}%
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronUpIcon
                    style={{
                      width: "1.25rem",
                      height: "1.25rem",
                      color: theme.colors.text.secondary,
                      marginLeft: theme.spacing.md,
                    }}
                  />
                ) : (
                  <ChevronDownIcon
                    style={{
                      width: "1.25rem",
                      height: "1.25rem",
                      color: theme.colors.text.secondary,
                      marginLeft: theme.spacing.md,
                    }}
                  />
                )}
              </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && workCenter.workstations.length > 0 && (
              <div style={getWorkCenterCardContentStyles(theme)}>
                <table style={getWorkstationTableStyles(theme)}>
                  <thead style={getWorkstationTableHeaderStyles(theme)}>
                    <tr>
                      <th style={getWorkstationTableHeaderCellStyles(theme)}>Workstation</th>
                      <th style={getWorkstationTableHeaderCellStyles(theme)}>Cycle Time</th>
                      <th style={getWorkstationTableHeaderCellStyles(theme)}>Setup Time</th>
                      <th style={getWorkstationTableHeaderCellStyles(theme)}>Efficiency</th>
                      <th style={getWorkstationTableHeaderCellStyles(theme)}>Status</th>
                      <th style={getWorkstationTableHeaderCellStyles(theme)}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workCenter.workstations.map((workstation) => (
                      <tr key={workstation.id} style={getWorkstationTableRowStyles(theme)}>
                        <td style={getWorkstationTableCellStyles(theme)}>
                          <div>
                            <div
                              style={{
                                fontWeight: theme.typography.fontWeight.medium,
                                color: theme.colors.text.primary,
                              }}
                            >
                              {workstation.code}
                            </div>
                            <div
                              style={{
                                fontSize: theme.typography.fontSize.xs[0],
                                color: theme.colors.text.secondary,
                                marginTop: theme.spacing.xs,
                              }}
                            >
                              {workstation.name}
                            </div>
                          </div>
                        </td>
                        <td style={getWorkstationTableCellStyles(theme)}>
                          {workstation.cycleTime} min
                        </td>
                        <td style={getWorkstationTableCellStyles(theme)}>
                          {workstation.setupTime} min
                        </td>
                        <td style={getWorkstationTableCellStyles(theme)}>
                          <span style={getEfficiencyStyles(theme, workstation.efficiency)}>
                            {workstation.efficiency}%
                          </span>
                        </td>
                        <td style={getWorkstationTableCellStyles(theme)}>
                          <span style={getStatusBadgeStyles(theme, workstation.status)}>
                            {workstation.status}
                          </span>
                        </td>
                        <td style={getWorkstationTableCellStyles(theme)}>
                          <div style={getActionsCellStyles(theme)}>
                            <CommonButton
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle edit workstation
                              }}
                              aria-label="Edit workstation"
                            >
                              <PencilIcon style={getEditIconStyles(theme)} />
                            </CommonButton>
                            <CommonButton
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle delete workstation
                              }}
                              aria-label="Delete workstation"
                            >
                              <TrashIcon style={getDeleteIconStyles(theme)} />
                            </CommonButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Card Actions */}
            {isExpanded && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: theme.spacing.sm,
                  padding: theme.spacing.lg,
                  paddingTop: theme.spacing.md,
                  borderTop: `1px solid ${theme.colors.gray[200]}`,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <CommonButton
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditResource(workCenter);
                  }}
                >
                  <PencilIcon style={getEditIconStyles(theme)} />
                  Edit Resource
                </CommonButton>
                <CommonButton
                  variant="danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteResource(workCenter);
                  }}
                >
                  <TrashIcon style={getDeleteIconStyles(theme)} />
                  Delete
                </CommonButton>
              </div>
            )}
          </div>
        );
      })}

      {/* Resource Modal */}
      <ResourceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingResource(null);
        }}
        onSave={handleSaveResource}
        resource={editingResource}
        generateNextCode={generateNextCode}
      />

      {/* Delete Confirmation Dialog */}
      {deleteConfirmation && (
        <DeleteConfirmationDialog
          isOpen={!!deleteConfirmation}
          title={deleteConfirmation.title}
          message={deleteConfirmation.message}
          onConfirm={deleteConfirmation.onConfirm}
          onCancel={() => setDeleteConfirmation(null)}
        />
      )}
    </div>
  );
};

export default ResourcesCapacity;

