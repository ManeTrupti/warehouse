// src/data/dummyBreakdownData.js

export const dummyBreakdownStats = {
  openTickets: 1,
  todayTickets: 3,
  closedTickets: 2,
  totalDowntime: 120,
};

export const dummyActiveBreakdowns = [
  {
    id: 1,
    department: "Section Shaft",
    machine: "CNC Lathe 03",
    type: "Mechanical",
    reason: "Tool holder jammed",
    startTime: "2:30:00 pm",
    duration: "19:28:36",
    status: "Open",
  },
];

export const dummyBreakdownHistory = [
  {
    id: 1,
    date: "2026-02-19",
    department: "Section Shaft",
    machine: "CNC Lathe 03",
    type: "Mechanical",
    reason: "Tool holder jammed",
    shift: "Shift 2",
    duration: "19:28:36",
    status: "Open",
  },
  {
    id: 2,
    date: "2026-02-19",
    department: "Piston Hard",
    machine: "CNC Lathe 01",
    type: "Electrical",
    reason: "Spindle motor overheated",
    shift: "Shift 1",
    duration: "45 min",
    status: "Closed",
  },
  {
    id: 3,
    date: "2026-02-19",
    department: "Housing",
    machine: "HMC 01",
    type: "Hydraulic",
    reason: "Hydraulic pump failure",
    shift: "Shift 1",
    duration: "75 min",
    status: "Aknoledged",
  },
];
