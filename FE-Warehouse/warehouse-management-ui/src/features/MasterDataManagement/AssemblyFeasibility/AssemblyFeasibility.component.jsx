import React, { useMemo, useState } from 'react';
import { useTheme } from '@core/theme';
import { CommonHeading } from '@shared/components/CommonHeading';
import { CommonDataGrid } from '@shared/components/CommonDataGrid';
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import assemblyFeasibilityData from './assemblyFeasibilityData.json';
import './AssemblyFeasibility.responsive.css';

function getFeasibilityColor(percent, theme) {
  if (percent >= 90) return theme.colors.success.DEFAULT;
  if (percent >= 60) return theme.colors.warning.DEFAULT;
  return theme.colors.error.DEFAULT;
}

function AssemblyFeasibility() {
  const theme = useTheme();
  const [shift, setShift] = useState('Shift 1');

  const { summary, shifts, models, bottleneckDetails } = assemblyFeasibilityData;

  const kpiCards = useMemo(
    () => [
      {
        label: 'Total Planned',
        value: summary.totalPlanned,
        icon: CalendarDaysIcon,
        color: theme.colors.info.DEFAULT,
        stripColor: theme.colors.accent?.DEFAULT ?? theme.colors.info.DEFAULT,
      },
      {
        label: 'Ready to Assemble',
        value: summary.readyToAssemble,
        icon: CheckCircleIcon,
        color: theme.colors.success.DEFAULT,
        stripColor: theme.colors.success.DEFAULT,
      },
      {
        label: 'Bottlenecks',
        value: summary.bottlenecks,
        icon: ExclamationTriangleIcon,
        color: theme.colors.warning.DEFAULT,
        stripColor: theme.colors.warning.DEFAULT,
      },
      {
        label: 'Overall Feasibility',
        value: `${summary.overallFeasibilityPercent.toFixed(1)}%`,
        icon: ArrowTrendingUpIcon,
        color: getFeasibilityColor(summary.overallFeasibilityPercent, theme),
        stripColor: theme.colors.primary?.DEFAULT ?? theme.colors.info.DEFAULT,
      },
    ],
    [summary, theme],
  );

  const modelColumns = useMemo(
    () => [
      { key: 'model', label: 'Model', sortable: true, minWidth: '5rem' },
      { key: 'planned', label: 'Planned', sortable: true, minWidth: '6rem' },
      { key: 'feasible', label: 'Feasible', sortable: true, minWidth: '6rem' },
      {
        key: 'shortage',
        label: 'Shortage',
        sortable: true,
        minWidth: '6rem',
        render: (val) => (
          <span style={{ color: theme.colors.error.DEFAULT, fontWeight: 500 }}>
            {val}
          </span>
        ),
      },
      {
        key: 'bottleneckPart',
        label: 'Bottleneck',
        sortable: false,
        minWidth: '14rem',
        render: (_, row) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
            <span style={{ fontWeight: theme.typography.fontWeight.medium }}>
              {row.bottleneckPart}
            </span>
            <span
              style={{
                fontSize: theme.typography.fontSize.xs[0],
                color: theme.colors.text.secondary,
              }}
            >
              {row.bottleneckDepartment}
            </span>
          </div>
        ),
      },
      {
        key: 'feasibilityPercent',
        label: 'Feasibility',
        sortable: true,
        minWidth: '10rem',
        render: (val) => {
          const color = getFeasibilityColor(val, theme);
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
              <div
                style={{
                  flex: 1,
                  height: '0.5rem',
                  backgroundColor: theme.colors.gray[200],
                  borderRadius: theme.borderRadius.full,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${val}%`,
                    height: '100%',
                    backgroundColor: color,
                    borderRadius: theme.borderRadius.full,
                  }}
                />
              </div>
              <span
                style={{
                  minWidth: '3rem',
                  textAlign: 'right',
                  fontSize: theme.typography.fontSize.sm[0],
                }}
              >
                {val}%
              </span>
            </div>
          );
        },
      },
    ],
    [theme],
  );

  const rightContent = (
    <div className="assembly-feasibility-header-actions">
      {/* <span
        style={{
          fontSize: theme.typography.fontSize.sm[0],
          color: theme.colors.text.secondary,
        }}
      >
        Auto-updates with every shift/hourly entry
      </span> */}

      {/* <select
        value={shift}
        onChange={(e) => setShift(e.target.value)}
        style={{
          padding: `${theme.spacing.sm} ${theme.spacing.md}`,
          borderRadius: theme.borderRadius.md,
          border: `1px solid ${theme.colors.gray[300]}`,
          fontSize: theme.typography.fontSize.sm[0],
          color: theme.colors.text.primary,
          backgroundColor: theme.colors.background.primary,
          cursor: 'pointer',
        }}
      >
        {shifts.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select> */}

      <span
        style={{
          fontSize: theme.typography.fontSize.sm[0],
          color: theme.colors.text.secondary,
        }}
      >
        Date: 2026-02-19
      </span>
    </div>
  );

  return (
    <div className="assembly-feasibility-page" style={{ paddingBottom: theme.spacing.xl }}>
      <CommonHeading
        title="Assembly Feasibility"
        subtitle="Auto-calculated assembly readiness based on child-part availability"
        rightContent={rightContent}
      />

      {/* KPI Cards */}
      <div className="assembly-feasibility-cards-grid">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              style={{
                position: 'relative',
                backgroundColor: theme.colors.background.primary,
                borderRadius: theme.borderRadius.lg,
                border: `1px solid ${theme.colors.gray[200]}`,
                boxShadow: theme.shadows.sm ?? 'none',
                padding: theme.spacing.xl,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: theme.spacing.lg,
                minHeight: '5rem',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: '4px',
                  backgroundColor: card.stripColor,
                  borderTopLeftRadius: theme.borderRadius.lg,
                  borderBottomLeftRadius: theme.borderRadius.lg,
                }}
              />
              <Icon
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  color: card.color,
                  flexShrink: 0,
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
                <span
                  style={{
                    fontSize: theme.typography.fontSize['2xl'][0],
                    fontWeight: theme.typography.fontWeight.bold,
                    color: theme.colors.text.primary,
                  }}
                >
                  {card.value}
                </span>
                <span
                  style={{
                    fontSize: theme.typography.fontSize.sm[0],
                    fontWeight: theme.typography.fontWeight.normal,
                    color: theme.colors.text.secondary,
                  }}
                >
                  {card.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Model-wise Assembly Feasibility Table */}
      <div className="assembly-feasibility-table-wrap">
        <CommonDataGrid
          title="Model-wise Assembly Feasibility"
          columns={modelColumns}
          data={models}
          actions={
            <span
              style={{
                fontSize: theme.typography.fontSize.xs[0],
                color: theme.colors.text.secondary,
              }}
            >
              Bottleneck models based on child-part shortages
            </span>
          }
        />
      </div>

      {/* Bottleneck Analysis Section */}
      <div className="assembly-feasibility-bottleneck-section">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.sm,
            backgroundColor: theme.colors.warning.DEFAULT,
            color: theme.colors.gray[900],
            padding: `${theme.spacing.sm} ${theme.spacing.md}`,
            borderRadius: theme.borderRadius.md,
            fontSize: theme.typography.fontSize.sm[0],
            fontWeight: theme.typography.fontWeight.medium,
            marginBottom: theme.spacing.md,
          }}
        >
          <ExclamationTriangleIcon
            style={{
              width: '1.25rem',
              height: '1.25rem',
              flexShrink: 0,
              color: theme.colors.gray[900],
            }}
          />
          Bottleneck Analysis - Missing Parts Detail
        </div>

        <div
          style={{
            border: `1px solid ${theme.colors.gray[300]}`,
            borderRadius: theme.borderRadius.lg,
            backgroundColor: theme.colors.background.primary,
            padding: theme.spacing.lg,
          }}
        >
        <div className="assembly-feasibility-bottleneck-cards">
          {bottleneckDetails.map((model) => (
            <div
              key={model.model}
              style={{
                backgroundColor: theme.colors.background.primary,
                borderRadius: theme.borderRadius.lg,
                  border: '1px solid #FFD95A',
                boxShadow: theme.shadows.card ?? theme.shadows.md,
                padding: theme.spacing.lg,
                display: 'flex',
                flexDirection: 'column',
                gap: theme.spacing.sm,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: theme.spacing.sm,
                }}
              >
                <span
                  style={{
                    fontSize: theme.typography.fontSize.lg[0],
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.text.primary,
                  }}
                >
                  {model.model}
                </span>
                <span
                  style={{
                    fontSize: theme.typography.fontSize.xs[0],
                    fontWeight: theme.typography.fontWeight.medium,
                    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                    borderRadius: theme.borderRadius.full,
                    backgroundColor: theme.colors.error.light,
                    color: theme.colors.error.DEFAULT,
                  }}
                >
                  -{model.totalShortUnits} units
                </span>
              </div>

              {model.parts.map((part) => (
                <div
                  key={part.part}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: `${theme.spacing.sm} 0`,
                    borderTop: `1px solid ${theme.colors.gray[200]}`,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: theme.spacing.xs,
                      }}
                    >
                      <span
                        style={{
                          fontSize: theme.typography.fontSize.sm[0],
                          fontWeight: theme.typography.fontWeight.medium,
                          color: theme.colors.text.primary,
                        }}
                      >
                        {part.part}
                      </span>
                      <span
                        style={{
                          fontSize: theme.typography.fontSize.xs[0],
                          color: theme.colors.text.secondary,
                        }}
                      >
                        {part.department}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: theme.spacing.xs,
                      }}
                    >
                      <span
                        style={{
                          fontSize: theme.typography.fontSize.sm[0],
                          fontWeight: theme.typography.fontWeight.medium,
                        }}
                      >
                        {part.feasible}{' '}
                        <span
                          style={{
                            color: theme.colors.text.secondary,
                            fontWeight: theme.typography.fontWeight.normal,
                          }}
                        >
                          / {part.planned}
                        </span>
                      </span>
                      <span
                        style={{
                          fontSize: theme.typography.fontSize.xs[0],
                          color: theme.colors.error.DEFAULT,
                        }}
                      >
                        {part.short} short
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssemblyFeasibility;

