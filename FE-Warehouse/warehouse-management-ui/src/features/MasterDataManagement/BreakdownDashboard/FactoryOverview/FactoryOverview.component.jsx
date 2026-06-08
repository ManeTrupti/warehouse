import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFactoryData } from "@core/store/slices/BrekdownDashboard/factoryOverviewSlice";
import { buildWebSocketUrl } from "../../../../services/apiService";
import CommonLoader from "@shared/components/CommonLoader";

const FactoryOverview = () => {
  const dispatch = useDispatch();
  const { data } = useSelector((state) => state.factoryOverview);

  const [selectedSections, setSelectedSections] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const dropdownRef = useRef(null);

  /* ================= WebSocket ================= */
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Build tenant-aware websocket URL using shared helper (respects config.apiUrl and tenant prefixing)
    // const wsUrl = buildWebSocketUrl('ws/factory-overview/');

    // if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
    //   console.log('Child-part readiness websocket URL:', wsUrl);
    // }

    // let isMounted = true;

    const wsUrl = "ws://neosoft-pm.indi4.io:8000/ws/factory-overview/";

    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      const response = JSON.parse(event.data);
      dispatch(setFactoryData(response));
    };

    return () => socket.close();
  }, [dispatch]);

  /* ================= Close dropdown outside click ================= */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= Initial: show all sections ================= */
  useEffect(() => {
    if (data.length > 0) {
      setSelectedSections(data.map((section) => section.name));
    }
  }, [data]);

  const handleSectionToggle = (sectionName) => {
    setSelectedSections((prev) =>
      prev.includes(sectionName)
        ? prev.filter((s) => s !== sectionName)
        : [...prev, sectionName],
    );
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-md w-full flex flex-col p-4
      ${
        isFullscreen
          ? "fixed top-0 left-0 w-screen h-screen z-50 rounded-none shadow-none overflow-auto"
          : "h-[calc(100vh-100px)] overflow-hidden"
      }`}
    >
      {/* ================= Loader ================= */}
      {data.length === 0 ? (
        <div className="flex justify-center items-center h-[60vh]">
          {/* <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div> */}
          <CommonLoader />
        </div>
      ) : (
        <>
          {/* ================= Header ================= */}
          <div className="flex justify-between items-center mb-6">
            {/* Section Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="min-w-[220px] px-4 py-2 border border-gray-300 rounded-md bg-white text-left shadow-sm"
              >
                Sections ({selectedSections.length})
              </button>

              {dropdownOpen && (
                <div className="absolute mt-2 w-[250px] max-h-[250px] overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg p-3 z-50">
                  {data.map((section) => (
                    <label key={section.id} className="block mb-2 text-sm">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={selectedSections.includes(section.name)}
                        onChange={() => handleSectionToggle(section.name)}
                      />
                      {section.name}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="text-xl cursor-pointer"
            >
              {isFullscreen ? "⤫" : "⛶"}
            </button>
          </div>

          {/* ================= Sections ================= */}
          <div className="flex gap-6 overflow-auto">
            {data
              .filter((section) => selectedSections.includes(section.name))
              .map((section) => (
                <div
                  key={section.id}
                  className="min-w-[300px] bg-white rounded-xl shadow-xl p-4 flex flex-col items-center"
                >
                  <h2 className="text-lg font-bold mb-4 text-center">
                    {section.name}
                  </h2>

                  {section.workstations.length === 0 ? (
                    <p className="text-gray-400 text-sm">No Workstations</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 w-full">
                      {section.workstations.map((ws) => (
                        <div
                          key={ws.id}
                          className={`p-3 rounded-lg text-center text-white shadow-md transition-transform duration-200 hover:scale-105
                          ${
                            ws.is_ticket_raised
                              ? "bg-gradient-to-br from-red-600 to-red-300"
                              : "bg-gradient-to-br from-green-600 to-green-300"
                          }`}
                        >
                          {ws.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
};

export default FactoryOverview;
