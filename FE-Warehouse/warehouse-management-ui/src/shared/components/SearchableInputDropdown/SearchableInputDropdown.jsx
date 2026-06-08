import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

function SearchableInputDropdown({
  value,
  onChange,
  options = [],
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  onSearchChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0 });

 

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return options;
    return options.filter((opt) =>
      String(opt ?? "")
        .toLowerCase()
        .includes(query),
    );
  }, [options, search]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!isOpen) return;
      const clickedInsideRoot = rootRef.current?.contains?.(e.target);
      const clickedInsideMenu = menuRef.current?.contains?.(e.target);
      if (clickedInsideRoot || clickedInsideMenu) return;
      setIsOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [isOpen]);

  const updateMenuPosition = useCallback(() => {
    const btn = triggerRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const GAP = 6;
    const PADDING = 8;

    let top = rect.bottom + GAP;
    let left = Math.max(PADDING, rect.left);
    let width = Math.min(rect.width, window.innerWidth - left - PADDING);

    const menuEl = menuRef.current;
    if (menuEl) {
      const menuRect = menuEl.getBoundingClientRect();
      const overflowsBottom = top + menuRect.height > window.innerHeight;
      const canFitAbove = rect.top - GAP - menuRect.height >= 0;
      if (overflowsBottom && canFitAbove) {
        top = rect.top - GAP - menuRect.height;
      }
      const minTop = PADDING;
      const maxTop = window.innerHeight - menuRect.height - PADDING;
      top = Math.max(minTop, Math.min(top, maxTop));
    }

    setMenuPosition({ top, left, width });
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const raf = requestAnimationFrame(() => updateMenuPosition());
    window.addEventListener("resize", updateMenuPosition);
    document.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", updateMenuPosition);
      document.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [isOpen, updateMenuPosition]);

  return (
    <div ref={rootRef} className="relative w-full">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          requestAnimationFrame(() => updateMenuPosition());
          setSearch("");
//         
        }}
        className="flex h-10 w-full items-center justify-between gap-2 rounded-md border border-slate-300 bg-white px-3 text-left text-sm text-slate-700 transition-all duration-150 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
      >
        <span className={`truncate ${value ? "text-slate-900" : "text-slate-400"}`}>
          {value || placeholder}
        </span>
        <span className="flex items-center gap-1.5">
          {value ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
                setSearch("");
                onSearchChange?.("");
                setIsOpen(false);
              }}
              className="rounded p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              aria-label="Clear filter"
            >
              <XMarkIcon className="h-3.5 w-3.5" />
            </button>
          ) : null}
          <ChevronDownIcon className="h-4 w-4 shrink-0 text-slate-400" />
        </span>
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            className="max-h-60 overflow-x-hidden overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.12),0_0_0_1px_rgba(0,0,0,0.05)]"
            style={{
              position: "fixed",
              top: menuPosition.top,
              left: menuPosition.left,
              width: menuPosition.width,
              zIndex: 10050,
            }}
          >
            <div className="border-b border-slate-100 p-2">
              <div className="relative">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSearch(v);
                    onSearchChange?.(v);
                  }}
                  placeholder={searchPlaceholder}
                  autoFocus
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-8 text-sm text-slate-700 outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-500/20"
                />
                {search ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      onSearchChange?.("");
                    }}
                    className="absolute right-2.5 top-2 rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    aria-label="Clear search"
                  >
                    <XMarkIcon className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
            </div>

            <ul role="listbox" className="py-1">
              {filtered.length > 0 ? (
                filtered.slice(0, 100).map((opt) => {
                  const selected = String(opt) === String(value);
                  return (
                    <li key={opt}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={selected}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          onChange(String(opt));
                          setIsOpen(false);
                          setSearch("");
                          onSearchChange?.("");
                        }}
                        className={`mx-1 flex w-[calc(100%-0.5rem)] items-center rounded-md px-3 py-2 text-left text-sm transition-colors ${
                          selected
                            ? "bg-indigo-50 font-medium text-indigo-700"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span className="truncate">{opt}</span>
                      </button>
                    </li>
                  );
                })
              ) : (
                <li className="px-4 py-2.5 text-sm text-slate-500">No Data Found</li>
              )}
            </ul>
          </div>,
          document.body,
        )}
    </div>
  );
}

export default SearchableInputDropdown;
