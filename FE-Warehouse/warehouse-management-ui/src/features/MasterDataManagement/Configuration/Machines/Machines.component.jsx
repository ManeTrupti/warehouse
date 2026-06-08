import { useState, useMemo } from "react";
import { useTheme } from "@core/theme";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline";
import { CommonDataGrid } from "@shared/components/CommonDataGrid";
import { CommonButton } from "@shared/components/CommonButton";
import { DeleteConfirmationDialog } from "@shared/components/DeleteConfirmationDialog";
import { CommonHeading } from "@shared/components/CommonHeading";
import MachinesModal from "./MachinesModal.component";
import {
  getMachinesContainerStyles,
  getSearchFilterBarStyles,
  getSearchInputContainerStyles,
  getSearchInputStyles,
  getStatusBadgeStyles,
  getActionsCellStyles,
  getEditIconStyles,
  getDeleteIconStyles,
} from "./Machines.styled";

const initialMachines = [
  {
    id: 1,
    code: "MACH-001",
    name: "CNC Lathe Machine",
    type: "CNC",
    location: "Production Line 1",
    description: "High precision CNC lathe for turning operations",
    status: "Active",
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    code: "MACH-002",
    name: "Milling Machine",
    type: "Milling",
    location: "Production Line 2",
    description: "Vertical milling machine for machining operations",
    status: "Active",
    createdAt: "2024-01-16",
  },
  {
    id: 3,
    code: "MACH-003",
    name: "Assembly Station A",
    type: "Assembly",
    location: "Assembly Bay",
    description: "Main assembly station for final product assembly",
    status: "Active",
    createdAt: "2024-01-17",
  },
];

function Machines() {
  const theme = useTheme();
  const [machines, setMachines] = useState(initialMachines);
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);

  const filteredMachines = useMemo(() => {
    return machines.filter((machine) => {
      const matchesSearch =
        !searchText ||
        machine.code.toLowerCase().includes(searchText.toLowerCase()) ||
        machine.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (machine.type && machine.type.toLowerCase().includes(searchText.toLowerCase())) ||
        (machine.location && machine.location.toLowerCase().includes(searchText.toLowerCase()));
      return matchesSearch;
    });
  }, [machines, searchText]);

  const handleAdd = () => {
    setSelectedMachine(null);
    setIsModalOpen(true);
  };

  const handleEdit = (machine) => {
    setSelectedMachine(machine);
    setIsModalOpen(true);
  };

  const handleDelete = (machine) => {
    setSelectedMachine(machine);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = (formData) => {
    if (selectedMachine) {
      setMachines(
        machines.map((m) =>
          m.id === selectedMachine.id ? { ...m, ...formData } : m
        )
      );
    } else {
      const newMachine = {
        id: machines.length > 0 ? Math.max(...machines.map((m) => m.id)) + 1 : 1,
        ...formData,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setMachines([...machines, newMachine]);
    }
    setIsModalOpen(false);
    setSelectedMachine(null);
  };

  const confirmDelete = () => {
    if (selectedMachine) {
      setMachines(machines.filter((m) => m.id !== selectedMachine.id));
      setIsDeleteDialogOpen(false);
      setSelectedMachine(null);
    }
  };

  const containerStyles = useMemo(
    () => getMachinesContainerStyles(theme),
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
      label: "Machine Code",
      sortable: true,
      minWidth: "10rem",
    },
    {
      key: "name",
      label: "Machine Name",
      sortable: true,
      minWidth: "15rem",
      render: (value) => (
        <div style={{ display: "flex", alignItems: "center", gap: theme.spacing.sm }}>
          <ComputerDesktopIcon
            style={{
              width: "1rem",
              height: "1rem",
              color: theme.colors.primary.DEFAULT,
            }}
          />
          <span style={{ fontWeight: theme.typography.fontWeight.medium }}>
            {value}
          </span>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      sortable: true,
      minWidth: "10rem",
      render: (value) => (
        <span
          style={{
            color: theme.colors.text.secondary,
            fontSize: theme.typography.fontSize.sm[0],
          }}
        >
          {value || "-"}
        </span>
      ),
    },
    {
      key: "location",
      label: "Location",
      sortable: true,
      minWidth: "12rem",
      render: (value) => (
        <span
          style={{
            color: theme.colors.text.secondary,
            fontSize: theme.typography.fontSize.sm[0],
          }}
        >
          {value || "-"}
        </span>
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
      key: "createdAt",
      label: "Created Date",
      sortable: true,
      minWidth: "10rem",
      render: (value) => {
        const date = new Date(value);
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        });
      },
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
              handleEdit(row);
            }}
            aria-label="Edit machine"
          >
            <PencilIcon style={getEditIconStyles(theme)} />
          </CommonButton>
          <CommonButton
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row);
            }}
            aria-label="Delete machine"
          >
            <TrashIcon style={getDeleteIconStyles(theme)} />
          </CommonButton>
        </div>
      ),
    },
  ];

  return (
    <div style={containerStyles}>
      <CommonHeading
        title={`Machines (${filteredMachines.length})`}
        subtitle="Manage production machines and equipment"
      />

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
            placeholder="Search machines..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={searchInputStyles}
          />
        </div>
        <div style={{ marginLeft: "auto" }}>
          <CommonButton variant="primary" icon={PlusIcon} onClick={handleAdd}>
            Add Machine
          </CommonButton>
        </div>
      </div>

      <CommonDataGrid
        columns={columns}
        data={filteredMachines}
        showSearch={false}
      />

      <MachinesModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMachine(null);
        }}
        onSave={handleSave}
        machine={selectedMachine}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedMachine(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Machine"
        itemName={selectedMachine?.name}
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
      />
    </div>
  );
}

export default Machines;

