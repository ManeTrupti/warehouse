// // features/BreakdownDashboard/BreakdownDashboard.component.jsx

// import React from "react";
// import CardComponent from "./TicketCenter/CardComponent";
// import SummaryCard from "./TicketCenter/SummaryCard";
// import {
//   dummyActiveBreakdowns,
//   dummyBreakdownHistory,
// } from "./TicketCenter/dummyBreakdownData";

// function BreakdownDashboard() {
//   return (
//     <div className="p-6 space-y-8 bg-gray-100 min-h-screen">

//       {/* ===== Top Summary Cards ===== */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//         <SummaryCard title="Open Tickets" value="1" color="red" />
//         <SummaryCard title="Today's Tickets" value="3" color="yellow" />
//         <SummaryCard title="Closed" value="2" color="green" />
//         <SummaryCard title="Downtime (min)" value="120" color="blue" />
//       </div>

//       {/* ===== Active Breakdown Section ===== */}
//       <div className="bg-red-50 border border-red-200 rounded-xl p-5">
//         <h2 className="text-2xl font-bold text-red-600 mb-6">
//           ▶ Active Breakdowns - Live Timers Running
//         </h2>

//         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
//           {dummyActiveBreakdowns.map((item) => (
//             <CardComponent key={item.id} {...item} />
//           ))}
//         </div>
//       </div>

//       {/* ===== Breakdown History ===== */}
//       <div className="bg-white rounded-xl shadow-md p-6">
//         <h2 className="text-2xl font-bold mb-6">Breakdown History</h2>

//         <div className="overflow-x-auto">
//           <table className="min-w-full text-sm">
//             <thead>
//               <tr className="bg-gray-100 text-gray-600 uppercase text-xs">
//                 <th className="px-4 py-3 text-left">Date</th>
//                 <th className="px-4 py-3 text-left">Department</th>
//                 <th className="px-4 py-3 text-left">Machine</th>
//                 <th className="px-4 py-3 text-left">Type</th>
//                 <th className="px-4 py-3 text-left">Reason</th>
//                 <th className="px-4 py-3 text-left">Shift</th>
//                 <th className="px-4 py-3 text-left">Duration</th>
//                 <th className="px-4 py-3 text-left">Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {dummyBreakdownHistory.map((row, index) => (
//                 <tr
//                   key={index}
//                   className="border-b hover:bg-gray-50 transition"
//                 >
//                   <td className="px-4 py-3">{row.date}</td>
//                   <td className="px-4 py-3">{row.department}</td>
//                   <td className="px-4 py-3">{row.machine}</td>
//                   <td className="px-4 py-3">{row.type}</td>
//                   <td className="px-4 py-3">{row.reason}</td>
//                   <td className="px-4 py-3">{row.shift}</td>
//                   <td className="px-4 py-3 font-semibold text-red-500">
//                     {row.duration}
//                   </td>
//                   <td className="px-4 py-3">
//                     <span
//                       className={`px-3 py-1 rounded-full text-xs font-semibold ${
//                         row.status === "Open"
//                           ? "bg-red-100 text-red-600"
//                           : "bg-green-100 text-green-600"
//                       }`}
//                     >
//                       {row.status}
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//     </div>
//   );
// }

// export default BreakdownDashboard;

import { useState, useMemo, lazy, Suspense, useCallback, memo } from "react";
import { useTheme } from "@core/theme";
import { CommonHeading } from "@shared/components/CommonHeading";
import {
  getBreakdownContainerStyles,
  getTabsContainerStyles,
  getTabButtonStyles,
  getTabContentStyles,
} from "./BreakdownDashboard.styled";

// Lazy loaded tabs
const TicketCenter = lazy(() =>
  import("./TicketCenter/TicketCenter.component"),
);
const FactoryOverview = lazy(() =>
  import("./FactoryOverview/FactoryOverview.component"),
);
const Center = lazy(() => import("./Center/Center.component"));

// Default tab
const DEFAULT_TAB = "ticket-center";

// Tabs inside component (no constants file needed)
const TABS = [
  { id: "ticket-center", label: "Ticket Center" },
  { id: "factory-overview", label: "Factory Overview" },
  { id: "center", label: "Center" },
];

// Component map
const COMPONENT_MAP = {
  "ticket-center": TicketCenter,
  "factory-overview": FactoryOverview,
  center: Center,
};

// Loader
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
      }}
    >
      Loading...
    </div>
  );
});

const TabButton = memo(
  ({
    tab,
    isActive,
    isHovered,
    onTabClick,
    onMouseEnter,
    onMouseLeave,
    theme,
  }) => {
    const styles = getTabButtonStyles(theme, isActive, isHovered);

    return (
      <button
        type="button"
        onClick={() => onTabClick(tab.id)}
        onMouseEnter={() => onMouseEnter(tab.id)}
        onMouseLeave={onMouseLeave}
        style={styles}
      >
        {tab.label}
      </button>
    );
  },
);

function BreakdownDashboard() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(DEFAULT_TAB);
  const [hoveredTab, setHoveredTab] = useState(null);

  const containerStyles = useMemo(
    () => getBreakdownContainerStyles(theme),
    [theme],
  );

  const tabsContainerStyles = useMemo(
    () => getTabsContainerStyles(theme),
    [theme],
  );

  const tabContentStyles = useMemo(
    () => getTabContentStyles(theme),
    [theme],
  );

  const ActiveComponent = useMemo(() => {
    return COMPONENT_MAP[activeTab] || COMPONENT_MAP[DEFAULT_TAB];
  }, [activeTab]);

  const handleTabClick = useCallback((id) => {
    setActiveTab(id);
  }, []);

  return (
    <div style={containerStyles}>
      <CommonHeading
        title="Breakdown Dashboard"
        subtitle="Live breakdown monitoring and analytics"
      />

      <div style={tabsContainerStyles}>
        {TABS.map((tab) => (
          <TabButton
            key={tab.id}
            tab={tab}
            isActive={activeTab === tab.id}
            isHovered={hoveredTab === tab.id}
            onTabClick={handleTabClick}
            onMouseEnter={setHoveredTab}
            onMouseLeave={() => setHoveredTab(null)}
            theme={theme}
          />
        ))}
      </div>

      <div style={tabContentStyles}>
        <Suspense fallback={<TabContentLoader />}>
          <ActiveComponent />
        </Suspense>
      </div>
    </div>
  );
}

export default BreakdownDashboard;
