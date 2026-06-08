import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTheme } from '@core/theme';
import { CommonHeading } from '@shared/components/CommonHeading';
import { CommonDataGrid } from '@shared/components/CommonDataGrid';
import CommonLoader from '@shared/components/CommonLoader';
import { buildWebSocketUrl } from '../../../services/apiService';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';
import './ChildPartReadiness.responsive.css';

const STATUS_ICONS = {
  complete: CheckCircleIcon,
  on_track: CheckCircleIcon,
  at_risk: ExclamationTriangleIcon,
  behind: XCircleIcon,
};

function getStatusColor(status, theme) {
  switch (status) {
    case 'complete':
    case 'on_track':
      return theme.colors.success.DEFAULT;
    case 'at_risk':
      return theme.colors.warning.DEFAULT;
    case 'behind':
      return theme.colors.error.DEFAULT;
    default:
      return theme.colors.gray[500];
  }
}

function getProgressColor(progress, theme) {
  if (progress >= 90) return theme.colors.success.DEFAULT;
  if (progress >= 60) return theme.colors.warning.DEFAULT;
  return theme.colors.error.DEFAULT;
}

function getNumericColor(value, planned, theme) {
  if (planned <= 0) return theme.colors.text.primary;
  const pct = (value / planned) * 100;
  if (pct >= 90) return theme.colors.success.DEFAULT;
  if (pct >= 60) return theme.colors.warning.DEFAULT;
  return theme.colors.error.DEFAULT;
}

function ChildPartReadiness() {
  const theme = useTheme();
  const { workstationId, resourceId } = useParams();
  const [department, setDepartment] = useState('All Workstations');
  const [summary, setSummary] = useState(null);
  const [departments, setDepartments] = useState(['All Workstations']);
  const [rows, setRows] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Build tenant-aware websocket URL using shared helper (respects config.apiUrl and tenant prefixing)
    const wsUrl = buildWebSocketUrl('/ws/child-part-readiness/');

    if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
      console.log('Child-part readiness websocket URL:', wsUrl);
    }

    let isMounted = true;
    const socket = new WebSocket(wsUrl);

    setConnectionStatus('connecting');
    setError(null);

    socket.onopen = () => {
      if (!isMounted) return;
      setConnectionStatus('open');

      // Send initial filters so backend starts streaming data
      try {
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10);
        const parsedWorkstationId = workstationId ? Number(workstationId) : undefined;
        const parsedResourceId = resourceId ? Number(resourceId) : undefined;
        socket.send(
          JSON.stringify({
            action: 'update_filters',
            filters: {
              date: dateStr,
              resource_id: parsedResourceId,
              workstation_id: parsedWorkstationId,
            },
          }),
        );
      } catch (e) {
        if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
          console.error('Failed to send initial child-part readiness filters', e);
        }
      }
    };

    socket.onmessage = (event) => {
      if (!isMounted) return;
      try {
        const raw = JSON.parse(event.data);

        if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
          console.log('Child-part readiness websocket raw message:', raw);
        }

        // Map backend payload into UI summary shape
        const mappedSummary = {
          totalParts: raw.total ?? (Array.isArray(raw.data) ? raw.data.length : 0),
          complete: raw.complete ?? 0,
          onTrack: raw.on_track ?? 0,
          atRisk: raw.at_risk ?? 0,
          behind: raw.behind ?? 0,
        };

        const normalizeStatus = (status) => {
          const s = (status || '').toString().toLowerCase();
          if (s === 'complete') return 'complete';
          if (s === 'on_track' || s === 'on track') return 'on_track';
          if (s === 'at_risk' || s === 'at risk') return 'at_risk';
          if (s === 'behind') return 'behind';
          return 'behind';
        };

        const mappedRows = Array.isArray(raw.data)
          ? raw.data.map((item, index) => {
              const percentage = typeof item.percentage === 'number' ? item.percentage : 0;
              const clampedProgress = Math.max(0, Math.min(100, Math.round(percentage)));

              return {
                id: item.product_id ?? String(index + 1),
                status: normalizeStatus(item.status),
                department: item.workstation_name || item.category_name || '',
                childPart: item.product_name || '',
                forModels: item.product_code || '',
                planned: item.planned_qty ?? 0,
                produced: item.produced_qty ?? 0,
                pending: item.pending_qty ?? 0,
                rejected: item.rejected_qty ?? 0,
                percentage,
                categoryName: item.category_name || '',
                categoryCode: item.category_code || '',
                workstationName: item.workstation_name || '',
                workstationCode: item.workstation_code || '',
                progress: clampedProgress,
              };
            })
          : [];

        setSummary(mappedSummary);
        setDepartments(['All Workstations', ...new Set(mappedRows.map((r) => r.department).filter(Boolean))]);
        setRows(mappedRows);
        setError(null);
      } catch (e) {
        console.error('Failed to parse child-part readiness message', e);
        setError('Invalid data received from server');
      }
    };

    socket.onerror = (event) => {
      console.error('Child-part readiness websocket error', event);
      if (!isMounted) return;
      setConnectionStatus('error');
      setError('Unable to connect to live data feed');
    };

    socket.onclose = () => {
      if (!isMounted) return;
      setConnectionStatus('closed');
    };

    return () => {
      isMounted = false;
      socket.close();
    };
  }, []);

  const safeSummary = summary ?? {
    totalParts: 0,
    complete: 0,
    onTrack: 0,
    atRisk: 0,
    behind: 0,
  };

  const filteredRows = useMemo(() => {
    if (department === 'All Workstations') return rows;
    return rows.filter((r) => r.department === department);
  }, [department, rows]);

  const kpiCards = useMemo(
    () => [
      {
        label: 'Total Parts',
        value: safeSummary.totalParts,
        icon: CubeIcon,
        color: theme.colors.gray[600],
        stripColor: theme.colors.primary?.DEFAULT ?? theme.colors.info.DEFAULT,
      },
      {
        label: 'Complete',
        value: safeSummary.complete,
        icon: CheckCircleIcon,
        color: theme.colors.success.DEFAULT,
        stripColor: theme.colors.success.DEFAULT,
      },
      {
        label: 'On Track',
        value: safeSummary.onTrack,
        icon: CheckCircleIcon,
        color: theme.colors.success.DEFAULT,
        stripColor: theme.colors.success.DEFAULT,
      },
      {
        label: 'At Risk',
        value: safeSummary.atRisk,
        icon: ExclamationTriangleIcon,
        color: theme.colors.warning.DEFAULT,
        stripColor: theme.colors.warning.DEFAULT,
      },
      {
        label: 'Behind',
        value: safeSummary.behind,
        icon: XCircleIcon,
        color: theme.colors.error.DEFAULT,
        stripColor: theme.colors.error.DEFAULT,
      },
    ],
    [safeSummary, theme],
  );

  const columns = useMemo(
    () => [
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        minWidth: '6rem',
        render: (_, row) => {
          const Icon = STATUS_ICONS[row.status] || CubeIcon;
          const color = getStatusColor(row.status, theme);
          return (
            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
              <Icon style={{ width: '1.25rem', height: '1.25rem', color }} />
            </span>
          );
        },
      },
      {
        key: 'department',
        label: 'Workstation Name',
        sortable: true,
        minWidth: '12rem',
      },
      { key: 'childPart', label: 'Product Name', sortable: true, minWidth: '10rem' },
      { key: 'forModels', label: 'Product Code', sortable: true, minWidth: '8rem' },
      {
        key: 'categoryName',
        label: 'Category Name',
        sortable: true,
        minWidth: '10rem',
      },
      // {
      //   key: 'categoryCode',
      //   label: 'Category Code',
      //   sortable: true,
      //   minWidth: '8rem',
      // },
      // {
      //   key: 'workstationName',
      //   label: 'Workstation Name',
      //   sortable: true,
      //   minWidth: '10rem',
      // },
      {
        key: 'workstationCode',
        label: 'Workstation Code',
        sortable: true,
        minWidth: '8rem',
      },
      { key: 'planned', label: 'Planned Qty', sortable: true, minWidth: '6rem' },
      {
        key: 'produced',
        label: 'Produced Qty',
        sortable: true,
        minWidth: '6rem',
        render: (val, row) => (
          <span style={{ color: getNumericColor(val, row.planned, theme), fontWeight: 500 }}>
            {val}
          </span>
        ),
      },
      {
        key: 'pending',
        label: 'Pending Qty',
        sortable: true,
        minWidth: '6rem',
        render: (val, row) => (
          <span
            style={{
              color:
                row.progress >= 90
                  ? theme.colors.text.primary
                  : getNumericColor(row.produced, row.planned, theme),
              fontWeight: 500,
            }}
          >
            {val}
          </span>
        ),
      },
      {
        key: 'rejected',
        label: 'Rejected Qty',
        sortable: true,
        minWidth: '6rem',
      },
      {
        key: 'progress',
        label: 'Completion %',
        sortable: true,
        minWidth: '8rem',
        render: (val, row) => {
          const color = getProgressColor(val, theme);
          const barWidth = Math.max(0, Math.min(100, val));
          const displayPct =
            typeof row.percentage === 'number'
              ? Math.round(row.percentage)
              : val;
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
                    width: `${barWidth}%`,
                    height: '100%',
                    backgroundColor: color,
                    borderRadius: theme.borderRadius.full,
                  }}
                />
              </div>
              <span style={{ minWidth: '2.5rem', fontSize: theme.typography.fontSize.sm[0] }}>
                {displayPct}%
              </span>
            </div>
          );
        },
      },
    ],
    [theme],
  );

  const filterBar = (
    <div
      className="child-part-filter-bar"
      style={{
        paddingLeft: theme.spacing.lg,
        paddingRight: theme.spacing.lg,
        paddingTop: theme.spacing.md,
        paddingBottom: 0,
        backgroundColor: '#f5f5f5',
      }}
    >
      <select
        value={department}
        onChange={(e) => setDepartment(e.target.value)}
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
        {departments.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
      <span
        style={{
          fontSize: theme.typography.fontSize.sm[0],
          color: theme.colors.text.secondary,
        }}
      >
        Date: {new Date().toISOString().slice(0, 10)}
      </span>
    </div>
  );

  return (
    <div className="child-part-readiness-page" style={{ paddingBottom: theme.spacing.xl }}>
      <CommonHeading
        title="Child-Part Readiness"
        subtitle="Live view of child-part production vs requirements"
      />
      {filterBar}

      <div className="child-part-cards-grid">
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

      <div className="child-part-table-wrap">
        {connectionStatus === 'connecting' && rows.length === 0 ? (
          <div
            style={{
              padding: theme.spacing.xl,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '12rem',
              backgroundColor: theme.colors.background.primary,
              borderRadius: theme.borderRadius.lg,
              boxShadow: theme.shadows.md,
            }}
          >
            <CommonLoader message="Connecting to live data..." size="md" />
          </div>
        ) : (
          <CommonDataGrid
            title="Live Child-Part Readiness Board"
            columns={columns}
            data={filteredRows}
            showSearch={false}
            actions={
              <span
                style={{
                  fontSize: theme.typography.fontSize.xs[0],
                  color: theme.colors.text.secondary,
                }}
              >
                {connectionStatus === 'open' && 'Live data via WebSocket'}
                {connectionStatus === 'connecting' && 'Connecting to live data...'}
                {connectionStatus === 'error' && (error || 'Error connecting to live data')}
                {connectionStatus === 'closed' && 'Connection closed'}
              </span>
            }
          />
        )}
      </div>
    </div>
  );
}

export default ChildPartReadiness;
