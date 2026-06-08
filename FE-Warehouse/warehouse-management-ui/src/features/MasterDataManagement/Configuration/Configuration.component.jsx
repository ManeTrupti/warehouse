import { useState, useMemo, lazy, Suspense, useCallback, memo } from "react";
import { useTheme } from "@core/theme";
import { CommonHeading } from "@shared/components/CommonHeading";
import {
  getConfigurationContainerStyles,
  getTabsContainerStyles,
  getTabButtonStyles,
  getTabContentStyles,
} from "./Configuration.styled";
import { TABS, DEFAULT_TAB } from "./Configuration.constants";

// Lazy load components for code splitting
// const Products = lazy(() => import("./Products/Products.component"));
// const ResourcesCapacity = lazy(
//   () => import("./ResourcesCapacity/ResourcesCapacity.component"),
// );
// const Workstations = lazy(() => import("./Departments/Departments.component"));
// const BOM = lazy(() => import("./BOM/BOM.component"));
const KPIs = lazy(() => import("./KPIs/KPIs.component"));
const Shifts = lazy(() => import("./Shifts/Shifts.component"));
const RejectionReason = lazy(() => import("./RejectionReason"));
const DowntimeCategories = lazy(() => import("./DowntimeCategories"));
const DowntimeReasons = lazy(() => import("./DowntimeReasons"));
// const Machines = lazy(() => import("./Machines"));
const Breakdown = lazy(() => import("./Breakdown"));
const ProductionLossReasons = lazy(
  () => import("./ProductionLossReasons"),
);

// Component map for cleaner rendering
const COMPONENT_MAP = {
  // products: Products,
  // resources: ResourcesCapacity,
  // departments: Workstations,
  // bom: BOM,
  kpis: KPIs,
  shifts: Shifts,
  rejections: RejectionReason,
  downtimecategories: DowntimeCategories,
  "downtime-reasons": DowntimeReasons,
  // machines: Machines,
  breakdown: Breakdown,
  "production-loss-reasons": ProductionLossReasons,
};

// Loading fallback component
const TabContentLoader = memo(() => {
  const theme = useTheme();
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "400px",
        color: theme.colors.text.secondary,
        fontSize: theme.typography.fontSize.base[0],
      }}
    >
      Loading...
    </div>
  );
});

TabContentLoader.displayName = "TabContentLoader";

// Memoized Tab Button component
const TabButton = memo(
  ({
    tab,
    isActive,
    isHovered,
    onTabClick,
    onMouseEnter,
    onMouseLeave,
    theme,
    tabId,
  }) => {
    const Icon = tab.icon;
    const tabButtonStyles = getTabButtonStyles(theme, isActive, isHovered);

    const handleClick = useCallback(() => {
      onTabClick(tabId);
    }, [onTabClick, tabId]);

    const handleMouseEnter = useCallback(() => {
      onMouseEnter(tabId);
    }, [onMouseEnter, tabId]);

    return (
      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={onMouseLeave}
        style={tabButtonStyles}
        aria-selected={isActive}
        role="tab"
      >
        <Icon style={{ width: "1.25rem", height: "1.25rem" }} />
        {tab.label}
      </button>
    );
  },
);

TabButton.displayName = "TabButton";

const Configuration = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(DEFAULT_TAB);
  const [hoveredTab, setHoveredTab] = useState(null);

  const containerStyles = useMemo(
    () => getConfigurationContainerStyles(theme),
    [theme],
  );

  const tabsContainerStyles = useMemo(
    () => getTabsContainerStyles(theme),
    [theme],
  );

  const tabContentStyles = useMemo(() => getTabContentStyles(theme), [theme]);

  // Memoized active component
  const ActiveComponent = useMemo(() => {
    return COMPONENT_MAP[activeTab] || COMPONENT_MAP[DEFAULT_TAB];
  }, [activeTab]);

  // Memoized callbacks
  const handleTabClick = useCallback((tabId) => {
    setActiveTab(tabId);
  }, []);

  const handleMouseEnter = useCallback((tabId) => {
    setHoveredTab(tabId);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredTab(null);
  }, []);

  return (
    <div style={containerStyles}>
      <CommonHeading
        title="Configuration"
        subtitle="System configuration and master data management"
      />
      <div style={tabsContainerStyles} role="tablist">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const isHovered = hoveredTab === tab.id;
          return (
            <TabButton
              key={tab.id}
              tab={tab}
              isActive={isActive}
              isHovered={isHovered}
              onTabClick={handleTabClick}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              theme={theme}
              tabId={tab.id}
            />
          );
        })}
      </div>
      <div style={tabContentStyles}>
        <Suspense fallback={<TabContentLoader />}>
          <ActiveComponent />
        </Suspense>
      </div>
    </div>
  );
};

export default Configuration;
