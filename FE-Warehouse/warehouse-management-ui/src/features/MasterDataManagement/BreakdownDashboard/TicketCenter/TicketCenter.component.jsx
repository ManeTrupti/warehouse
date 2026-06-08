import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import CardComponent from "./CardComponent";
import SummaryCard from "./SummaryCard";
import {
  setInitialData,
  ticketUpdated,
  ticketCreated,
} from "@core/store/slices/BrekdownDashboard/ticketCenterSlice";

const TicketCenter = () => {
  const dispatch = useDispatch();

  const { dashboard, running, history } = useSelector(
    (state) => state.ticketCenter
  );

  /* ================= WEBSOCKET ================= */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const wsUrl = "ws://neosoft-pm.indi4.io:8000/ws/tickets/";
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("Ticket WebSocket Connected");
    };

   socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  console.log("WS DATA:", data);

  // ✅ New Ticket Created
  if (data.event === "ticket_created") {
    dispatch(ticketCreated(data));
    return;
  }

  // ✅ Ticket Updated
  if (data.event === "ticket_updated") {
    dispatch(ticketUpdated(data));
    return;
  }

  // ✅ Initial Load
  if (data.dashboard && data.running && data.history) {
    dispatch(setInitialData(data));
  }
};

    socket.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    socket.onclose = () => {
      console.log("Ticket WebSocket Closed");
    };

    socket.event = "ticket_updated";

    return () => socket.close();
  }, [dispatch]);

  /* ================= STATUS UPDATE ================= */
  const handleUpdate = (id, status, remark = "") => {
    // If you need to send back to backend via API or WebSocket
    console.log("Update Ticket:", id, status, remark);
  };

  return (
    <div className="space-y-8">

      {/* ================= SUMMARY ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Open Tickets"
          value={dashboard?.total_open_tickets || 0}
          color="red"
        />
        <SummaryCard
          title="Today's Tickets"
          value={dashboard?.todays_tickets || 0}
          color="yellow"
        />
        <SummaryCard
          title="Closed"
          value={dashboard?.total_closed_tickets || 0}
          color="green"
        />
        <SummaryCard
          title="Downtime (min)"
          value={dashboard?.total_down_time_minutes || 0}
          color="blue"
        />
      </div>

      {/* ================= ACTIVE ================= */}
      <div className="bg-white border border-red-200 rounded-xl p-5">
        <h2 className="text-2xl font-bold text-red-600 mb-6">
          ▶ Active Breakdowns - Live Timers Running
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-h-[650px] overflow-y-auto">
          {running?.map((item) => (
            <CardComponent
              key={item.id}
              id={item.id}
              reason={item.reason}
              resourceName={item.resource?.resource_name}
              workstationName={item.workstation?.workstation_name}
              breakdownType={item.breakdown?.name}
              status={item.status}
              createdAt={item.ticket_raised_at}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      </div>

      {/* ================= HISTORY ================= */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">
          Breakdown History
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-xs uppercase">
                <th className="px-4 py-3 text-left">Ticket</th>
                <th className="px-4 py-3 text-left">Sectoion</th>
                <th className="px-4 py-3 text-left">WorkStation</th>
                <th className="px-4 py-3 text-left">Reason</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {history?.map((row) => (
                <tr key={row.id} className="border-b">
                  <td className="px-4 py-3">{row.ticket_code}</td>
                  <td className="px-4 py-3">
                    {row.resource?.work_center}
                  </td>
                  <td className="px-4 py-3">
                    {row.workstation?.workstation_name}
                  </td>
                  <td className="px-4 py-3">{row.reason}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        row.status === "closed"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {row.status === "in_progress"
                        ? "Acknowledged"
                        : row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default TicketCenter;