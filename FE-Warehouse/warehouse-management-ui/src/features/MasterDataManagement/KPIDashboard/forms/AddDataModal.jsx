import React, { useState, useEffect } from 'react';
import { CommonModal } from '@shared/components/CommonModal';
import { CommonButton } from '@shared/components/CommonButton';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { extractVariables, validateAndEvaluateFormula } from '../services/formulaService';

const AddDataModal = ({ isOpen, onClose, kpi, initialData, onSave }) => {
  const expression = kpi?.calculation?.expression || kpi?.description || '';
  const variables = extractVariables(expression);
  const dataList = Array.isArray(initialData) ? initialData : [];

  const today = new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState(today);
  const [label, setLabel] = useState('');
  const [variableValues, setVariableValues] = useState({});
  const [actual, setActual] = useState('');
  const [target, setTarget] = useState('');
  const [calcError, setCalcError] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);

  const resetForm = () => {
    setDate(new Date().toISOString().slice(0, 10));
    setLabel('');
    setVariableValues(variables.reduce((acc, name) => ({ ...acc, [name]: '' }), {}));
    setActual('');
    setTarget('');
    setCalcError('');
    setEditingIndex(null);
  };

  useEffect(() => {
    if (isOpen && kpi) {
      resetForm();
    }
  }, [isOpen, kpi?.id]);

  const loadRowIntoForm = (row, index) => {
    setDate(row.date ?? today);
    setLabel(row.label ?? '');
    setVariableValues(
      variables.reduce((acc, name) => ({ ...acc, [name]: row[name] ?? '' }), {}),
    );
    setActual(row.actual != null ? String(row.actual) : '');
    setTarget(row.target != null ? String(row.target) : '');
    setCalcError('');
    setEditingIndex(index);
  };

  const handleVariableChange = (name, value) => {
    setVariableValues((prev) => ({ ...prev, [name]: value }));
    setCalcError('');
  };

  const handleCalculate = () => {
    setCalcError('');
    const result = validateAndEvaluateFormula(expression, variableValues);
    if (result.ok) {
      setActual(String(result.result));
    } else {
      setActual('');
      setCalcError(result.error || 'Invalid formula');
    }
  };

  const buildRow = (defaultLabel) => {
    const dayLabel = date || label.trim() || defaultLabel || `Point ${dataList.length + 1}`;
    return {
      date: date || undefined,
      label: dayLabel,
      ...variableValues,
      actual: actual === '' ? undefined : Number(actual),
      target: target === '' ? undefined : Number(target),
    };
  };

  const sortedDataList = [...dataList]
    .map((row, i) => ({ row, originalIndex: i }))
    .sort((a, b) => (a.row.date || a.row.label || '').localeCompare(b.row.date || b.row.label || ''));

  const handleAdd = () => {
    const row = buildRow(`Point ${dataList.length + 1}`);
    const nextData = [...dataList, row].sort((a, b) => (a.date || a.label || '').localeCompare(b.date || b.label || ''));
    onSave?.({ kpiId: kpi?.id, data: nextData });
    resetForm();
  };

  const handleUpdate = () => {
    if (editingIndex == null) return;
    const existing = dataList[editingIndex];
    const row = buildRow(existing?.label);
    const nextData = dataList.map((r, i) => (i === editingIndex ? row : r)).sort((a, b) => (a.date || a.label || '').localeCompare(b.date || b.label || ''));
    onSave?.({ kpiId: kpi?.id, data: nextData });
    resetForm();
  };

  const handleEdit = (index) => {
    loadRowIntoForm(dataList[index], index);
  };

  const handleDelete = (index) => {
    const nextData = dataList.filter((_, i) => i !== index);
    onSave?.({ kpiId: kpi?.id, data: nextData });
    if (editingIndex === index) resetForm();
    else if (editingIndex != null && editingIndex > index) setEditingIndex(editingIndex - 1);
  };

  if (!kpi) return null;

  const hasFormula = variables.length > 0;
  const isEditing = editingIndex != null;

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={() => { resetForm(); onClose(); }}
      title={`Add data: ${kpi.name}`}
      size="lg"
      showCloseButton
      closeOnBackdropClick
      footer={
        <div className="flex justify-end gap-2">
          <CommonButton variant="ghost" size="sm" onClick={onClose}>
            Close
          </CommonButton>
          {hasFormula && (
            isEditing ? (
              <CommonButton variant="primary" size="sm" onClick={handleUpdate}>
                Update
              </CommonButton>
            ) : (
              <CommonButton variant="primary" size="sm" onClick={handleAdd}>
                Add
              </CommonButton>
            )
          )}
        </div>
      }
    >
      <div className="space-y-4">
        {!hasFormula ? (
          <p className="text-sm text-slate-500">
            This KPI has no custom formula. Add data is only available for KPIs with a formula expression.
          </p>
        ) : (
          <>
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700">Date (day)</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700">Optional label (overrides date on chart)</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Leave empty to use date"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-3">
              <p className="text-xs font-medium text-slate-600">Formula variables</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {variables.map((name) => (
                  <div key={name} className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 capitalize">
                      {name.replace(/_/g, ' ')}
                    </label>
                    <input
                      type="number"
                      value={variableValues[name] ?? ''}
                      onChange={(e) => handleVariableChange(name, e.target.value)}
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-end gap-2">
              <CommonButton
                variant="outline"
                size="sm"
                onClick={handleCalculate}
              >
                Calculate
              </CommonButton>
              {calcError && (
                <span className="text-xs text-red-500">{calcError}</span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Actual</label>
                <input
                  type="text"
                  readOnly
                  value={actual}
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                  placeholder="Click Calculate"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Target</label>
                <input
                  type="number"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder=""
                />
              </div>
            </div>

            {isEditing && (
              <CommonButton variant="ghost" size="sm" onClick={resetForm}>
                Cancel edit
              </CommonButton>
            )}

            <div className="border-t border-slate-200 pt-4 mt-4">
              <h4 className="text-sm font-semibold text-slate-800 mb-2">Historical data (day-wise)</h4>
              {dataList.length === 0 ? (
                <p className="text-sm text-slate-500">No data yet. Pick a date, fill the form and click Add to add a day; it will appear on the graph.</p>
              ) : (
                <div className="overflow-x-auto max-h-48 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left">
                        <th className="py-1.5 pr-2 font-medium text-slate-600">Date</th>
                        <th className="py-1.5 pr-2 font-medium text-slate-600">Label</th>
                        {variables.map((name) => (
                          <th key={name} className="py-1.5 pr-2 font-medium text-slate-600 capitalize">{name.replace(/_/g, ' ')}</th>
                        ))}
                        <th className="py-1.5 pr-2 font-medium text-slate-600">Actual</th>
                        <th className="py-1.5 pr-2 font-medium text-slate-600">Target</th>
                        <th className="py-1.5 pr-2 text-right font-medium text-slate-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedDataList.map(({ row, originalIndex }) => (
                        <tr key={originalIndex} className="border-b border-slate-100 hover:bg-slate-50/50">
                          <td className="py-1.5 pr-2 text-slate-700">{row.date ?? '—'}</td>
                          <td className="py-1.5 pr-2 text-slate-700">{row.label ?? '—'}</td>
                          {variables.map((name) => (
                            <td key={name} className="py-1.5 pr-2 text-slate-700">{row[name] != null ? row[name] : '—'}</td>
                          ))}
                          <td className="py-1.5 pr-2 text-slate-700">{row.actual != null ? row.actual : '—'}</td>
                          <td className="py-1.5 pr-2 text-slate-700">{row.target != null ? row.target : '—'}</td>
                          <td className="py-1.5 pr-2 text-right">
                            <button
                              type="button"
                              onClick={() => handleEdit(originalIndex)}
                              className="p-1 text-slate-500 hover:text-sky-600 rounded"
                              aria-label="Edit"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(originalIndex)}
                              className="p-1 text-slate-500 hover:text-red-600 rounded ml-0.5"
                              aria-label="Delete"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </CommonModal>
  );
};

export default AddDataModal;
