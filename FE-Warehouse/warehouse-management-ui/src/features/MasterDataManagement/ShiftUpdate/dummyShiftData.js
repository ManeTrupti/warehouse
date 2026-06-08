// src/data/dummyShiftData.js

export const dummyWorkStations = [
  { id: 1, name: "Piston Hard" },
  { id: 2, name: "Housing" },
  { id: 3, name: "Section Shaft" },
  { id: 4, name: "Hydraulic Centering" },
  { id: 5, name: "Worm Nut (WRM)" },
];

export const dummyShifts = [
  { id: 1, label: "Shift 1", time: "06:00 - 14:00" },
  { id: 2, label: "Shift 2", time: "14:00 - 22:00" },
  { id: 3, label: "Shift 3", time: "22:00 - 06:00" },
];

export const dummyChildParts = [
  { id: 1, departmentId: 1, name: "Piston Core A" },
  { id: 2, departmentId: 2, name: "Housing Shell B" },
  { id: 3, departmentId: 3, name: "Shaft Type X" },
  { id: 4, departmentId: 4, name: "Hydraulic Ring Y" },
  { id: 5, departmentId: 5, name: "Worm Gear Z" },
];

export const dummyRejectionReasons = [
  "Dimensional Deviation",
  "Surface Defect",
  "Material Defect",
  "Machining Error",
  "Tool Wear",
  "Operator Error",
  "Other",
];

export const dummyDowntimeCategories = [
  "Machine Breakdown",
  "Tool Change",
  "Material Shortage",
  "Manpower",
  "Quality Issue",
  "Planned Maintenance",
  "Power Failure",
  "Other",
];

export const dummyDowntimeReasons = {
  Manpower: ["Absenteeism", "Training", "Shift Handover"],
  "Machine Breakdown": ["Mechanical Failure", "Electrical Fault"],
  "Material Shortage": ["Supplier Delay", "Inventory Issue"],
  "Power Failure": ["Voltage Fluctuation", "Transformer Issue"],
};

export const dummyProductionEntries = [
  {
    id: 8033,
    workstationId: 1,
    shiftId: 1,
    childPart: "Housing 8033",
    plannedQty: 30,
    producedQty: 88,
    rejectionQty: 1,
    rejectionReason: "Surface Defect",
  },
  {
    id: 8043,
    workstationId: 1,
    shiftId: 1,
    childPart: "Housing 8043",
    plannedQty: 50,
    producedQty: 110,
    rejectionQty: 5,
    rejectionReason: "Machining Error",
  },
  {
    id: 8046,
    workstationId: 2,
    shiftId: 2,
    childPart: "Housing 8046",
    plannedQty: 30,
    producedQty: 98,
    rejectionQty: 0,
  },
];

