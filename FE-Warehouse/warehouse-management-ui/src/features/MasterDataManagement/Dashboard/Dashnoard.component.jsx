import React, { useState } from "react";
import { CommonHeading } from "@shared/components/CommonHeading";
import TopSummaryStrip from "./components/TopSummaryStrip";
import InventoryVisualSection from "./components/InventoryVisualSection";
import InventoryVisualBinSection from "./components/InventoryVisualBinSection";
import InventoryVisualTrendSection from "./components/InventoryVisualTrendSection";
import SearchableInputDropdown from "@shared/components/SearchableInputDropdown";

function Dashboard() {
  const getFinancialYearStartYear = (date = new Date()) => {
    const year = date.getFullYear();
    const monthIndex = date.getMonth(); // 0=Jan
    return monthIndex >= 3 ? year : year - 1; // FY starts in Apr
  };

  const getFinancialYear = (date = new Date()) => {
    const startYear = getFinancialYearStartYear(date);
    const endYear = startYear + 1;
    return `${startYear}-${endYear}`;
  };

  const [filters, setFilters] = useState({
    month: "",
    year: getFinancialYear(),
  });

  const handleChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

 const months = [
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
];

  const currentFyStart = getFinancialYearStartYear();
  const years = Array.from({ length: 15 }, (_, i) => {
    const start = currentFyStart - 3 + i;
    return `${start}-${start + 1}`;
  });

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex max-w flex-col gap-5">

        <CommonHeading
          title="Production Control Tower"
          subtitle="Live view of plan vs actual, OEE and department status"
          rightContent={
            <div className="flex w-96 gap-4 p-2 ">
               <SearchableInputDropdown
                value={filters.year}
                onChange={(value) => handleChange("year", value || "")}
                options={years}
                placeholder="Year"
                searchPlaceholder="Search year"
                className="w-76 h-40"
              />
              <SearchableInputDropdown
                value={filters.month}
                onChange={(value) => handleChange("month", value || "")}
                options={months}
                placeholder="Month"
                searchPlaceholder="Search month"
                className="w-32 h-40"
              />

             
            </div>
          }
        />

        <TopSummaryStrip filters={filters} />
        <InventoryVisualSection filters={filters} />
        <InventoryVisualBinSection filters={filters} />
        <InventoryVisualTrendSection filters={filters} />

      </div>
    </div>
  );
}

export default Dashboard;
