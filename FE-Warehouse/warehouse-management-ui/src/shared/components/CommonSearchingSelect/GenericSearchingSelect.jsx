import { useState, useRef, useEffect } from "react";

export default function GenericSearchSelect({
  label,
  options = [],
  value,
  onChange,
  placeholder = "Select an option",
  error,
  required = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // const filteredOptions = options.filter((opt) =>
  //   opt.label.toLowerCase().includes(search.toLowerCase()),
  // );
  const filteredOptions = (options || []).filter(option =>
  String(option?.label || "")
    .toLowerCase()
    .includes(String(search || "").toLowerCase())
);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearch("");
        setHighlightIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
    setSearch("");
    setHighlightIndex(-1);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
    setSearch("");
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : 0,
      );
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev > 0 ? prev - 1 : filteredOptions.length - 1,
      );
    }

    if (e.key === "Enter" && highlightIndex >= 0) {
      e.preventDefault();
      handleSelect(filteredOptions[highlightIndex]);
    }

    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="w-full relative" ref={containerRef}>
      {/* Label */}
      {label && (
        <label className="block mb-1 text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Select Field */}
      <div
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`
          flex items-center justify-between
          w-full px-3 py-2.5
          bg-white
          border rounded-md shadow-sm
          cursor-pointer
          transition-all duration-200
          ${
            error
              ? "border-red-500"
              : "border-gray-300 hover:border-gray-400 focus:ring-2 focus:ring-blue-100"
          }
        `}
      >
        {/* Selected Text */}
        <span
          className={`text-sm truncate ${
            selectedOption ? "text-gray-800" : "text-gray-400"
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        {/* Icons */}
        <div className="flex items-center gap-2">
          {/* Clear Button */}
          {selectedOption && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600"
            >
              {/* X Icon */}
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M6 6a1 1 0 011.414 0L10 8.586 12.586 6A1 1 0 1114 7.414L11.414 10 14 12.586A1 1 0 1112.586 14L10 11.414 7.414 14A1 1 0 116 12.586L8.586 10 6 7.414A1 1 0 016 6z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}

          {/* Arrow */}
          <svg
            className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-gray-100">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search..."
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Options */}
          <ul className="max-h-72 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <li
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  className={`
                    flex items-center justify-between
                    px-3 py-1.5 text-sm cursor-pointer
                    ${
                      index === highlightIndex
                        ? "bg-blue-100"
                        : value === option.value
                          ? "bg-blue-50 text-blue-600"
                          : "hover:bg-gray-100"
                    }
                  `}
                >
                  {option.label}

                  {value === option.value && (
                    <svg
                      className="h-4 w-4 text-blue-600"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 5.29a1 1 0 010 1.42l-7.25 7.25a1 1 0 01-1.42 0l-3.75-3.75a1 1 0 111.42-1.42L9 11.59l6.54-6.54a1 1 0 011.42 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-sm text-gray-400">
                No results found
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Error */}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
