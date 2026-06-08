import React, { useEffect, useState } from "react";
import CommonModal from "@shared/components/CommonModal";
import { useDispatch } from "react-redux";
import { acknowledgeTicket, closeTicket } from "@core/store/slices/BrekdownDashboard/ticketCenterSlice";

const CardComponent = ({
  id,
  reason,
  resourceName,
  workstationName,
  breakdownType,
  status = "open",
  createdAt,
  onUpdate,
}) => {
  const [seconds, setSeconds] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [currentStatus, setCurrentStatus] = useState(status);

  // Sync when redux updates status
  useEffect(() => {
    setNewStatus(status);
  }, [status]);
  const [remark, setRemark] = useState("");

  /* ================= SYNC STATUS FROM PROPS ================= */
  useEffect(() => {
    setCurrentStatus(status);
  }, [status]);

  /* ================= TIMER ================= */
  useEffect(() => {
  if (!createdAt) return;

  // const formatted = createdAt.replace(" ", "T");
  // const created = new Date(formatted);

  const created = new Date(createdAt.replace(" ", "T"));

  const updateTime = () => {
    const now = new Date();
    const diff = Math.floor((now - created) / 1000);
    setSeconds(diff > 0 ? diff : 0);
  };

  updateTime();

  if (currentStatus !== "closed") {
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }
}, [createdAt, currentStatus]);

  const formatTime = (sec) => {
    const h = String(Math.floor(sec / 3600)).padStart(2, "0");
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  /* ================= COLOR ================= */
  const getBorderColor = () => {
    if (currentStatus === "in_progress") return "border-green-500 bg-green-50";
    if (currentStatus === "open") return "border-red-500 bg-red-50";
    return "border-gray-300 bg-white";
  };

  const getColor = () => {
  if (currentStatus === "in_progress") return "green";
  if (currentStatus === "open") return "red";
  return "gray";
};

  const displayStatus =
  currentStatus === "in_progress"
    ? "Acknowledged"
    : currentStatus === "open"
    ? "Open"
    : "Closed";

    const dispatch = useDispatch();

const handleSave = async () => {
  if (newStatus === "acknowledged") {
    dispatch(acknowledgeTicket(id));
  }

  if (newStatus === "closed") {
    dispatch(closeTicket({ id, remark }));
  }

  setIsModalOpen(false);
};
useEffect(() => {
  if (isModalOpen) {
    if (currentStatus === "open") {
      setNewStatus("acknowledged");
    } else if (currentStatus === "in_progress") {
      setNewStatus("closed");
    }
  }
}, [isModalOpen, currentStatus]);

//   const handleSave = () => {
//   // Convert UI value to backend value
//   let finalStatus = newStatus;

//   if (newStatus === "acknowledged") {
//     finalStatus = "in_progress";
//   }

//   // Immediate UI update
//   setCurrentStatus(finalStatus);

//   // Send to parent / redux / websocket
//   if (onUpdate) {
//     onUpdate(id, finalStatus, remark);
//   }

//   setIsModalOpen(false);
// };

  return (
    <>
      {/* ================= CARD ================= */}
      <div
        className={`rounded-2xl shadow-lg border-2 p-5 transition hover:shadow-xl ${getBorderColor()}`}
      >
        {/* STATUS TOP CENTER */}
        <div className="flex justify-center mb-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-1 text-sm font-semibold bg-white rounded-full shadow border"
          >
            {displayStatus}
          </button>
        </div>

        {/* MIDDLE SECTION */}
        <div className="grid grid-cols-2 gap-4 items-center">
          {/* LEFT SIDE */}
          <div>
            <div className="mb-3">
              <p className="text-xs text-gray-500">Resource</p>
              <p className="font-semibold">{resourceName}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Workstation</p>
              <p className="font-semibold">{workstationName}</p>
            </div>
          </div>

          {/* RIGHT SIDE TIMER */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 flex items-center justify-center rounded-full border-4 border-current text-lg font-bold">
              {formatTime(seconds)}
            </div>

            <div className="mt-3 px-3 py-1 bg-white border rounded text-xs">
              {breakdownType}
            </div>
          </div>
        </div>

        {/* REASON FULL WIDTH */}
        <div className="mt-5 p-3 bg-white border rounded">
          <p className="text-xs text-gray-500 mb-1">Reason</p>
          <p className="font-semibold text-sm">{reason}</p>
        </div>
      </div>

      {/* ================= MODAL ================= */}
      <CommonModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="Update Ticket Status"
>
  <div className="space-y-4">
    <select
  className="w-full border p-2 rounded"
  value={newStatus}
  onChange={(e) => setNewStatus(e.target.value)}
>
  {currentStatus === "open" && (
    <option value="acknowledged">Acknowledged</option>
  )}

  {currentStatus === "in_progress" && (
    <option value="closed">Closed</option>
  )}
</select>

    {newStatus === "closed" && (
      <textarea
        placeholder="Enter closing remark"
        className="w-full border p-2 rounded"
        value={remark}
        onChange={(e) => setRemark(e.target.value)}
      />
    )}

    <div className="flex justify-end gap-3 pt-2">
      <button
        onClick={() => setIsModalOpen(false)}
        className="px-4 py-2 border rounded"
      >
        Cancel
      </button>
      <button
        onClick={handleSave}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Save
      </button>
    </div>
  </div>
</CommonModal>
    </>
  );
};

export default CardComponent;
