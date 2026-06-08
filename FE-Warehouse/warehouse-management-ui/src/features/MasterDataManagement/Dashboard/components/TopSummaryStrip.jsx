import React, { useEffect, useMemo } from "react";
import {
  CubeIcon,
  MapIcon,
  ArchiveBoxIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import { useDispatch, useSelector } from "react-redux";
import { overviewReportCard } from "@core/store/slices/Reports/reportsSlice";
import { CommonStatCard } from "@shared/components/CommonStatCard";

const TopSummaryStrip = ({ filters }) => {
  const dispatch = useDispatch();
  const { overviewReportCardData } = useSelector((state) => state.reports);

  useEffect(() => {
    const month = filters?.month || undefined;
    const financialYear = filters?.year || undefined;
    dispatch(overviewReportCard({ month, financialYear }));
  }, [dispatch, filters?.month, filters?.year]);

  const cards = useMemo(() => {
    const d = overviewReportCardData || {};

    return [
      {
        label: "Total Quantity",
        value: Number(d.total_qty || 0).toLocaleString(),
        icon: CubeIcon,
        color:
          "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500",
      },
      {
        label: "Total Zones",
        value: Number(d.total_zones || 0).toLocaleString(),
        icon: Squares2X2Icon,
        color:
          "bg-gradient-to-br from-orange-400 via-amber-500 to-yellow-500",
      },
      {
        label: "Total Racks",
        value: Number(d.total_racks || 0).toLocaleString(),
       
         icon: MapIcon,
        color:
          "bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-500",
      },
      {
        label: "Total Bins",
        value: Number(d.total_bins || 0).toLocaleString(),
         icon: ArchiveBoxIcon,
        color:
          "bg-gradient-to-br from-rose-400 via-pink-500 to-red-500",
      },
    ];
  }, [overviewReportCardData]);

  return (
    <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4 px-4">
      {cards.map(({ label, value, icon: Icon, color }, index) => (
        <CommonStatCard
          key={label}
          title={label}
          value={value}
          icon={Icon}
          toneIndex={index}
          accent={color}
        />
      ))}
    </section>
  );
};

export default TopSummaryStrip;
