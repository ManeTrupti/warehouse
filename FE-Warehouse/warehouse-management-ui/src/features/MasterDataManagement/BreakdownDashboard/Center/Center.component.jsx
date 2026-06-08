import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCenterData } from "@core/store/slices/BrekdownDashboard/centerSlice";
import centerStyles from "./center.styles";

const Center = () => {
  const dispatch = useDispatch();
  const { breakdowns, workstations } = useSelector((state) => state.center);

  const [loading, setLoading] = useState(true);
  const tableRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  /* ================= WebSocket (Factory Style) ================= */
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Build tenant-aware websocket URL using shared helper (respects config.apiUrl and tenant prefixing)
    // const wsUrl = buildWebSocketUrl('ws/factory-overview/');

    // if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
    //   console.log('Child-part readiness websocket URL:', wsUrl);
    // }

    // let isMounted = true;

    const wsUrl = "ws://neosoft-pm.indi4.io:8000/ws/breakdown-action/";

    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      const response = JSON.parse(event.data);
      dispatch(setCenterData(response));
      setLoading(false);
    };

    socket.onerror = () => {
      socket.close();
      setLoading(false);
    };

    return () => socket.close();
  }, [dispatch]);

  /* ================= Get Dynamic Breakdown Types ================= */
  // const breakdownTypes =
  //   data.length > 0 ? Object.keys(data[0].breakdowns || {}) : [];

  return (
    <div
      className={`${centerStyles.container} ${
        isFullscreen && centerStyles.fullscreen
      }`}
    >
      {/* Header */}
      <div className={centerStyles.header}>
        <h2 className={centerStyles.title}>Center Overview</h2>

        <button
  onClick={() => setIsFullscreen((prev) => !prev)}
  className="text-xl "
>
  {isFullscreen ? "⤫" : "⛶"}
</button>
      </div>

      {/* Loader */}
      {loading ? (
        <div className={centerStyles.loaderWrapper}>
          <div className={centerStyles.loader}></div>
        </div>
      ) : workstations.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">
          No workstation data available
        </p>
      ) : (
        <div className="overflow-auto" ref={tableRef}>
          <table className={centerStyles.table}>
            <thead className="sticky top-0 z-20 bg-indigo-100">
              <tr
                className={`${centerStyles.tableHead} sticky top-0 bg-indigo-100`}
              >
                <th className="p-3 text-left sticky left-0 z-30 bg-indigo-100">
                  Workstation
                </th>

                {breakdowns.map((bd) => (
                  <th key={bd.id} className="p-3 text-center ">
                    {bd.name}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {workstations.map((ws) => (
                // <tr key={ws.id} className={centerStyles.row}>

                <tr
                  key={ws.id}
                  className={`${centerStyles.row} ${
                    ws.statuses.some((s) => s.active)
                      ? "bg-white transition-all duration-500"
                      : ""
                  }`}
                >
                  <td className="p-3 font-semibold sticky left-0 bg-white z-10">
                    {ws.workstation_name}
                  </td>

                  {breakdowns.map((bd) => {
                    const status = ws.statuses.find(
                      (s) => s.breakdown_id === bd.id,
                    );

                    return (
                      <td key={bd.id} className="p-3">
                        <div className="flex items-center justify-center">
                          {status?.active ? (
                            <div className={centerStyles.redDot}></div>
                          ) : (
                            <div className={centerStyles.greenDot}></div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Center;
