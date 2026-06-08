import { Fragment, useMemo, useState, useRef, useEffect } from "react";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

export function CommonDataGrid({
  title,
  columns = [],
  data = [],
  actions,
  defaultPageSize = 10,
  pageSizeOptions = [5, 10, 25, 50, 100],
  onRowClick,
  showSearch = true,
  searchPlaceholder = "Search...",
  /**
   * When provided, gets called (debounced) with the global search text.
   * Useful for server-side search.
   */
  onSearchChange,
  /** When true, disables client-side global filtering (delegates to server). */
  serverSearch = false,
  /** Debounce time for onSearchChange. */
  searchDebounceMs = 300,
  // Server-side pagination support
  serverPagination = false,
  page: controlledPage,
  totalCount: controlledTotalCount,
  onPageChange: externalOnPageChange,
  onPageSizeChange: externalOnPageSizeChange,
  // Allow consumers (like infinite-scroll views) to hide built-in pagination UI
  showPagination = true,
  // When true, keeps the header row visible while the table scrolls vertically
  stickyHeader = false,
  infiniteScroll = false,
  onLoadMore,
  hasMore = false,
  loading = false,
  expandable = false,
  renderExpandedRow,
  /** When false, the expand control is hidden for that row (e.g. no child rows). */
  isRowExpandable = () => true,
  /** When true, the expand chevron column is the first column; otherwise the last. */
  expandColumnAtStart = false,
  ...props
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [filterText, setFilterText] = useState("");
  const [columnFilters, setColumnFilters] = useState({});
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);
  const [expandedRows, setExpandedRows] = useState({});

  // Derived pagination state (controlled vs uncontrolled)
  const effectivePage =
    serverPagination && typeof controlledPage === "number"
      ? controlledPage
      : currentPage;

  // Filter data
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Global search filter
    if (filterText && !serverSearch) {
      filtered = filtered.filter((row) =>
        columns.some((col) => {
          const value = row[col.key];
          return value
            ?.toString()
            .toLowerCase()
            .includes(filterText.toLowerCase());
        }),
      );
    }

    // Column-specific filters
    Object.keys(columnFilters).forEach((key) => {
      const filterValue = columnFilters[key];
      if (filterValue) {
        filtered = filtered.filter((row) => {
          const value = row[key];
          return value
            ?.toString()
            .toLowerCase()
            .includes(filterValue.toLowerCase());
        });
      }
    });

    return filtered;
  }, [data, filterText, columnFilters, columns, serverSearch]);

  useEffect(() => {
    if (typeof onSearchChange !== "function") return;
    const timer = setTimeout(() => {
      onSearchChange(filterText);
    }, searchDebounceMs);
    return () => clearTimeout(timer);
  }, [filterText, onSearchChange, searchDebounceMs]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc"
          ? aValue - bValue
          : bValue - aValue;
      }

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (sortConfig.direction === "asc") {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });

    return sorted;
  }, [filteredData, sortConfig]);

  // Total items (client vs server)
  const totalItems =
    serverPagination && typeof controlledTotalCount === "number"
      ? controlledTotalCount
      : sortedData.length;

  // Paginate data
  const paginatedData = useMemo(() => {
    if (serverPagination) {
      // Data is already paginated by the server
      return sortedData;
    }
    const startIndex = (effectivePage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, effectivePage, pageSize, serverPagination]);

  const totalPages = Math.max(1, Math.ceil((totalItems || 0) / pageSize));

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === "asc") {
          return { key, direction: "desc" };
        } else if (prev.direction === "desc") {
          return { key: null, direction: null };
        }
      }
      return { key, direction: "asc" };
    });
  };

  const handlePageChange = (newPage) => {
    const clampedPage = Math.max(1, Math.min(newPage, totalPages));
    if (serverPagination && typeof externalOnPageChange === "function") {
      externalOnPageChange(clampedPage);
    } else {
      setCurrentPage(clampedPage);
    }
  };

  const handlePageSizeChange = (e) => {
    const newPageSize = Number(e.target.value);
    setPageSize(newPageSize);
    if (serverPagination && typeof externalOnPageSizeChange === "function") {
      externalOnPageSizeChange(newPageSize);
    } else {
      setCurrentPage(1);
    }
  };

  const handleFilterChange = (e) => {
    setFilterText(e.target.value);
    setCurrentPage(1);
  };

  const handleColumnFilterChange = (key, value) => {
    setColumnFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1);
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return null;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUpIcon className="h-4 w-4" />
    ) : (
      <ArrowDownIcon className="h-4 w-4" />
    );
  };

  useEffect(() => {
    if (!infiniteScroll) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];

        if (first.isIntersecting && hasMore && !loading) {
          onLoadMore?.();
        }
      },
      {
        root: observerRef.current,
        rootMargin: "100px",
        threshold: 0.1,
      },
    );

    const current = sentinelRef.current;

    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [hasMore, loading, infiniteScroll, onLoadMore]);

  const toggleRow = (index) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  /** Align cell content with headers: uses explicit `align`, then `headerAlign`, then defaults. */
  const resolveColumnAlign = (column) => {
    if (column.align === "center" || column.align === "right" || column.align === "left") {
      return column.align;
    }
    if (
      column.headerAlign === "center" ||
      column.headerAlign === "right" ||
      column.headerAlign === "left"
    ) {
      return column.headerAlign;
    }
    if (column.key === "actions") return "center";
    return "left";
  };

  const alignToTextClass = (align) =>
    align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";

  const alignToFlexJustify = (align) =>
    align === "center"
      ? "justify-center"
      : align === "right"
        ? "justify-end"
        : "justify-between";

  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      {...props}
    >
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white p-4">
          {title && (
            <h3 className="m-0 text-lg font-semibold text-slate-900">
              {title}
            </h3>
          )}
          {actions && (
            <div className="flex items-center justify-end gap-2">{actions}</div>
          )}
        </div>
      )}

      {/* Global Search */}
      {showSearch && (
        <div className="border-b border-slate-200 bg-white p-4">
          <div className="relative max-w-xs">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={filterText}
              onChange={handleFilterChange}
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div ref={observerRef} className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-slate-100/60">
            <tr>
              {expandable && expandColumnAtStart && (
                <th
                  className="border-b-2 border-slate-200 p-3 text-center"
                  style={{ width: "40px" }}
                  aria-label="Expand rows"
                />
              )}
              {columns.map((column) => {
                const colAlign = resolveColumnAlign(column);
                const thTextClass = alignToTextClass(colAlign);
                const thFlexClass = alignToFlexJustify(colAlign);
                return (
                  <th
                    key={column.key}
                    className={`border-b-2 border-slate-200 p-3 text-sm font-semibold text-slate-900 ${thTextClass} ${column.sortable !== false ? "cursor-pointer" : "cursor-default"}`}
                    style={{
                      width: column.width || "auto",
                      minWidth: column.minWidth || "8rem",
                      ...(stickyHeader
                        ? {
                            position: "sticky",
                            top: 0,
                            zIndex: 20,
                            background: "#f8fafc",
                          }
                        : {}),
                    }}
                    onClick={() =>
                      column.sortable !== false && handleSort(column.key)
                    }
                  >
                    <div className={`flex items-center gap-1 ${thFlexClass}`}>
                      <span>{column.label}</span>
                      {column.sortable !== false && getSortIcon(column.key)}
                    </div>
                  </th>
                );
              })}
              {expandable && !expandColumnAtStart && (
                <th
                  className="border-b-2 border-slate-200 p-3 text-center"
                  style={{ width: "40px" }}
                  aria-label="Expand rows"
                />
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (expandable ? 1 : 0)}
                  className="p-8 text-center text-sm text-slate-500"
                >
                  No data available
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <Fragment key={row.id ?? row.key ?? rowIndex}>
                  <tr
                    className={`border-b border-slate-200 transition-colors ${
                      onRowClick ? "cursor-pointer hover:bg-blue-50/50" : "hover:bg-slate-50"
                    }`}
                    onClick={() => onRowClick?.(row)}
                  >
                    {expandable && expandColumnAtStart && (
                      <td className="p-3 text-center">
                        {isRowExpandable(row) ? (
                          <button
                            type="button"
                            onClick={() => toggleRow(rowIndex)}
                            className="inline-flex items-center justify-center rounded-md p-1 text-blue-600 hover:bg-blue-50"
                            aria-expanded={!!expandedRows[rowIndex]}
                            aria-label={
                              expandedRows[rowIndex]
                                ? "Collapse row details"
                                : "Expand row details"
                            }
                          >
                            {expandedRows[rowIndex] ? (
                              <ChevronDownIcon className="h-5 w-5" />
                            ) : (
                              <ChevronRightIcon className="h-5 w-5" />
                            )}
                          </button>
                        ) : (
                          <span className="inline-block w-7" aria-hidden />
                        )}
                      </td>
                    )}
                    {columns.map((column) => {
                      const colAlign = resolveColumnAlign(column);
                      const tdTextClass = alignToTextClass(colAlign);
                      return (
                        <td key={column.key} className={`p-3 align-middle ${tdTextClass}`}>
                          {column.render
                            ? column.render(row[column.key], row)
                            : row[column.key]}
                        </td>
                      );
                    })}

                    {expandable && !expandColumnAtStart && (
                      <td className="p-3 text-center">
                        {isRowExpandable(row) ? (
                          <button
                            type="button"
                            onClick={() => toggleRow(rowIndex)}
                            className="inline-flex items-center justify-center rounded-md p-1 text-blue-600 hover:bg-blue-50"
                            aria-expanded={!!expandedRows[rowIndex]}
                            aria-label={
                              expandedRows[rowIndex]
                                ? "Collapse row details"
                                : "Expand row details"
                            }
                          >
                            {expandedRows[rowIndex] ? (
                              <ChevronDownIcon className="h-5 w-5" />
                            ) : (
                              <ChevronRightIcon className="h-5 w-5" />
                            )}
                          </button>
                        ) : (
                          <span className="inline-block w-7" aria-hidden />
                        )}
                      </td>
                    )}
                  </tr>

                  {expandable &&
                    expandedRows[rowIndex] &&
                    isRowExpandable(row) && (
                    <tr>
                      <td colSpan={columns.length + 1}>
                        {renderExpandedRow(row)}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}

            {infiniteScroll && (
              <tr ref={sentinelRef}>
                <td
                  colSpan={columns.length + (expandable ? 1 : 0)}
                  style={{ height: 20 }}
                />
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="flex items-center justify-between border-t border-slate-200 bg-white p-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Rows per page:</span>
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              className="cursor-pointer rounded-md border border-slate-300 px-2 py-1 text-sm outline-none"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="mr-2 text-sm text-slate-500">
              {totalItems === 0
                ? "0"
                : `${(effectivePage - 1) * pageSize + 1}-${Math.min(
                    effectivePage * pageSize,
                    totalItems,
                  )}`}{" "}
              of {totalItems}
            </span>
            <button
              type="button"
              onClick={() => handlePageChange(effectivePage - 1)}
              disabled={effectivePage === 1}
              className="flex items-center rounded-md border border-slate-300 p-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handlePageChange(effectivePage + 1)}
              disabled={effectivePage === totalPages}
              className="ml-1 flex items-center rounded-md border border-slate-300 p-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CommonDataGrid;
