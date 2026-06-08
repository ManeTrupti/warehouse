import { useState, useMemo } from "react";
import {
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import { CommonButton } from "@shared/components/CommonButton";

// Helper function to safely import optional dependencies
const safeImport = async (moduleName) => {
  try {
    // Direct dynamic import - Vite will handle it at runtime
    const module = await import(/* @vite-ignore */ moduleName);
    return module;
  } catch (error) {
    console.warn(`Failed to import ${moduleName}:`, error);
    return null;
  }
};

export function CommonExport({
  data = [],
  columns = [],
  filename = "export",
  onExport,
  excludeColumns = ["actions"], // Columns to exclude from export
  title,
  ...props
}) {
  const [showMenu, setShowMenu] = useState(false);

  // Filter out excluded columns and get exportable columns
  const exportableColumns = useMemo(() => {
    return columns.filter((col) => !excludeColumns.includes(col.key));
  }, [columns, excludeColumns]);

  // Helper function to extract raw value from cell (handles render functions)
  const getCellValue = (row, column) => {
    const value = row[column.key];
    return value;
  };

  // Get display title
  const displayTitle = title || filename.charAt(0).toUpperCase() + filename.slice(1);

  const handleExportExcel = async () => {
    try {
      // Try exceljs first (better styling support), then fall back to xlsx
      let ExcelJS = await safeImport("exceljs");
      let useExcelJS = false;
      
      if (ExcelJS) {
        useExcelJS = true;
        ExcelJS = ExcelJS.default || ExcelJS;
      } else {
        // Fall back to xlsx
        ExcelJS = await safeImport("xlsx");
      }
      
      if (!ExcelJS) {
        // If neither library is installed, fall back to CSV format
        console.warn("Excel library not found, exporting as CSV instead");
        handleExportCSV();
        return;
      }

      // Prepare data for export using exportable columns only
      const tableHeaders = exportableColumns.map((col) => col.label);
      const tableData = data.map((row) =>
        exportableColumns.map((col) => {
          const value = getCellValue(row, col);
          // Handle different value types
          if (value === null || value === undefined) return "";
          if (typeof value === "object") {
            try {
              return JSON.stringify(value);
            } catch {
              return String(value);
            }
          }
          return String(value);
        })
      );

      if (useExcelJS) {
        // Use exceljs for better styling support
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");

        // Add title at top left
        const titleRow = worksheet.addRow([displayTitle]);
        const titleCell = titleRow.getCell(1);
        titleCell.font = {
          bold: true,
          size: 16,
          color: { argb: "FF2563EB" }, // Primary blue
        };
        titleCell.alignment = {
          vertical: "middle",
          horizontal: "left",
        };
        // Merge title across all columns
        worksheet.mergeCells(1, 1, 1, exportableColumns.length);
        worksheet.getRow(1).height = 25;

        // Add empty row for spacing
        worksheet.addRow([]);
        worksheet.getRow(2).height = 5;

        // Add header row with styling
        const headerRow = worksheet.addRow(tableHeaders);
        headerRow.height = 20;
        headerRow.eachCell((cell, colNumber) => {
          // Set background color (blue)
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF2563EB" }, // Primary blue color
          };
          // Set font styling
          cell.font = {
            bold: true,
            color: { argb: "FFFFFFFF" }, // White text
            size: 11,
            name: "Calibri",
          };
          // Set alignment
          cell.alignment = {
            horizontal: "center",
            vertical: "middle",
            wrapText: true,
          };
          // Set borders (white borders on blue background)
          cell.border = {
            top: { style: "thin", color: { argb: "FFFFFFFF" } },
            bottom: { style: "thin", color: { argb: "FFFFFFFF" } },
            left: { style: "thin", color: { argb: "FFFFFFFF" } },
            right: { style: "thin", color: { argb: "FFFFFFFF" } },
          };
        });

        // Add data rows with proper data types and formatting
        tableData.forEach((rowData, rowIndex) => {
          const row = worksheet.addRow(rowData);
          row.height = 18;
          row.eachCell((cell, colNumber) => {
            const column = exportableColumns[colNumber - 1];
            const originalValue = data[rowIndex]?.[column?.key];
            
            // Preserve data types
            if (typeof originalValue === "number") {
              cell.value = originalValue;
              // Format numbers appropriately
              if (column?.key === "price" || column?.label?.toLowerCase().includes("price")) {
                cell.numFmt = "#,##0.00"; // Currency format
              } else {
                cell.numFmt = originalValue % 1 === 0 ? "#,##0" : "#,##0.00"; // Integer or decimal
              }
            } else if (typeof originalValue === "boolean") {
              cell.value = originalValue;
            }
            
            // Set cell alignment
            cell.alignment = {
              vertical: "middle",
              horizontal: typeof originalValue === "number" ? "right" : "left",
              wrapText: true,
            };
            
            // Set borders for data cells
            cell.border = {
              top: { style: "thin", color: { argb: "FFE5E7EB" } },
              bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
              left: { style: "thin", color: { argb: "FFE5E7EB" } },
              right: { style: "thin", color: { argb: "FFE5E7EB" } },
            };
            
            // Alternate row colors for better readability
            if (rowIndex % 2 === 0) {
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFF9FAFB" }, // Very light gray
              };
            }
          });
        });

        // Set column widths based on content
        exportableColumns.forEach((col, index) => {
          // Calculate width based on header and data
          let maxWidth = col.label.length;
          data.forEach((row) => {
            const value = getCellValue(row, col);
            if (value !== null && value !== undefined) {
              const valueLength = String(value).length;
              maxWidth = Math.max(maxWidth, valueLength);
            }
          });
          // Set width with padding (min 12, max 50)
          worksheet.getColumn(index + 1).width = Math.min(Math.max(maxWidth + 3, 12), 50);
        });

        // Freeze header row (row 3, after title and empty row)
        worksheet.views = [
          {
            state: "frozen",
            ySplit: 2, // Freeze after row 2 (title + empty row)
            topLeftCell: "A3", // Start from row 3 (headers)
            activeCell: "A3",
            showGridLines: true,
          },
        ];

        // Generate buffer and download
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${filename}.xlsx`;
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        // Fall back to basic xlsx (limited styling)
        const XLSX = ExcelJS;
        const exportData = data.map((row) => {
          const exportRow = {};
          exportableColumns.forEach((col) => {
            const value = getCellValue(row, col);
            // Preserve data types where possible
            if (value === null || value === undefined) {
              exportRow[col.label] = "";
            } else if (typeof value === "number") {
              exportRow[col.label] = value;
            } else if (typeof value === "boolean") {
              exportRow[col.label] = value;
            } else {
              exportRow[col.label] = String(value);
            }
          });
          return exportRow;
        });

        // Build sheet from scratch with title, headers, and data
        const titleRow = [displayTitle];
        // Extend title to span all columns
        for (let i = 1; i < exportableColumns.length; i++) {
          titleRow.push("");
        }
        const emptyRow = new Array(exportableColumns.length).fill("");
        const headerRow = [exportableColumns.map(col => col.label)];
        const dataRows = tableData;
        
        // Combine all rows: title, empty, headers, data
        const allRows = [titleRow, emptyRow, ...headerRow, ...dataRows];
        
        // Create worksheet from array of arrays
        const worksheet = XLSX.utils.aoa_to_sheet(allRows);
        
        // Calculate proper column widths
        const colWidths = exportableColumns.map((col) => {
          let maxWidth = Math.max(col.label.length, displayTitle.length);
          data.forEach((row) => {
            const value = getCellValue(row, col);
            if (value !== null && value !== undefined) {
              const valueLength = String(value).length;
              maxWidth = Math.max(maxWidth, valueLength);
            }
          });
          return { wch: Math.min(Math.max(maxWidth + 3, 12), 50) };
        });
        worksheet["!cols"] = colWidths;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        XLSX.writeFile(workbook, `${filename}.xlsx`);
      }
      
      if (onExport) {
        onExport("excel", filename);
      }
      
      setShowMenu(false);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert("Failed to export to Excel. Please try again.");
    }
  };

  const handleExportPDF = async () => {
    try {
      // Try to dynamically import jspdf library
      let jsPDF, autoTable;
      
      try {
        const jsPDFModule = await import("jspdf");
        // jspdf v4 exports jsPDF as default or named export
        jsPDF = jsPDFModule.default || jsPDFModule.jsPDF || jsPDFModule;
        
        if (!jsPDF) {
          throw new Error("jsPDF not found in module");
        }
      } catch (error) {
        console.error("Failed to import jspdf:", error);
        alert("PDF export library not installed. Please install 'jspdf' and 'jspdf-autotable' packages.\n\nAlternatively, you can export as CSV which doesn't require additional libraries.");
        return;
      }
      
      try {
        const autoTableModule = await import("jspdf-autotable");
        // jspdf-autotable exports as default or named export
        autoTable = autoTableModule.default || autoTableModule;
        
        if (!autoTable) {
          throw new Error("autoTable not found in module");
        }
      } catch (error) {
        console.error("Failed to import jspdf-autotable:", error);
        alert("PDF export library not installed. Please install 'jspdf' and 'jspdf-autotable' packages.\n\nAlternatively, you can export as CSV which doesn't require additional libraries.");
        return;
      }

      // Prepare data for export using exportable columns only
      const tableData = data.map((row) =>
        exportableColumns.map((col) => {
          const value = getCellValue(row, col);
          // Format values for better display
          if (value === null || value === undefined) return "";
          if (typeof value === "number") {
            // Format numbers with commas, preserve decimals
            if (col.key === "price" || col.label?.toLowerCase().includes("price")) {
              return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }
            return value.toLocaleString("en-US");
          }
          if (typeof value === "boolean") {
            return value ? "Yes" : "No";
          }
          if (typeof value === "object") {
            try {
              return JSON.stringify(value);
            } catch {
              return String(value);
            }
          }
          return String(value);
        })
      );

      const tableHeaders = exportableColumns.map((col) => col.label);

      // Create PDF with landscape orientation for better table display
      // Handle both jspdf v3 and v4 APIs
      let doc;
      try {
        if (typeof jsPDF === "function") {
          // jspdf v3 API - direct function call
          doc = new jsPDF("l", "mm", "a4");
        } else if (jsPDF.jsPDF && typeof jsPDF.jsPDF === "function") {
          // jspdf v4 API - named export
          doc = new jsPDF.jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
        } else {
          // Try default export or direct use
          const PDF = jsPDF.default || jsPDF;
          if (typeof PDF === "function") {
            // Try v3 API first
            try {
              doc = new PDF("l", "mm", "a4");
            } catch {
              // Fall back to v4 API
              doc = new PDF({ orientation: "landscape", unit: "mm", format: "a4" });
            }
          } else {
            throw new Error("Cannot create PDF instance");
          }
        }
      } catch (error) {
        console.error("Error creating PDF:", error);
        alert("Failed to create PDF document. Please try again.");
        return;
      }
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;
      const titleY = margin + 10;
      
      // Add title at top left
      doc.setFontSize(18);
      doc.setFont(undefined, "bold");
      doc.setTextColor(37, 99, 235); // Primary blue
      doc.text(displayTitle, margin, titleY);
      
      // Add date/time stamp at top right
      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      doc.setTextColor(100, 100, 100);
      const dateTime = new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      const dateTimeWidth = doc.getTextWidth(dateTime);
      doc.text(dateTime, pageWidth - margin - dateTimeWidth, titleY);
      
      // Add total records count below title
      doc.text(`Total Records: ${data.length}`, margin, titleY + 5);
      
      // Add table with professional styling
      autoTable(doc, {
        head: [tableHeaders],
        body: tableData,
        startY: titleY + 12,
        margin: { top: titleY + 12, right: margin, bottom: margin, left: margin },
        styles: {
          fontSize: 8,
          cellPadding: 2.5,
          overflow: "linebreak",
          cellWidth: "wrap",
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [37, 99, 235], // Primary blue color
          textColor: [255, 255, 255], // White text
          fontStyle: "bold",
          fontSize: 9,
          cellPadding: 3,
          halign: "center",
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245], // Light gray for alternate rows
        },
        columnStyles: exportableColumns.reduce((acc, col, index) => {
          // Calculate appropriate column width based on content
          let maxContentLength = col.label.length;
          data.forEach((row) => {
            const value = getCellValue(row, col);
            if (value !== null && value !== undefined) {
              const valueLength = String(value).length;
              maxContentLength = Math.max(maxContentLength, valueLength);
            }
          });
          // Set column width (min 20mm, max 60mm)
          acc[index] = { 
            cellWidth: Math.min(Math.max(maxContentLength * 1.5, 20), 60)
          };
          return acc;
        }, {}),
        didDrawPage: (data) => {
          // Add page numbers
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          const pageCount = doc.internal.getNumberOfPages();
          for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            const pageText = `Page ${i} of ${pageCount}`;
            const pageTextWidth = doc.getTextWidth(pageText);
            doc.text(
              pageText,
              pageWidth - margin - pageTextWidth,
              pageHeight - margin
            );
          }
        },
        tableWidth: "auto",
        showHead: "everyPage",
      });

      // Save PDF
      doc.save(`${filename}.pdf`);
      
      if (onExport) {
        onExport("pdf", filename);
      }
      
      setShowMenu(false);
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      alert("Failed to export to PDF. Please try again.");
    }
  };

  const handleExportCSV = () => {
    try {
      // Prepare CSV data using exportable columns only
      const headers = exportableColumns.map((col) => {
        // Escape header if it contains comma or quote
        const header = col.label;
        if (header.includes(",") || header.includes('"')) {
          return `"${header.replace(/"/g, '""')}"`;
        }
        return header;
      }).join(",");
      
      const rows = data.map((row) =>
        exportableColumns.map((col) => {
          const value = getCellValue(row, col);
          // Handle null/undefined
          if (value === null || value === undefined) return "";
          
          // Convert to string
          const stringValue = typeof value === "object" 
            ? JSON.stringify(value) 
            : String(value);
          
          // Escape commas and quotes in CSV
          if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }).join(",")
      );

      // Add title as first row in CSV
      const titleRow = `"${displayTitle}"`;
      const csvContent = [titleRow, headers, ...rows].join("\n");
      
      // Add BOM for Excel UTF-8 compatibility
      const BOM = "\uFEFF";
      const blob = new Blob([BOM + csvContent], { 
        type: "text/csv;charset=utf-8;" 
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      if (onExport) {
        onExport("csv", filename);
      }
      
      setShowMenu(false);
    } catch (error) {
      console.error("Error exporting to CSV:", error);
      alert("Failed to export to CSV. Please try again.");
    }
  };

  return (
    <div
      className="relative inline-block"
      onMouseLeave={() => setShowMenu(false)}
      {...props}
    >
      <CommonButton
        type="button"
        action="export"
        variant="secondary"
        size="sm"
        onClick={() => setShowMenu(!showMenu)}
        onMouseEnter={() => setShowMenu(true)}
      >
        Export
      </CommonButton>

      {showMenu && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-48 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
          <button
            type="button"
            className="flex w-full items-center gap-2 border-b border-slate-200 bg-transparent px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            onClick={handleExportExcel}
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            <span>Export to Excel</span>
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 border-b border-slate-200 bg-transparent px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            onClick={handleExportPDF}
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            <span>Export to PDF</span>
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 bg-transparent px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            onClick={handleExportCSV}
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            <span>Export to CSV</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default CommonExport;

