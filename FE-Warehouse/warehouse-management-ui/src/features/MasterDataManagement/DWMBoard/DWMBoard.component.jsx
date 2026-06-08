import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CommonDataGrid } from '@shared/components/CommonDataGrid';
import CommonLoader from '@shared/components/CommonLoader';
import { ToastContainer } from '@shared/components/Toast';
import { useToast } from '@shared/hooks/useToast';
import { SQDE_CATEGORIES } from './constants/sqdeConfig';
import { getDaysInMonth, formatYearMonth, getCurrentYearMonth } from './utils/dateUtils';
import SQDECard from './components/SQDECard';
import DayStatusModal from './components/DayStatusModal';
import DailyProductionTrendChart from './charts/DailyProductionTrendChart';
import EfficiencyTrendChart from './charts/EfficiencyTrendChart';
import {
  selectDwmYear,
  selectDwmMonth,
  selectDwmSelectedDay,
  selectSqdeStatus,
  selectDwmUpdating,
  selectStatusBoardLoading,
  setYear as setDwmYear,
  setMonth as setDwmMonth,
  setSelectedDay as setDwmSelectedDay,
  patchDayStatus,
  fetchProductionSummary,
  fetchStatusBoard,
  selectSummaryType,
  selectProductionSummary,
  selectSummaryLoading,
  setSummaryType,
  fetchProducts,
  selectProducts,
  selectProductsLoading,
} from '@core/store/slices/dwmBoard/dwmBoardSlice';

/**
 * sqdeStatus: { [categoryId]: { [day]: 'ok' | 'not_ok' | 'no_plan' } }
 * dayStatusModal: { day, categoryId } | null when modal is open
 */
function DWMBoard() {
  const dispatch = useDispatch();
  const { year: initialYear, month: initialMonth } = getCurrentYearMonth();
  const year = useSelector(selectDwmYear) ?? initialYear;
  const month = useSelector(selectDwmMonth) ?? initialMonth;
  const selectedDay = useSelector(selectDwmSelectedDay) ?? 20;
  const sqdeStatus = useSelector(selectSqdeStatus);
  const updating = useSelector(selectDwmUpdating);
  const statusBoardLoading = useSelector(selectStatusBoardLoading);
  const summaryType = useSelector(selectSummaryType);
  const productionSummary = useSelector(selectProductionSummary);
  const summaryLoading = useSelector(selectSummaryLoading);
  const products = useSelector(selectProducts);
  const productsLoading = useSelector(selectProductsLoading);
  const [dayStatusModal, setDayStatusModal] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(1);
  const { toasts, showSuccess, showError, removeToast } = useToast();

  const daysInMonth = useMemo(() => getDaysInMonth(year, month), [year, month]);
  const titleDate = formatYearMonth(year, month);
  const safeSelectedDay = selectedDay > daysInMonth ? daysInMonth : selectedDay;
  const yearOptions = useMemo(() => {
    const y = new Date().getFullYear();
    return [y - 1, y, y + 1];
  }, []);

  const handleSelectDay = (day) => dispatch(setDwmSelectedDay(day));

  const handleDayClick = (day, categoryId) => {
    setDayStatusModal({ day, categoryId });
  };

  const buildDateString = (day) => {
    const m = String(month).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const toApiStatus = (status) => {
    if (status === 'ok') return 'OK';
    if (status === 'not_ok') return 'NOT_OK';
    return 'NO_PLAN';
  };

  const getSectionLetter = (categoryId) => {
    const cat = SQDE_CATEGORIES.find((c) => c.id === categoryId);
    return cat?.letter || categoryId?.[0]?.toUpperCase() || '';
  };

  const handleStatusChange = (categoryId, status) => {
    const day = Math.min(selectedDay, daysInMonth);
    const date = buildDateString(day);
    const section = getSectionLetter(categoryId);
    const statusApi = toApiStatus(status);
    dispatch(
      patchDayStatus({
        categoryId,
        day,
        status,
        date,
        section,
        statusApi,
      }),
    )
      .unwrap()
      .then(() => {
        showSuccess('SQDE status updated successfully');
        dispatch(fetchStatusBoard());
      })
      .catch((error) => {
        showError(
          error?.message || 'Failed to update SQDE status',
        );
      });
  };

  const handleModalStatusSelect = (status) => {
    if (!dayStatusModal) return;
    const { day, categoryId } = dayStatusModal;
    const date = buildDateString(day);
    const section = getSectionLetter(categoryId);
    const statusApi = toApiStatus(status);
    dispatch(
      patchDayStatus({
        categoryId,
        day,
        status,
        date,
        section,
        statusApi,
      }),
    )
      .unwrap()
      .then(() => {
        showSuccess('SQDE status updated successfully');
        dispatch(fetchStatusBoard());
        setDayStatusModal(null);
      })
      .catch((error) => {
        showError(
          error?.message || 'Failed to update SQDE status',
        );
      });
  };

  useEffect(() => {
    dispatch(
      fetchProductionSummary({
        type: summaryType,
        year,
        month,
        productId: selectedProductId,
      }),
    );
  }, [dispatch, summaryType, year, month, selectedProductId]);

  // Initial load of SQDE status board when screen mounts
  useEffect(() => {
    dispatch(fetchStatusBoard());
    dispatch(fetchProducts());
  }, [dispatch]);

  // When products load the first time, default to the first product if none selected
  useEffect(() => {
    if (!selectedProductId && products && products.length > 0) {
      setSelectedProductId(products[0].id);
    }
  }, [products, selectedProductId]);

  const producedTotal = useMemo(
    () =>
      productionSummary.reduce(
        (sum, row) => sum + (Number(row.actual) || 0),
        0,
      ),
    [productionSummary],
  );
  const plannedTotal = useMemo(
    () =>
      productionSummary.reduce(
        (sum, row) => sum + (Number(row.plan) || 0),
        0,
      ),
    [productionSummary],
  );
  const efficiencyTotal = plannedTotal
    ? ((producedTotal / plannedTotal) * 100).toFixed(1)
    : '0.0';

  const dailyTrendData = useMemo(
    () =>
      productionSummary
        .map((row) => ({
          day: row.day ?? row.label ?? '',
          value: Number(row.actual) || 0,
        }))
        .filter((item) => item.day),
    [productionSummary],
  );

  const efficiencyTrendData = useMemo(
    () =>
      productionSummary
        .map((row) => {
          const actual = Number(row.actual) || 0;
          const plan = Number(row.plan) || 0;
          const value = plan ? (actual / plan) * 100 : 0;
          return {
            day: row.day ?? row.label ?? '',
            value: Number.isFinite(value) ? Number(value.toFixed(1)) : 0,
          };
        })
        .filter((item) => item.day),
    [productionSummary],
  );

  const summaryColumns = useMemo(
    () => [
      {
        key: 'period',
        label:
          summaryType === 'weekly'
            ? 'Week'
            : summaryType === 'monthly'
              ? 'Month'
              : 'Day',
        sortable: true,
        minWidth: '6rem',
        render: (_, row) => {
          if (summaryType === 'weekly') return row.week ?? '-';
          if (summaryType === 'monthly') return row.month ?? '-';
          return row.day ?? row.label ?? '-';
        },
      },
      {
        key: 'plan',
        label: 'Plan',
        sortable: true,
        minWidth: '6rem',
      },
      {
        key: 'actual',
        label: 'Actual',
        sortable: true,
        minWidth: '6rem',
      },
      {
        key: 'efficiency',
        label: 'Efficiency',
        sortable: true,
        minWidth: '8rem',
        render: (value) =>
          value != null ? (
            <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
              {value}%
            </span>
          ) : (
            '-'
          ),
      },
      {
        key: 'rejection',
        label: 'Rejection',
        sortable: true,
        minWidth: '6rem',
      },
      {
        key: 'production_loss',
        label: 'Downtime',
        sortable: true,
        minWidth: '6rem',
        render: (value, row) => row.downtime ?? row.production_loss ?? value ?? '-',
      },
    ],
    [summaryType],
  );

  const modalCategory = dayStatusModal
    ? SQDE_CATEGORIES.find((c) => c.id === dayStatusModal.categoryId)
    : null;

  const isLoading = updating || statusBoardLoading || summaryLoading;

  return (
    <div className="relative space-y-6">
      {(isLoading || productsLoading) && (
        <CommonLoader overlay message="Loading data, please wait..." />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-xl font-semibold text-slate-900">
            Production System – DWM Board
          </h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Product</span>
              <select
                value={selectedProductId || ''}
                onChange={(e) => setSelectedProductId(Number(e.target.value))}
                className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="" disabled>
                  {productsLoading ? 'Loading products...' : 'Select product'}
                </option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name || p.product_name || p.code}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Year</span>
              <select
                value={year}
                onChange={(e) => dispatch(setDwmYear(Number(e.target.value)))}
                className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Month</span>
              <select
                value={month}
                onChange={(e) => dispatch(setDwmMonth(Number(e.target.value)))}
                className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {new Date(2000, m - 1).toLocaleString('en', { month: 'short' })} ({m})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-sky-600 px-4 py-2 text-sky-50">
          <div className="text-sm font-medium">
            Cell: Piston Hard
            <span className="ml-3 text-xs font-normal">Date: {titleDate}</span>
          </div>
          <div className="flex items-center gap-6 text-right text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide">Produced</p>
              <p className="text-lg font-semibold">{producedTotal}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide">Planned</p>
              <p className="text-lg font-semibold">{plannedTotal}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide">Efficiency</p>
              <p className="text-lg font-semibold">{efficiencyTotal}%</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-800">
            Production Summary –{' '}
            {summaryType === 'daily'
              ? 'Daily'
              : summaryType === 'weekly'
                ? 'Weekly'
                : 'Monthly'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => dispatch(setSummaryType('daily'))}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                summaryType === 'daily'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Daily
            </button>
            <button
              type="button"
              onClick={() => dispatch(setSummaryType('weekly'))}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                summaryType === 'weekly'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Weekly
            </button>
            <button
              type="button"
              onClick={() => dispatch(setSummaryType('monthly'))}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                summaryType === 'monthly'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>
      </header>

      <CommonDataGrid
        title="Production Summary"
        columns={summaryColumns}
        data={productionSummary}
        showSearch={true}
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SQDE_CATEGORIES.map((category) => (
          <SQDECard
            key={category.id}
            category={category}
            selectedDay={safeSelectedDay}
            onSelectDay={handleSelectDay}
            onDayClick={(day) => handleDayClick(day, category.id)}
            currentStatus={sqdeStatus[category.id]?.[safeSelectedDay] ?? 'ok'}
            onStatusChange={(status) => handleStatusChange(category.id, status)}
            dayStatus={sqdeStatus[category.id] || {}}
            daysInMonth={daysInMonth}
          />
        ))}
      </section>

      <DayStatusModal
        isOpen={!!dayStatusModal}
        onClose={() => setDayStatusModal(null)}
        day={dayStatusModal?.day}
        categoryLetter={modalCategory?.letter}
        currentStatus={
          dayStatusModal
            ? sqdeStatus[dayStatusModal.categoryId]?.[dayStatusModal.day] ?? 'ok'
            : 'ok'
        }
        onSelectStatus={handleModalStatusSelect}
      />

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DailyProductionTrendChart data={dailyTrendData} />
        <EfficiencyTrendChart data={efficiencyTrendData} target={Number(efficiencyTotal) || 0} />
      </section>
    </div>
  );
}

export default DWMBoard;
