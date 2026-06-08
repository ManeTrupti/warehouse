import {
  ChartBarIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  TagIcon,
} from "@heroicons/react/24/outline";

export const TABS = [
  // { id: "products", label: "Product Master", icon: CubeIcon },
  // { id: "resources", label: "Resources & Capacity", icon: BuildingOfficeIcon },
  // { id: "departments", label: "Workstations", icon: FolderIcon },
  // { id: "bom", label: "BOM & Routing", icon: Cog6ToothIcon },
  { id: "kpis", label: "KPIs", icon: ChartBarIcon },
  { id: "shifts", label: "Shifts", icon: UserGroupIcon },
  {
    id: "rejections",
    label: "Rejection Reasons",
    icon: ExclamationTriangleIcon,
  },
  { id: "downtimecategories", label: "Downtime Categories", icon: ClockIcon },
  { id: "downtime-reasons", label: "Downtime Reasons", icon: ClockIcon },
  // { id: "machines", label: "Machines", icon: ComputerDesktopIcon },
  {
    id: "breakdown",
    label: "Breakdown Reasons",
    icon: ExclamationTriangleIcon,
  },
  {
    id: "production-loss-reasons",
    label: "Production Loss Reasons",
    icon: TagIcon,
  },
];

export const DEFAULT_TAB = "kpis";
