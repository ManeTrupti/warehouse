import { useState, useMemo } from "react";
import { useTheme } from "@core/theme";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  Cog6ToothIcon,
  CircleStackIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowRightIcon,
  PlayIcon,
  CogIcon,
  ArrowPathIcon,
  ClockIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { CommonButton } from "@shared/components/CommonButton";
import { CommonHeading } from "@shared/components/CommonHeading";
import { DeleteConfirmationDialog } from "@shared/components/DeleteConfirmationDialog";
import RoutingModal from "./RoutingModal.component";
import {
  getProcessRoutingContainerStyles,
  getRoutingCardStyles,
  getRoutingCardHeaderStyles,
  getRoutingCardHeaderLeftStyles,
  getRoutingCardHeaderRightStyles,
  getRoutingCardContentStyles,
  getTimelineBarContainerStyles,
  getTimelineBarStyles,
  getTimelineSegmentStyles,
  getTimelineTotalStyles,
  getOperationsContainerStyles,
  getOperationCardStyles,
  getOperationHeaderStyles,
  getOperationNumberStyles,
  getOperationTitleStyles,
  getOperationStationStyles,
  getOperationDetailsStyles,
  getOperationDetailRowStyles,
  getOperationTotalStyles,
  getArrowConnectorStyles,
  getRoutingActionsStyles,
  getCategoryBadgeStyles,
  getEditIconStyles,
  getDeleteIconStyles,
} from "./ProcessRouting.styled";

// Mock data - matching the images
const initialRoutings = [
  {
    id: 1,
    productCode: "ENG-001",
    productName: "Diesel Engine 250HP",
    category: "Engine",
    steps: [
      {
        id: 1,
        stepNumber: 1,
        name: "Block Machining",
        station: "Block Machining Station",
        processTime: 45,
        setupTime: 15,
        moveTime: 3,
        waitTime: 5,
      },
      {
        id: 2,
        stepNumber: 2,
        name: "Crankshaft Installation",
        station: "Crankshaft Installation",
        processTime: 30,
        setupTime: 10,
        moveTime: 2,
        waitTime: 3,
      },
      {
        id: 3,
        stepNumber: 3,
        name: "Piston Assembly",
        station: "Piston Assembly Station",
        processTime: 25,
        setupTime: 8,
        moveTime: 2,
        waitTime: 2,
      },
      {
        id: 4,
        stepNumber: 4,
        name: "Head Assembly",
        station: "Head Assembly Station",
        processTime: 40,
        setupTime: 12,
        moveTime: 3,
        waitTime: 5,
      },
      {
        id: 5,
        stepNumber: 5,
        name: "Final Inspection",
        station: "Quality Inspection Bay",
        processTime: 20,
        setupTime: 5,
        moveTime: 5,
        waitTime: 0,
      },
    ],
  },
  {
    id: 2,
    productCode: "AXL-001",
    productName: "Front Axle Heavy Duty",
    category: "Axle",
    steps: [
      {
        id: 1,
        stepNumber: 1,
        name: "Axle Housing Prep",
        station: "Housing Prep Station",
        processTime: 35,
        setupTime: 10,
        moveTime: 2,
        waitTime: 3,
      },
      {
        id: 2,
        stepNumber: 2,
        name: "Differential Assembly",
        station: "Differential Station",
        processTime: 45,
        setupTime: 15,
        moveTime: 3,
        waitTime: 5,
      },
      {
        id: 3,
        stepNumber: 3,
        name: "Final Assembly",
        station: "Final Assembly Station",
        processTime: 50,
        setupTime: 12,
        moveTime: 3,
        waitTime: 4,
      },
    ],
  },
];

function ProcessRouting() {
  const theme = useTheme();
  const [routings, setRoutings] = useState(initialRoutings);
  const [expandedRoutings, setExpandedRoutings] = useState(new Set()); // All routings closed by default
  const [isRoutingModalOpen, setIsRoutingModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRouting, setSelectedRouting] = useState(null);

  const toggleRoutingExpansion = (routingId) => {
    setExpandedRoutings((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(routingId)) {
        newSet.delete(routingId);
      } else {
        newSet.add(routingId);
      }
      return newSet;
    });
  };

  const handleCreateRouting = () => {
    setSelectedRouting(null);
    setIsRoutingModalOpen(true);
  };

  const handleEditRouting = (routing) => {
    setSelectedRouting(routing);
    setIsRoutingModalOpen(true);
  };

  const handleDeleteRouting = (routing) => {
    setSelectedRouting(routing);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveRouting = (formData) => {
    if (selectedRouting) {
      // Update existing routing
      setRoutings(
        routings.map((r) =>
          r.id === selectedRouting.id
            ? {
                ...r,
                ...formData,
              }
            : r
        )
      );
    } else {
      // Add new routing
      const newRouting = {
        id: routings.length > 0 ? Math.max(...routings.map((r) => r.id)) + 1 : 1,
        ...formData,
        steps: [],
      };
      setRoutings([...routings, newRouting]);
    }

    setIsRoutingModalOpen(false);
    setSelectedRouting(null);
  };

  const confirmDeleteRouting = () => {
    if (selectedRouting) {
      setRoutings(routings.filter((r) => r.id !== selectedRouting.id));
      setIsDeleteDialogOpen(false);
      setSelectedRouting(null);
    }
  };

  const calculateTotals = (steps) => {
    return steps.reduce(
      (acc, step) => ({
        process: acc.process + step.processTime,
        setup: acc.setup + step.setupTime,
        move: acc.move + step.moveTime,
        wait: acc.wait + step.waitTime,
      }),
      { process: 0, setup: 0, move: 0, wait: 0 }
    );
  };

  const containerStyles = useMemo(
    () => getProcessRoutingContainerStyles(theme),
    [theme]
  );

  return (
    <div style={containerStyles}>
      {/* Title Section */}
      <CommonHeading
        title="Process Routing Visualization"
        subtitle="Visual representation of manufacturing operations and time analysis"
        rightContent={
          <CommonButton variant="primary" icon={PlusIcon} onClick={handleCreateRouting}>
            Add Routing
          </CommonButton>
        }
      />

      {/* Routing Cards */}
      {routings.map((routing) => {
        const isExpanded = expandedRoutings.has(routing.id);
        const CategoryIcon = routing.category === "Engine" ? Cog6ToothIcon : CircleStackIcon;
        const totals = calculateTotals(routing.steps);
        const totalTime = totals.process + totals.setup + totals.move + totals.wait;
        const totalPercentage = totalTime > 0 ? 100 : 0;

        return (
          <div key={routing.id} style={getRoutingCardStyles(theme, isExpanded)}>
            {/* Card Header */}
            <div
              style={getRoutingCardHeaderStyles(theme)}
              onClick={() => toggleRoutingExpansion(routing.id)}
            >
              <div style={getRoutingCardHeaderLeftStyles(theme)}>
                <Cog6ToothIcon
                  style={{
                    width: "1.5rem",
                    height: "1.5rem",
                    color: theme.colors.text.secondary,
                  }}
                />
                <span
                  style={{
                    fontSize: theme.typography.fontSize.base[0],
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.text.primary,
                  }}
                >
                  {routing.productCode}
                </span>
                <span style={getCategoryBadgeStyles(theme, routing.category)}>
                  <CategoryIcon style={{ width: "0.875rem", height: "0.875rem" }} />
                  {routing.category}
                </span>
                <span
                  style={{
                    fontSize: theme.typography.fontSize.base[0],
                    fontWeight: theme.typography.fontWeight.medium,
                    color: theme.colors.text.primary,
                  }}
                >
                  {routing.productName}
                </span>
              </div>
              <div style={getRoutingCardHeaderRightStyles(theme)}>
                <span>
                  {routing.steps.length} steps
                </span>
                <span>
                  {totalTime} min total
                </span>
                {isExpanded ? (
                  <ChevronUpIcon style={{ width: "1.25rem", height: "1.25rem" }} />
                ) : (
                  <ChevronDownIcon style={{ width: "1.25rem", height: "1.25rem" }} />
                )}
              </div>
            </div>

            {/* Card Content (Expanded) */}
            {isExpanded && (
              <div style={getRoutingCardContentStyles(theme)}>
                {/* Timeline Bar */}
                <div style={getTimelineBarContainerStyles(theme)}>
                  <div style={getTimelineBarStyles(theme)}>
                    {totals.process > 0 && (
                      <div
                        style={getTimelineSegmentStyles(
                          theme,
                          theme.colors.gray[600],
                          (totals.process / totalTime) * totalPercentage
                        )}
                      >
                        Process {totals.process}m
                      </div>
                    )}
                    {totals.setup > 0 && (
                      <div
                        style={getTimelineSegmentStyles(
                          theme,
                          theme.colors.warning.DEFAULT,
                          (totals.setup / totalTime) * totalPercentage
                        )}
                      >
                        Setup {totals.setup}m
                      </div>
                    )}
                    {totals.wait > 0 && (
                      <div
                        style={getTimelineSegmentStyles(
                          theme,
                          theme.colors.info.DEFAULT || theme.colors.primary[300],
                          (totals.wait / totalTime) * totalPercentage
                        )}
                      >
                        Wait {totals.wait}m
                      </div>
                    )}
                    {totals.move > 0 && (
                      <div
                        style={getTimelineSegmentStyles(
                          theme,
                          theme.colors.primary[600],
                          (totals.move / totalTime) * totalPercentage
                        )}
                      >
                        Move {totals.move}m
                      </div>
                    )}
                  </div>
                  <div style={getTimelineTotalStyles(theme)}>
                    <span
                      style={{
                        fontSize: theme.typography.fontSize.sm[0],
                        color: theme.colors.text.secondary,
                      }}
                    >
                      {routing.steps.length} steps
                    </span>
                    <span
                      style={{
                        fontSize: theme.typography.fontSize.base[0],
                        fontWeight: theme.typography.fontWeight.semibold,
                        color: theme.colors.text.primary,
                      }}
                    >
                      Total: {totalTime} min
                    </span>
                  </div>
                </div>

                {/* Operations */}
                <div style={getOperationsContainerStyles(theme)}>
                  {routing.steps.map((step, index) => {
                    const stepTotal = step.processTime + step.setupTime + step.moveTime + step.waitTime;
                    return (
                      <div key={step.id} style={{ display: "flex", alignItems: "flex-start" }}>
                        <div style={getOperationCardStyles(theme)}>
                          <div style={getOperationHeaderStyles(theme)}>
                            <div style={getOperationNumberStyles(theme)}>
                              {step.stepNumber}
                            </div>
                            <div style={getOperationTitleStyles(theme)}>{step.name}</div>
                          </div>
                          <div style={getOperationStationStyles(theme)}>
                            Station: {step.station}
                          </div>
                          <div style={getOperationDetailsStyles(theme)}>
                            <div style={getOperationDetailRowStyles(theme)}>
                              <PlayIcon style={{ width: "1rem", height: "1rem" }} />
                              <span>Process: {step.processTime}m</span>
                            </div>
                            <div style={getOperationDetailRowStyles(theme)}>
                              <CogIcon style={{ width: "1rem", height: "1rem" }} />
                              <span>Setup: {step.setupTime}m</span>
                            </div>
                            <div style={getOperationDetailRowStyles(theme)}>
                              <ArrowPathIcon style={{ width: "1rem", height: "1rem" }} />
                              <span>Move: {step.moveTime}m</span>
                            </div>
                            <div style={getOperationDetailRowStyles(theme)}>
                              <ClockIcon style={{ width: "1rem", height: "1rem" }} />
                              <span>Wait: {step.waitTime}m</span>
                            </div>
                          </div>
                          <div style={getOperationTotalStyles(theme)}>
                            Total: {stepTotal} min
                          </div>
                        </div>
                        {index < routing.steps.length - 1 && (
                          <div style={getArrowConnectorStyles(theme)}>
                            <ArrowRightIcon
                              style={{
                                width: "1.5rem",
                                height: "1.5rem",
                                color: theme.colors.primary.DEFAULT,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div style={getRoutingActionsStyles(theme)}>
                  <CommonButton
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditRouting(routing);
                    }}
                  >
                    <PencilIcon style={getEditIconStyles(theme)} />
                    Edit Routing
                  </CommonButton>
                  <CommonButton
                    variant="secondary"
                    icon={ChartBarIcon}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle analyze capacity
                      alert("Analyze Capacity functionality");
                    }}
                  >
                    Analyze Capacity
                  </CommonButton>
                  <CommonButton
                    variant="danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRouting(routing);
                    }}
                  >
                    <TrashIcon style={getDeleteIconStyles(theme)} />
                    Delete
                  </CommonButton>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Routing Modal */}
      <RoutingModal
        isOpen={isRoutingModalOpen}
        onClose={() => {
          setIsRoutingModalOpen(false);
          setSelectedRouting(null);
        }}
        onSave={handleSaveRouting}
        routing={selectedRouting}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedRouting(null);
        }}
        onConfirm={confirmDeleteRouting}
        title="Delete Routing"
        itemName={selectedRouting?.productName}
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
      />
    </div>
  );
}

export default ProcessRouting;

