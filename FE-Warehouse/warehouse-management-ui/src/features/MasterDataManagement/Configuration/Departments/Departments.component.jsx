import { useState, useMemo } from "react";
import { useTheme } from "@core/theme";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { CommonDataGrid } from "@shared/components/CommonDataGrid";
import { CommonButton } from "@shared/components/CommonButton";
import { CommonHeading } from "@shared/components/CommonHeading";
import { DeleteConfirmationDialog } from "@shared/components/DeleteConfirmationDialog";
import WorkstationModal from "./WorkstationModal.component";
import {
  getWorkstationsContainerStyles,
  getSearchFilterBarStyles,
  getSearchInputContainerStyles,
  getSearchInputStyles,
  getStatusBadgeStyles,
  getEfficiencyStyles,
  getActionsCellStyles,
  getEditIconStyles,
  getDeleteIconStyles,
} from "./Workstations.styled";

// Mock data - matching the images
const initialWorkstations = [
  {
    id: 1,
    code: "WS-E1-01",
    name: "Block Machining Station",
    resource: "Engine Assembly Line 1",
    cycleTime: 45,
    setupTime: 15,
    efficiency: 92,
    status: "available",
  },
  {
    id: 2,
    code: "WS-E1-02",
    name: "Crankshaft Installation",
    resource: "Engine Assembly Line 1",
    cycleTime: 30,
    setupTime: 10,
    efficiency: 88,
    status: "in-use",
  },
  {
    id: 3,
    code: "WS-E1-03",
    name: "Piston Assembly Station",
    resource: "Engine Assembly Line 1",
    cycleTime: 25,
    setupTime: 8,
    efficiency: 95,
    status: "available",
  },
  {
    id: 4,
    code: "WS-E2-01",
    name: "Head Assembly Station",
    resource: "Engine Assembly Line 2",
    cycleTime: 40,
    setupTime: 12,
    efficiency: 90,
    status: "in-use",
  },
  {
    id: 5,
    code: "WS-A1-01",
    name: "Housing Preparation",
    resource: "Axle Assembly Line 1",
    cycleTime: 35,
    setupTime: 10,
    efficiency: 94,
    status: "available",
  },
  {
    id: 6,
    code: "WS-A1-02",
    name: "Differential Assembly",
    resource: "Axle Assembly Line 1",
    cycleTime: 50,
    setupTime: 15,
    efficiency: 78,
    status: "bottleneck",
  },
  {
    id: 7,
    code: "WS-A2-01",
    name: "Hub Installation",
    resource: "Axle Assembly Line 2",
    cycleTime: 28,
    setupTime: 8,
    efficiency: 91,
    status: "available",
  },
  {
    id: 8,
    code: "WS-Q-01",
    name: "Quality Inspection Bay",
    resource: "Testing Bay",
    cycleTime: 20,
    setupTime: 5,
    efficiency: 98,
    status: "available",
  },
];

function Workstations() {
  const theme = useTheme();
  const [workstations, setWorkstations] = useState(initialWorkstations);
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedWorkstation, setSelectedWorkstation] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);

  // Filter workstations based on search
  const filteredWorkstations = useMemo(() => {
    return workstations.filter((workstation) => {
      const matchesSearch =
        !searchText ||
        workstation.code.toLowerCase().includes(searchText.toLowerCase()) ||
        workstation.name.toLowerCase().includes(searchText.toLowerCase()) ||
        workstation.resource.toLowerCase().includes(searchText.toLowerCase());
      return matchesSearch;
    });
  }, [workstations, searchText]);

  const handleAddWorkstation = () => {
    setSelectedWorkstation(null);
    setIsModalOpen(true);
  };

  const handleEditWorkstation = (workstation) => {
    setSelectedWorkstation(workstation);
    setIsModalOpen(true);
  };

  const handleDeleteWorkstation = (workstation) => {
    setSelectedWorkstation(workstation);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveWorkstation = (formData) => {
    if (selectedWorkstation) {
      // Update existing workstation
      setWorkstations(
        workstations.map((w) =>
          w.id === selectedWorkstation.id
            ? {
                ...w,
                ...formData,
              }
            : w
        )
      );
    } else {
      // Add new workstation
      const newWorkstation = {
        id: workstations.length > 0 ? Math.max(...workstations.map((w) => w.id)) + 1 : 1,
        ...formData,
        status: "available",
      };
      setWorkstations([...workstations, newWorkstation]);
    }

    setIsModalOpen(false);
    setSelectedWorkstation(null);
  };

  const confirmDelete = () => {
    if (selectedWorkstation) {
      setWorkstations(workstations.filter((w) => w.id !== selectedWorkstation.id));
      setIsDeleteDialogOpen(false);
      setSelectedWorkstation(null);
    }
  };

  const containerStyles = useMemo(
    () => getWorkstationsContainerStyles(theme),
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
      key: "resource",
      label: "Resource",
      sortable: true,
      minWidth: "12rem",
    },
    {
      key: "cycleTime",
      label: "Cycle Time",
      sortable: true,
      minWidth: "8rem",
      render: (value) => `${value} min`,
    },
    {
      key: "setupTime",
      label: "Setup Time",
      sortable: true,
      minWidth: "8rem",
      render: (value) => `${value} min`,
    },
    {
      key: "efficiency",
      label: "Efficiency",
      sortable: true,
      minWidth: "8rem",
      render: (value) => (
        <span style={getEfficiencyStyles(theme, value)}>{value}%</span>
      ),
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
              handleEditWorkstation(row);
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
              handleDeleteWorkstation(row);
            }}
            aria-label="Delete workstation"
          >
            <TrashIcon style={getDeleteIconStyles(theme)} />
          </CommonButton>
        </div>
      ),
    },
  ];

  return (
    <div style={containerStyles}>
      {/* Title */}
      <CommonHeading
        title={`All Workstations (${filteredWorkstations.length})`}
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
            placeholder="Search workstations..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={searchInputStyles}
          />
        </div>
        <div style={{ marginLeft: "auto" }}>
          <CommonButton
            variant="primary"
            icon={PlusIcon}
            onClick={handleAddWorkstation}
          >
            Add Workstation
          </CommonButton>
        </div>
      </div>

      {/* Data Grid */}
      <CommonDataGrid
        columns={columns}
        data={filteredWorkstations}
        showSearch={false}
      />

      {/* Workstation Modal */}
      <WorkstationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedWorkstation(null);
        }}
        onSave={handleSaveWorkstation}
        workstation={selectedWorkstation}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedWorkstation(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Workstation"
        itemName={selectedWorkstation?.name}
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
      />
    </div>
  );
}

export default Workstations;
