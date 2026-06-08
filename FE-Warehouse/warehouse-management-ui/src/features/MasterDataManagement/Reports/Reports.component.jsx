import React, { useMemo, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CommonHeading } from '@shared/components/CommonHeading';
import { CommonButton } from '@shared/components/CommonButton';
import CommonDataGrid from '@shared/components/CommonDataGrid';
import { ToastContainer } from '@shared/components/Toast';
import { useToast } from '@shared/hooks/useToast';
import CommonModal from '@shared/components/CommonModal';
import CommonLoader from '@shared/components/CommonLoader';
import {
  fetchReportPreview,
  downloadReport,
} from '@core/store/slices/Reports/reportsSlice';
import {
  DocumentTextIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  ClockIcon,
  CalendarDaysIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const REPORT_DEFINITIONS = [
  {
    id: 'daily-production',
    title: 'Daily Production Report',
    category: 'Production',
    description: 'Shift-wise production summary with plan vs actual',
    icon: ChartBarIcon,
    reportId: 'daily-production',
  },
  {
    id: 'efficiency',
    title: 'Efficiency Report',
    category: 'Performance',
    description: 'Department-wise efficiency trends and analysis',
    icon: ArrowTrendingUpIcon,
    reportId: 'efficiency',
  },
  {
    id: 'rejection-analysis',
    title: 'Rejection Analysis',
    category: 'Quality',
    description: 'Detailed rejection data with PPM calculations',
    icon: DocumentTextIcon,
    reportId: 'rejection-analysis',
  },
  {
    id: 'manpower',
    title: 'Manpower Report',
    category: 'HR',
    description: 'Attendance and productivity per employee',
    icon: UserGroupIcon,
    reportId: 'manpower',
  },
  {
    id: 'downtime',
    title: 'Downtime Report',
    category: 'Maintenance',
    description: 'Machine downtime analysis by reason',
    icon: ClockIcon,
    reportId: 'downtime',
  },
  {
    id: 'monthly-summary',
    title: 'Monthly Summary',
    category: 'Management',
    description: 'Comprehensive monthly production summary',
    icon: CalendarDaysIcon,
    reportId: 'monthly-summary',
  },

  {
    id: 'breakdown',
    title: 'Breakdown Report',
    category: 'Maintenance',
    description: 'Breakdown analysis by reason',
    icon: ExclamationTriangleIcon,
    reportId: 'breakdown',
  },
];

function Reports() {
  const reports = useMemo(() => REPORT_DEFINITIONS, []);
  const [activeReportId, setActiveReportId] = useState(null);
  const [columns, setColumns] = useState([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const dispatch = useDispatch();
  const { toasts, showError, showSuccess, removeToast } = useToast();

  const {
    items: previewItems,
    loading,
    hasMore,
    currentPage,
  } = useSelector((state) =>
    activeReportId
      ? state.reports?.entities?.[activeReportId] || {
          items: [],
          loading: false,
          hasMore: false,
          currentPage: 0,
        }
      : {
          items: [],
          loading: false,
          hasMore: false,
          currentPage: 0,
        },
  );

  const handleOpenPreview = async (report) => {
    if (!report?.reportId) return;
    setActiveReportId(report.reportId);

    try {
      const result = await dispatch(
        // First page load for the report preview
        fetchReportPreview({
          reportId: report.reportId,
          page: 1,
          pageSize: 20,
          extraParams: {},
        }),
      ).unwrap();

      const firstRow = Array.isArray(result?.data?.results)
        ? result.data.results[0]
        : null;
      if (firstRow && typeof firstRow === 'object') {
        const dynamicColumns = Object.keys(firstRow).map((key) => ({
          key,
          label: key,
        }));
        setColumns(dynamicColumns);
      } else {
        setColumns([]);
      }

      setIsPreviewOpen(true);
      setIsFullScreen(false);
    } catch (error) {
      setActiveReportId(null);
      const errorMessage =
        error?.message ||
        error?.payload?.message ||
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        (typeof error === 'string' ? error : 'Failed to load report preview. Please try again.');
      showError(errorMessage);
    }
  };

  const handleScroll = useCallback(
    (event) => {
      if (!activeReportId || !hasMore || loading) return;
      const target = event.currentTarget;
      const { scrollTop, scrollHeight, clientHeight } = target;

      if (scrollHeight - scrollTop - clientHeight < 80) {
        dispatch(
          fetchReportPreview({
            reportId: activeReportId,
            page: (currentPage || 0) + 1,
            pageSize: 20,
            extraParams: {},
          }),
        )
          .unwrap()
          .catch((error) => {
            const errorMessage =
              error?.message ||
              error?.payload?.message ||
              error?.response?.data?.message ||
              error?.response?.data?.error ||
              'Failed to load more data. Please scroll again to retry.';
            showError(errorMessage);
          });
      }
    },
    [activeReportId, hasMore, loading, currentPage, dispatch, showError],
  );

  const handleDownload = async (report) => {
    if (!report?.reportId) return;

    try {
      const result = await dispatch(
        downloadReport({
          reportId: report.reportId,
          extraParams: {},
        }),
      ).unwrap();

      const blob = result?.blob;
      if (!blob) {
        showError('Unable to download report. Empty response received.');
        return;
      }

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = result.fileName || `${report.id}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      showSuccess('Report downloaded successfully.');
    } catch (error) {
      const errorMessage =
        error?.message ||
        error?.payload?.message ||
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Failed to download report. Please try again.';
      showError(errorMessage);
    }
  };

  const activeReport =
    activeReportId && reports.find((r) => r.reportId === activeReportId);

  return (
    <div className="min-h-screen">
        

<div className="mx-auto flex max-w flex-col gap-5">
        <CommonHeading
           title="Reports"
          subtitle="Generate and download production reports"
        />

        {/* Main Cards View */}
        <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-3">
          {reports.map((report) => {
            const Icon = report.icon || DocumentTextIcon;

            return (
              <div
                key={report.id}
                className="relative flex h-full min-h-[12rem] flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:min-h-[13rem] sm:gap-5 sm:px-6 sm:py-5"
              >
                <div className="flex items-start justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 sm:h-10 sm:w-10">
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-2 sm:gap-2.5">
                      <h2 className="text-base font-semibold text-slate-900 leading-snug sm:text-lg">
                        {report.title}
                      </h2>
                      <p className="text-xs text-slate-500 leading-snug sm:text-sm">
                        {report.description}
                      </p>
                    </div>
                  </div>

                  <span className="whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-600 sm:px-3 sm:py-1 sm:text-[11px]">
                    {report.category}
                  </span>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
                  <CommonButton
                    variant="outline"
                    size="sm"
                    icon={EyeIcon}
                    onClick={() => handleOpenPreview(report)}
                    fullWidth
                    className="w-full"
                  >
                    Preview
                  </CommonButton>

                  <CommonButton
                    variant="primary"
                    size="sm"
                    icon={ArrowDownTrayIcon}
                    onClick={() => handleDownload(report)}
                    fullWidth
                    className="w-full"
                  >
                    Download
                  </CommonButton>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Preview Modal */}
      {activeReport && (
        <CommonModal
          isOpen={isPreviewOpen}
          onClose={() => {
            setIsPreviewOpen(false);
            setActiveReportId(null);
            setColumns([]);
            setIsFullScreen(false);
          }}
          title={`${activeReport.title} - Preview`}
          size={isFullScreen ? 'full' : '2xl'}
        >
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsFullScreen((prev) => !prev);
              }}
              className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-600 hover:bg-slate-100 sm:right-4 sm:top-3 sm:px-2 sm:py-1 sm:text-[11px]"
            >
              {isFullScreen ? (
                <>
                  <ArrowsPointingInIcon className="h-3 w-3" />
                  <span className="hidden sm:inline">Exit Fullscreen</span>
                  <span className="sm:hidden">Exit</span>
                </>
              ) : (
                <>
                  <ArrowsPointingOutIcon className="h-3 w-3" />
                  <span className="hidden sm:inline">Fullscreen</span>
                  <span className="sm:hidden">Full</span>
                </>
              )}
            </button>

            <div
              className={`-mt-3 h-full overflow-auto rounded-xl border border-slate-100 ${
                isFullScreen
                  ? 'max-h-[calc(100vh-140px)] sm:max-h-[calc(100vh-160px)]'
                  : 'max-h-[60vh] sm:max-h-[480px]'
              }`}
              onScroll={handleScroll}
            >
              {loading && previewItems.length === 0 ? (
                <div className="flex min-h-[200px] items-center justify-center">
                  <CommonLoader message="Loading report data..." />
                </div>
              ) : (
                <>
                  <CommonDataGrid
                    title={null}
                    columns={columns}
                    data={previewItems}
                    serverPagination
                    showSearch={true}
                    showPagination={false}
                    stickyHeader
                  />
                  {loading && previewItems.length > 0 && (
                    <div className="border-t border-slate-100 bg-slate-50 py-2 text-center text-xs text-slate-500">
                      Loading more...
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </CommonModal>
      )}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default Reports;