import React, { useState, useEffect } from 'react';
import { CommonModal } from '@shared/components/CommonModal';
import { CommonButton } from '@shared/components/CommonButton';
import { CHART_TYPES } from '../utils/chartConfigMapper';
import { apiService } from '../../../../services/apiService';

const FORMULA_VARIABLES_HELP =
  'Available: actual/plan, rejection/total, downtime_minutes, incident_count, avg_breakdown_closure_minutes';

const UNIT_OPTIONS = [
  { value: '%', label: '%' },
  { value: 'count', label: 'Count' },
  { value: 'minutes', label: 'Minutes' },
  { value: 'units', label: 'Units' },
];

const DEPARTMENT_OPTIONS = [
  { value: '', label: 'All Departments' },
  { value: 'production', label: 'Production' },
  { value: 'quality', label: 'Quality' },
  { value: 'maintenance', label: 'Maintenance' },
];

const CHART_TYPE_OPTIONS = [
  { value: CHART_TYPES.BAR, label: 'Bar Chart' },
  { value: CHART_TYPES.COMBO, label: 'Combo (Bar + Line)' },
  { value: CHART_TYPES.PIE, label: 'Pie Chart' },
  { value: CHART_TYPES.DONUT, label: 'Donut Chart' },
  { value: CHART_TYPES.RADAR, label: 'Radar Chart' },
];

const LEGEND_POSITION_OPTIONS = [
  { value: 'top', label: 'Top' },
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
];

const parseVariablesFromExpression = (expression) => {
  if (!expression || typeof expression !== 'string') return [];
  const rawMatches = expression.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || [];
  const reserved = new Set([
    'if',
    'then',
    'else',
    'and',
    'or',
    'not',
    'true',
    'false',
    'null',
  ]);

  const vars = [];
  for (const token of rawMatches) {
    const lower = token.toLowerCase();
    if (reserved.has(lower)) continue;
    if (!vars.includes(token)) {
      vars.push(token);
    }
  }
  return vars;
};

const defaultForm = {
  name: '',
  formula: '',
  unit: '%',
  greenThreshold: '95',
  yellowThreshold: '85',
  department: '',
  chartType: CHART_TYPES.BAR,
  dataKey: 'value',
  categoryKey: 'label',
  showGridLines: true,
  showLegend: true,
  showActualOnGraph: true,
  showTargetOnGraph: false,
  xAxisLabel: '',
  yAxisLabel: '',
  primaryColor: '#0ea5e9',
  secondaryColor: '#6366f1',
  segmentColors: '#0ea5e9,#6366f1,#22c55e',
  legendPosition: 'bottom',
  fieldMappings: [],
};

const kpiToForm = (kpi) => {
  if (!kpi) return defaultForm;
  const c = kpi.colors || {};
  const bars = c.bars || [];
  return {
    name: kpi.name || '',
    formula: kpi.calculation?.expression || kpi.description || '',
    unit: kpi.unit || '%',
    greenThreshold: kpi.thresholds?.greenThreshold != null ? String(kpi.thresholds.greenThreshold) : '95',
    yellowThreshold: kpi.thresholds?.yellowThreshold != null ? String(kpi.thresholds.yellowThreshold) : '85',
    department: kpi.department || '',
    chartType: kpi.chartType || CHART_TYPES.BAR,
    dataKey: kpi.dataKey || 'value',
    categoryKey: kpi.categoryKey || 'label',
    showGridLines: kpi.showGridLines !== false,
    showLegend: kpi.showLegend !== false,
    showActualOnGraph: kpi.showActualOnGraph !== false,
    showTargetOnGraph: kpi.showTargetOnGraph === true,
    xAxisLabel: kpi.xAxisLabel || '',
    yAxisLabel: kpi.yAxisLabel || '',
    primaryColor: bars[0] || '#0ea5e9',
    secondaryColor: bars[1] || c.line || '#6366f1',
    segmentColors: (c.segments && c.segments.length) ? c.segments.join(',') : '#0ea5e9,#6366f1,#22c55e',
    legendPosition: kpi.legendPosition || 'bottom',
    fieldMappings: Array.isArray(kpi.fieldMappings) ? kpi.fieldMappings : [],
  };
};

const AddKpiModal = ({ isOpen, onClose, onSubmit, editKpi, onUpdate }) => {
  const [form, setForm] = useState(defaultForm);
  const [touched, setTouched] = useState({});
  const isEditMode = !!editKpi;
  const [dbConnections, setDbConnections] = useState([]);
  const [selectedConnection, setSelectedConnection] = useState('');
  const [dbMetadata, setDbMetadata] = useState(null);
  const [dbLoading, setDbLoading] = useState(false);
  const [dbError, setDbError] = useState(null);
  const [connectionMode, setConnectionMode] = useState('preconfigured'); // 'preconfigured' | 'manual'
  const [manualConnection, setManualConnection] = useState({
    host: '',
    port: '',
    database: '',
    user: '',
    password: '',
  });

  const formulaVariables = parseVariablesFromExpression(form.formula);

  useEffect(() => {
    if (isOpen && editKpi) {
      setForm(kpiToForm(editKpi));
    } else if (isOpen && !editKpi) {
      setForm(defaultForm);
    }
  }, [isOpen, editKpi]);

  useEffect(() => {
    if (!isOpen) return;
    if (dbConnections.length > 0) return;

    let cancelled = false;
    setDbLoading(true);
    setDbError(null);

    apiService
      .get('/api/kpi-dashboard/db-connections')
      .then((response) => {
        if (cancelled) return;
        const raw = response.data;
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
            ? raw.data
            : [];
        setDbConnections(list);
        if (!selectedConnection && list.length > 0) {
          const first = list[0];
          const firstId = first.id ?? first.key ?? first.name;
          if (firstId) {
            setSelectedConnection(firstId);
          }
        }
      })
      .catch((error) => {
        if (cancelled) return;
        // Silently capture error but show small hint in UI
        setDbError(
          error?.response?.data?.message ||
            error?.message ||
            'Failed to load database connections',
        );
      })
      .finally(() => {
        if (!cancelled) {
          setDbLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, dbConnections.length, selectedConnection]);

  useEffect(() => {
    if (!isOpen) return;
    const usePreconfigured =
      connectionMode === 'preconfigured' && !!selectedConnection;
    const hasManualDetails =
      connectionMode === 'manual' &&
      manualConnection.host &&
      manualConnection.database;

    if (!usePreconfigured && !hasManualDetails) return;

    let cancelled = false;
    setDbLoading(true);
    setDbError(null);

    const request = usePreconfigured
      ? apiService.get('/api/kpi-dashboard/db-metadata', {
          params: { connection: selectedConnection },
        })
      : apiService.post('/api/kpi-dashboard/db-metadata/manual', {
          host: manualConnection.host,
          port: manualConnection.port,
          database: manualConnection.database,
          user: manualConnection.user,
          password: manualConnection.password,
        });

    request
      .then((response) => {
        if (cancelled) return;
        const raw = response.data || {};
        const tables =
          raw.tables ||
          (raw.data && raw.data.tables) ||
          [];
        const schemas =
          raw.schemas ||
          (raw.data && raw.data.schemas) ||
          [];
        setDbMetadata({
          tables: Array.isArray(tables) ? tables : [],
          schemas: Array.isArray(schemas) ? schemas : [],
        });
      })
      .catch((error) => {
        if (cancelled) return;
        setDbError(
          error?.response?.data?.message ||
            error?.message ||
            'Failed to load database metadata',
        );
        setDbMetadata(null);
      })
      .finally(() => {
        if (!cancelled) {
          setDbLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, connectionMode, selectedConnection, manualConnection]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const next = type === 'checkbox' ? e.target.checked : value;
    setForm((prev) => ({ ...prev, [name]: next }));
  };

  const handleFieldMappingChange = (index, key, value) => {
    setForm((prev) => {
      const next = Array.isArray(prev.fieldMappings)
        ? [...prev.fieldMappings]
        : [];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, fieldMappings: next };
    });
  };

  const handleAddFieldMapping = () => {
    setForm((prev) => ({
      ...prev,
      fieldMappings: [
        ...(Array.isArray(prev.fieldMappings) ? prev.fieldMappings : []),
        { table: '', column: '', variable: '' },
      ],
    }));
  };

  const handleRemoveFieldMapping = (index) => {
    setForm((prev) => {
      const next = Array.isArray(prev.fieldMappings)
        ? [...prev.fieldMappings]
        : [];
      next.splice(index, 1);
      return { ...prev, fieldMappings: next };
    });
  };

  const handleAutoMapFromMetadata = () => {
    if (!dbMetadata || !Array.isArray(dbMetadata.tables)) return;
    const variables = parseVariablesFromExpression(form.formula);
    if (!variables.length) return;

    const mappings = [];

    variables.forEach((variable) => {
      const varLower = variable.toLowerCase();
      for (const table of dbMetadata.tables) {
        const tableName = table.name || table.table || table.id;
        const cols = Array.isArray(table.columns)
          ? table.columns
          : Array.isArray(table.fields)
            ? table.fields
            : [];
        const match = cols.find(
          (col) => String(col).toLowerCase() === varLower,
        );
        if (tableName && match) {
          mappings.push({
            table: tableName,
            column: match,
            variable,
          });
          break;
        }
      }
    });

    if (mappings.length > 0) {
      setForm((prev) => ({
        ...prev,
        fieldMappings: mappings,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ name: true, formula: true });

    const nameValid = form.name.trim();
    const formulaValid = form.formula.trim();
    if (!nameValid || !formulaValid) return;

    const primary = form.primaryColor?.trim() || '#0ea5e9';
    const secondary = form.secondaryColor?.trim() || '#6366f1';
    const segments = form.segmentColors
      ? form.segmentColors.split(',').map((c) => c.trim()).filter(Boolean)
      : [primary, secondary, '#22c55e'];

    const kpiId = isEditMode ? editKpi.id : form.name.toLowerCase().replace(/\s+/g, '-');
    const kpiConfig = {
      id: kpiId,
      name: form.name.trim(),
      description: form.formula.trim(),
      dataSource: '/api/kpis/orders',
      calculation: {
        type: 'EXPRESSION',
        expression: form.formula.trim(),
      },
      chartType: form.chartType,
      dataKey: form.dataKey?.trim() || 'value',
      categoryKey: form.categoryKey?.trim() || 'label',
      showGridLines: form.showGridLines,
      showLegend: form.showLegend,
      showActualOnGraph: form.showActualOnGraph,
      showTargetOnGraph: form.showTargetOnGraph,
      xAxisLabel: form.xAxisLabel?.trim() || undefined,
      yAxisLabel: form.yAxisLabel?.trim() || undefined,
      legendPosition: form.legendPosition || 'bottom',
      colors: {
        bars: [primary, secondary],
        line: secondary,
        fill: `${primary}33`,
        segments,
      },
      unit: form.unit,
      thresholds: {
        greenThreshold: form.greenThreshold ? Number(form.greenThreshold) : undefined,
        yellowThreshold: form.yellowThreshold ? Number(form.yellowThreshold) : undefined,
      },
      department: form.department || undefined,
      fieldMappings: Array.isArray(form.fieldMappings)
        ? form.fieldMappings.filter(
            (m) =>
              (m.table && m.table.trim()) &&
              (m.column && m.column.trim()) &&
              (m.variable && m.variable.trim()),
          )
        : undefined,
    };

    if (isEditMode) {
      onUpdate?.(kpiConfig);
    } else {
      onSubmit?.(kpiConfig);
    }
    setForm(defaultForm);
    setTouched({});
    onClose();
  };

  const handleClose = () => {
    setForm(defaultForm);
    setTouched({});
    onClose();
  };

  const nameError = touched.name && !form.name.trim();
  const formulaError = touched.formula && !form.formula.trim();
  const isInvalid = !form.name.trim() || !form.formula.trim();

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? 'Edit KPI' : 'Add New KPI'}
      size="md"
      showCloseButton
      closeOnBackdropClick
      footer={
        <div className="flex justify-end gap-2">
          <CommonButton variant="secondary" size="sm" onClick={handleClose}>
            Cancel
          </CommonButton>
          <CommonButton
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={isInvalid}
          >
            {isEditMode ? 'Update KPI' : 'Add KPI'}
          </CommonButton>
        </div>
      }
    >
      <form id="add-kpi-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            KPI Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            onBlur={() => setTouched((p) => ({ ...p, name: true }))}
            placeholder="e.g., Production Efficiency"
            className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 ${
              nameError ? 'border-red-300' : 'border-slate-200'
            }`}
          />
          {nameError && (
            <p className="text-xs text-red-500">KPI Name is required.</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Formula <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="formula"
            value={form.formula}
            onChange={handleChange}
            onBlur={() => setTouched((p) => ({ ...p, formula: true }))}
            placeholder="e.g., (actual / plan) * 100"
            className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 ${
              formulaError ? 'border-red-300' : 'border-slate-200'
            }`}
          />
          <p className="text-xs text-slate-500">{FORMULA_VARIABLES_HELP}</p>
          {formulaError && (
            <p className="text-xs text-red-500">Formula is required.</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Unit</label>
          <select
            name="unit"
            value={form.unit}
            onChange={handleChange}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {UNIT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Green Threshold</label>
            <input
              type="text"
              name="greenThreshold"
              value={form.greenThreshold}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Yellow Threshold</label>
            <input
              type="text"
              name="yellowThreshold"
              value={form.yellowThreshold}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Department</label>
          <select
            name="department"
            value={form.department}
            onChange={handleChange}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {DEPARTMENT_OPTIONS.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="border-t border-slate-200 pt-4 mt-4 space-y-4">
          <h4 className="text-sm font-semibold text-slate-800">Graph / Chart</h4>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Graph Type</label>
            <select
              name="chartType"
              value={form.chartType}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {CHART_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Graph Display Field (value)</label>
              <input
                type="text"
                name="dataKey"
                value={form.dataKey}
                onChange={handleChange}
                placeholder="value"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Graph Display Field (category)</label>
              <input
                type="text"
                name="categoryKey"
                value={form.categoryKey}
                onChange={handleChange}
                placeholder="label"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="showGridLines"
                checked={form.showGridLines}
                onChange={handleChange}
                className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <span className="text-sm text-slate-700">Show Grid Lines</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="showLegend"
                checked={form.showLegend}
                onChange={handleChange}
                className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <span className="text-sm text-slate-700">Show Legend</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="showActualOnGraph"
                checked={form.showActualOnGraph}
                onChange={handleChange}
                className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <span className="text-sm text-slate-700">Actual Values</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="showTargetOnGraph"
                checked={form.showTargetOnGraph}
                onChange={handleChange}
                className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <span className="text-sm text-slate-700">Target Values</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">X Axis Label</label>
              <input
                type="text"
                name="xAxisLabel"
                value={form.xAxisLabel}
                onChange={handleChange}
                placeholder="e.g. Month"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Y Axis Label</label>
              <input
                type="text"
                name="yAxisLabel"
                value={form.yAxisLabel}
                onChange={handleChange}
                placeholder="e.g. Value"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Primary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.primaryColor}
                  onChange={(e) => setForm((prev) => ({ ...prev, primaryColor: e.target.value }))}
                  className="h-9 w-14 rounded border border-slate-200 cursor-pointer"
                />
                <input
                  type="text"
                  name="primaryColor"
                  value={form.primaryColor}
                  onChange={handleChange}
                  className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <p className="text-xs text-slate-500">Bar fill, radar fill</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Secondary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.secondaryColor}
                  onChange={(e) => setForm((prev) => ({ ...prev, secondaryColor: e.target.value }))}
                  className="h-9 w-14 rounded border border-slate-200 cursor-pointer"
                />
                <input
                  type="text"
                  name="secondaryColor"
                  value={form.secondaryColor}
                  onChange={handleChange}
                  className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <p className="text-xs text-slate-500">Line, second bar</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Legend Position</label>
              <select
                name="legendPosition"
                value={form.legendPosition}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {LEGEND_POSITION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Pie/Donut segment colors (comma-separated)</label>
            <input
              type="text"
              name="segmentColors"
              value={form.segmentColors}
              onChange={handleChange}
              placeholder="#0ea5e9,#6366f1,#22c55e"
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4 mt-4 space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h4 className="text-sm font-semibold text-slate-800">
              Data source mapping (database fields)
            </h4>
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-[11px] font-medium text-slate-600">
                Connection mode
              </label>
              <select
                value={connectionMode}
                onChange={(e) => setConnectionMode(e.target.value)}
                className="rounded-md border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="preconfigured">Preconfigured</option>
                <option value="manual">Manual</option>
              </select>

              {connectionMode === 'preconfigured' && dbConnections.length > 0 && (
                <>
                  <label className="text-[11px] font-medium text-slate-600">
                    DB connection
                  </label>
                  <select
                    value={selectedConnection}
                    onChange={(e) => setSelectedConnection(e.target.value)}
                    className="rounded-md border border-slate-200 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {dbConnections.map((conn) => {
                      const id = conn.id ?? conn.key ?? conn.name;
                      const label = conn.name ?? conn.label ?? id;
                      if (!id) return null;
                      return (
                        <option key={id} value={id}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </>
              )}
              <button
                type="button"
                onClick={handleAddFieldMapping}
                className="inline-flex items-center rounded-md border border-sky-500 px-2.5 py-1 text-xs font-medium text-sky-600 hover:bg-sky-50"
              >
                Add mapping
              </button>
              <button
                type="button"
                onClick={handleAutoMapFromMetadata}
                disabled={!dbMetadata || !form.formula.trim()}
                className="inline-flex items-center rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Auto map from columns
              </button>
            </div>
          </div>
        
         
          {connectionMode === 'manual' && (
            <div className="mt-2 grid grid-cols-1 gap-2 rounded-md border border-dashed border-slate-300 p-3 text-xs sm:grid-cols-[1.2fr,0.7fr,1fr,1fr,1fr]">
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-600">
                  Host
                </label>
                <input
                  type="text"
                  value={manualConnection.host}
                  onChange={(e) =>
                    setManualConnection((prev) => ({
                      ...prev,
                      host: e.target.value,
                    }))
                  }
                  placeholder="e.g. db.mycompany.com"
                  className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-600">
                  Port
                </label>
                <input
                  type="text"
                  value={manualConnection.port}
                  onChange={(e) =>
                    setManualConnection((prev) => ({
                      ...prev,
                      port: e.target.value,
                    }))
                  }
                  placeholder="e.g. 5432"
                  className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-600">
                  Database
                </label>
                <input
                  type="text"
                  value={manualConnection.database}
                  onChange={(e) =>
                    setManualConnection((prev) => ({
                      ...prev,
                      database: e.target.value,
                    }))
                  }
                  placeholder="e.g. production_db"
                  className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-600">
                  User
                </label>
                <input
                  type="text"
                  value={manualConnection.user}
                  onChange={(e) =>
                    setManualConnection((prev) => ({
                      ...prev,
                      user: e.target.value,
                    }))
                  }
                  placeholder="db user"
                  className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-600">
                  Password
                </label>
                <input
                  type="password"
                  value={manualConnection.password}
                  onChange={(e) =>
                    setManualConnection((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  placeholder="db password"
                  className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          )}
          {dbLoading && (
            <p className="text-xs text-slate-500">
              Loading database metadata...
            </p>
          )}
          {dbError && (
            <p className="text-xs text-red-500">
              {dbError}
            </p>
          )}

          {Array.isArray(form.fieldMappings) && form.fieldMappings.length > 0 && (
            <div className="space-y-2">
              {form.fieldMappings.map((mapping, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 gap-2 rounded-md border border-slate-200 p-3 text-xs sm:grid-cols-[0.9fr,1.1fr,1.1fr,1fr,auto]"
                >
                  <div className="space-y-1">
                    <label className="block text-[11px] font-medium text-slate-600">
                      Schema
                    </label>
                    {dbMetadata && Array.isArray(dbMetadata.schemas) && dbMetadata.schemas.length > 0 ? (
                      <select
                        value={mapping.schema || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          // changing schema should reset table & column selections
                          handleFieldMappingChange(index, 'schema', value);
                          if (mapping.table) {
                            handleFieldMappingChange(index, 'table', '');
                          }
                          if (mapping.column) {
                            handleFieldMappingChange(index, 'column', '');
                          }
                        }}
                        className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="">Select schema</option>
                        {dbMetadata.schemas.map((schema) => (
                          <option key={schema} value={schema}>
                            {schema}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={mapping.schema || ''}
                        onChange={(e) =>
                          handleFieldMappingChange(index, 'schema', e.target.value)
                        }
                        placeholder="e.g. public"
                        className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-medium text-slate-600">
                      Table name
                    </label>
                    {dbMetadata && Array.isArray(dbMetadata.tables) && dbMetadata.tables.length > 0 ? (
                      <select
                        value={mapping.table || ''}
                        onChange={(e) =>
                          handleFieldMappingChange(index, 'table', e.target.value)
                        }
                        className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="">Select table</option>
                        {dbMetadata.tables
                          .filter((tbl) => {
                            const schema = tbl.schema || tbl.table_schema;
                            if (!mapping.schema) return true;
                            return schema === mapping.schema;
                          })
                          .map((tbl) => {
                            const schema = tbl.schema || tbl.table_schema;
                            const name = tbl.name || tbl.table || tbl.id;
                            if (!name) return null;
                            const label = schema ? `${schema}.${name}` : name;
                            return (
                              <option key={label} value={name}>
                                {label}
                              </option>
                            );
                          })}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={mapping.table || ''}
                        onChange={(e) =>
                          handleFieldMappingChange(index, 'table', e.target.value)
                        }
                        placeholder="e.g. production_summary"
                        className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-medium text-slate-600">
                      Column / field
                    </label>
                    {dbMetadata && Array.isArray(dbMetadata.tables) && dbMetadata.tables.length > 0 ? (
                      <select
                        value={mapping.column || ''}
                        onChange={(e) =>
                          handleFieldMappingChange(index, 'column', e.target.value)
                        }
                        className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="">Select column</option>
                        {(() => {
                          const tables = dbMetadata.tables;
                          const currentTable =
                            mapping.table &&
                            tables.find(
                              (tbl) => {
                                const name = tbl.name || tbl.table || tbl.id;
                                const schema = tbl.schema || tbl.table_schema;
                                if (name !== mapping.table) return false;
                                if (mapping.schema && schema && mapping.schema !== schema) {
                                  return false;
                                }
                                return true;
                              },
                            );
                          const cols = currentTable
                            ? (Array.isArray(currentTable.columns)
                                ? currentTable.columns
                                : Array.isArray(currentTable.fields)
                                  ? currentTable.fields
                                  : [])
                            : [];
                          return cols.map((col) => (
                            <option key={col} value={col}>
                              {col}
                            </option>
                          ));
                        })()}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={mapping.column || ''}
                        onChange={(e) =>
                          handleFieldMappingChange(index, 'column', e.target.value)
                        }
                        placeholder="e.g. actual"
                        className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-medium text-slate-600">
                      KPI variable
                    </label>
                    {Array.isArray(formulaVariables) && formulaVariables.length > 0 ? (
                      <select
                        value={mapping.variable || ''}
                        onChange={(e) =>
                          handleFieldMappingChange(index, 'variable', e.target.value)
                        }
                        className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="">Select variable</option>
                        {formulaVariables.map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={mapping.variable || ''}
                        onChange={(e) =>
                          handleFieldMappingChange(index, 'variable', e.target.value)
                        }
                        placeholder="e.g. actual"
                        className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    )}
                  </div>
                  <div className="flex items-end justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveFieldMapping(index)}
                      className="rounded-md border border-transparent px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </form>
    </CommonModal>
  );
};

export default AddKpiModal;
