import { useState, useRef } from "react";
import { useTheme } from "@core/theme";
import {
  ArrowUpTrayIcon,
  XMarkIcon,
  DocumentIcon,
  PhotoIcon,
  DocumentTextIcon,
  EyeIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

// Separate component for file item to handle hover state
function FileItem({
  file,
  index,
  FileIcon,
  handlePreview,
  handleRemoveFile,
  formatFileSize,
}) {
  return (
    <div
      className="flex items-center justify-between rounded-md border border-slate-200 p-3 transition hover:border-blue-500 hover:shadow-sm"
    >
      <div className="flex flex-1 items-center gap-2">
        <FileIcon
          className="h-6 w-6 shrink-0 text-blue-600"
        />
        <div className="min-w-0 flex-1">
          <p
            className="m-0 truncate text-sm font-medium text-slate-900"
            title={file.name}
          >
            {file.name}
          </p>
          <p className="m-0 text-xs text-slate-500">
            {formatFileSize(file.size)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handlePreview(file);
          }}
          className="rounded bg-blue-50 p-1 text-blue-600 transition hover:bg-blue-100"
          title="Preview"
        >
          <EyeIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleRemoveFile(index);
          }}
          className="rounded bg-red-50 p-1 text-red-600 transition hover:bg-red-100"
          title="Delete"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function CommonImport({
  onFilesChange,
  accept = "*/*",
  multiple = false,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB default
  ...props
}) {
  const theme = useTheme();
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [fileContents, setFileContents] = useState({});
  const [loadingPreview, setLoadingPreview] = useState(false);
  const fileInputRef = useRef(null);

  const getFileIcon = (file) => {
    const type = file.type || "";
    if (type.startsWith("image/")) {
      return PhotoIcon;
    } else if (type.includes("pdf")) {
      return DocumentTextIcon;
    } else {
      return DocumentIcon;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const validateFile = (file) => {
    if (file.size > maxSize) {
      alert(`File "${file.name}" exceeds maximum size of ${formatFileSize(maxSize)}`);
      return false;
    }
    return true;
  };

  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList).filter(validateFile);
    
    if (multiple) {
      const updatedFiles = [...files, ...newFiles].slice(0, maxFiles);
      setFiles(updatedFiles);
      // Notify parent about file changes (for display purposes)
      if (onFilesChange) {
        onFilesChange(updatedFiles);
      }
    } else {
      if (newFiles.length > 0) {
        setFiles([newFiles[0]]);
        // Notify parent about file changes (for display purposes)
        if (onFilesChange) {
          onFilesChange([newFiles[0]]);
        }
      }
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
    // Reset input to allow selecting the same file again
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemoveFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    if (onFilesChange) {
      onFilesChange(updatedFiles);
    }
  };


  const handleClosePreview = () => {
    setPreviewFile(null);
  };

  const getFilePreviewUrl = (file) => {
    if (file.type?.startsWith("image/")) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  // Helper function to safely import optional dependencies
  const safeImport = async (moduleName) => {
    try {
      const importFunc = new Function("moduleName", "return import(moduleName)");
      return await importFunc(moduleName);
    } catch (error) {
      return null;
    }
  };

  const canPreviewContent = (file) => {
    const type = file.type || "";
    const name = file.name.toLowerCase();
    // Can preview content for images, text files, CSV, Excel, PDF, and some document types
    return (
      type.startsWith("image/") ||
      type.startsWith("text/") ||
      name.endsWith(".csv") ||
      name.endsWith(".txt") ||
      name.endsWith(".json") ||
      name.endsWith(".xlsx") ||
      name.endsWith(".xls") ||
      name.endsWith(".pdf") ||
      type.includes("pdf")
    );
  };

  const isExcelFile = (file) => {
    const name = file.name.toLowerCase();
    return name.endsWith(".xlsx") || name.endsWith(".xls");
  };

  const isPDFFile = (file) => {
    const type = file.type || "";
    const name = file.name.toLowerCase();
    return type.includes("pdf") || name.endsWith(".pdf");
  };

  const readExcelFile = async (file) => {
    try {
      // Try to import xlsx library
      const XLSXModule = await safeImport("xlsx");
      if (!XLSXModule) {
        return null;
      }
      
      const XLSX = XLSXModule.default || XLSXModule;
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            
            // Get the first sheet
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Convert to JSON with header row
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
            
            // Get headers (first row)
            const headers = jsonData[0] || [];
            // Get data rows (rest of the rows)
            const rows = jsonData.slice(1);
            
            resolve({ headers, rows, sheetName: firstSheetName });
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      });
    } catch (error) {
      console.error("Error reading Excel file:", error);
      return null;
    }
  };

  const readFileContent = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      
      if (file.type?.startsWith("text/") || file.name.endsWith(".csv") || file.name.endsWith(".txt") || file.name.endsWith(".json")) {
        reader.readAsText(file);
      } else if (file.type?.startsWith("image/")) {
        reader.readAsDataURL(file);
      } else {
        resolve(null);
      }
    });
  };

  const handlePreview = async (file) => {
    setLoadingPreview(true);
    try {
      if (file.type?.startsWith("image/")) {
        setPreviewFile(file);
        setLoadingPreview(false);
        return;
      }

      // For PDF files, create object URL for preview
      if (isPDFFile(file)) {
        if (!fileContents[file.name]) {
          const pdfUrl = URL.createObjectURL(file);
          setFileContents((prev) => ({ ...prev, [file.name]: { pdfUrl, type: "pdf" } }));
        }
        setPreviewFile(file);
        setLoadingPreview(false);
        return;
      }

      // For Excel files, read and parse
      if (isExcelFile(file)) {
        if (!fileContents[file.name]) {
          const excelData = await readExcelFile(file);
          if (excelData) {
            setFileContents((prev) => ({ ...prev, [file.name]: excelData }));
          } else {
            setFileContents((prev) => ({ ...prev, [file.name]: { error: "Unable to read Excel file. Please ensure the file is not corrupted." } }));
          }
        }
        setPreviewFile(file);
        setLoadingPreview(false);
        return;
      }

      // For text-based files, read the content
      if (canPreviewContent(file)) {
        if (!fileContents[file.name]) {
          const content = await readFileContent(file);
          setFileContents((prev) => ({ ...prev, [file.name]: content }));
        }
      }
      setPreviewFile(file);
    } catch (error) {
      console.error("Error reading file:", error);
      setFileContents((prev) => ({ ...prev, [file.name]: { error: "Failed to preview file. Please try again." } }));
      setPreviewFile(file);
    } finally {
      setLoadingPreview(false);
    }
  };

  return (
    <div className="space-y-3" {...props}>
      <div
        className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition ${
          isDragging ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50 hover:border-blue-400"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <ArrowUpTrayIcon
          className="mx-auto mb-2 h-8 w-8 text-blue-600"
        />
        <p className="m-0 font-medium text-slate-900">
          {isDragging ? "Drop files here" : "Click to upload or drag and drop"}
        </p>
        <p className="m-0 text-sm text-slate-500">
          {multiple ? `Up to ${maxFiles} files` : "Single file"} (Max {formatFileSize(maxSize)})
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="m-0 mb-2 text-sm font-medium text-slate-900">
            Selected Files ({files.length}):
          </p>
          {files.map((file, index) => (
            <FileItem
              key={index}
              file={file}
              index={index}
              FileIcon={getFileIcon(file)}
              handlePreview={handlePreview}
              handleRemoveFile={handleRemoveFile}
              formatFileSize={formatFileSize}
            />
          ))}
        </div>
      )}

      {previewFile && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4"
          onClick={handleClosePreview}
        >
          <div
            className="relative max-h-[90vh] w-[90vw] overflow-hidden rounded-lg bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-between border-b border-slate-200 bg-slate-50 p-4"
            >
              <h3 className="m-0 text-lg font-semibold text-slate-900">
                {previewFile.name}
              </h3>
              <button
                type="button"
                onClick={handleClosePreview}
                className="rounded p-1 text-slate-500 hover:bg-slate-200"
                title="Close"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div
              className="max-h-[calc(90vh-80px)] overflow-auto p-6"
            >
              {loadingPreview ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: theme.spacing["2xl"],
                  }}
                >
                  <p style={{ color: theme.colors.text.secondary }}>Loading preview...</p>
                </div>
              ) : previewFile.type?.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(previewFile)}
                  alt={previewFile.name}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "calc(90vh - 120px)",
                    borderRadius: theme.borderRadius.md,
                    display: "block",
                    margin: "0 auto",
                  }}
                />
              ) : fileContents[previewFile.name]?.type === "pdf" && fileContents[previewFile.name]?.pdfUrl ? (
                // PDF file preview
                <div
                  style={{
                    width: "100%",
                    height: "calc(90vh - 120px)",
                    border: `1px solid ${theme.colors.gray[200]}`,
                    borderRadius: theme.borderRadius.md,
                    overflow: "hidden",
                    backgroundColor: theme.colors.gray[100],
                  }}
                >
                  <iframe
                    src={fileContents[previewFile.name].pdfUrl}
                    title={previewFile.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      border: "none",
                    }}
                  />
                </div>
              ) : fileContents[previewFile.name]?.headers ? (
                // Excel file preview
                <div
                  style={{
                    backgroundColor: theme.colors.background.secondary,
                    padding: theme.spacing.md,
                    borderRadius: theme.borderRadius.md,
                    maxHeight: "calc(90vh - 120px)",
                    overflow: "auto",
                    border: `1px solid ${theme.colors.gray[200]}`,
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      marginBottom: theme.spacing.md,
                      fontSize: theme.typography.fontSize.sm[0],
                      fontWeight: theme.typography.fontWeight.medium,
                      color: theme.colors.text.primary,
                    }}
                  >
                    Sheet: {fileContents[previewFile.name].sheetName}
                  </p>
                  <div style={{ overflowX: "auto" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: theme.typography.fontSize.sm[0],
                        backgroundColor: theme.colors.background.primary,
                      }}
                    >
                      <thead>
                        <tr>
                          {fileContents[previewFile.name].headers.map((header, idx) => (
                            <th
                              key={idx}
                              style={{
                                padding: theme.spacing.sm,
                                backgroundColor: theme.colors.primary.DEFAULT,
                                color: theme.colors.text.inverse,
                                fontWeight: theme.typography.fontWeight.semibold,
                                textAlign: "left",
                                border: `1px solid ${theme.colors.primary[600]}`,
                                position: "sticky",
                                top: 0,
                                zIndex: 1,
                              }}
                            >
                              {header || `Column ${idx + 1}`}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {fileContents[previewFile.name].rows.slice(0, 100).map((row, rowIdx) => (
                          <tr
                            key={rowIdx}
                            style={{
                              backgroundColor: rowIdx % 2 === 0 ? theme.colors.background.primary : theme.colors.gray[50],
                            }}
                          >
                            {fileContents[previewFile.name].headers.map((_, colIdx) => (
                              <td
                                key={colIdx}
                                style={{
                                  padding: theme.spacing.sm,
                                  border: `1px solid ${theme.colors.gray[200]}`,
                                  color: theme.colors.text.primary,
                                }}
                              >
                                {row[colIdx] !== undefined && row[colIdx] !== null ? String(row[colIdx]) : ""}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {fileContents[previewFile.name].rows.length > 100 && (
                      <p
                        style={{
                          margin: theme.spacing.md,
                          fontSize: theme.typography.fontSize.sm[0],
                          color: theme.colors.text.secondary,
                          textAlign: "center",
                        }}
                      >
                        Showing first 100 rows of {fileContents[previewFile.name].rows.length} total rows
                      </p>
                    )}
                  </div>
                </div>
              ) : fileContents[previewFile.name]?.error ? (
                // Error message
                <div
                  style={{
                    backgroundColor: theme.colors.background.primary,
                    padding: theme.spacing.xl,
                    borderRadius: theme.borderRadius.lg,
                    textAlign: "center",
                  }}
                >
                  <DocumentIcon
                    style={{
                      width: "4rem",
                      height: "4rem",
                      color: theme.colors.error.DEFAULT,
                      marginBottom: theme.spacing.md,
                    }}
                  />
                  <p
                    style={{
                      color: theme.colors.text.primary,
                      margin: 0,
                      fontWeight: theme.typography.fontWeight.medium,
                    }}
                  >
                    {previewFile.name}
                  </p>
                  <p
                    style={{
                      color: theme.colors.error.DEFAULT,
                      margin: theme.spacing.sm,
                      fontSize: theme.typography.fontSize.sm[0],
                    }}
                  >
                    {fileContents[previewFile.name].error}
                  </p>
                  <p
                    style={{
                      color: theme.colors.text.secondary,
                      margin: 0,
                      fontSize: theme.typography.fontSize.xs[0],
                    }}
                  >
                    File size: {formatFileSize(previewFile.size)}
                  </p>
                </div>
              ) : typeof fileContents[previewFile.name] === "string" ? (
                // Text content preview
                <div
                  style={{
                    backgroundColor: theme.colors.background.secondary,
                    padding: theme.spacing.md,
                    borderRadius: theme.borderRadius.md,
                    fontFamily: theme.typography.fontFamily.mono.join(", "),
                    fontSize: theme.typography.fontSize.sm[0],
                    lineHeight: "1.5",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    maxHeight: "calc(90vh - 120px)",
                    overflow: "auto",
                    border: `1px solid ${theme.colors.gray[200]}`,
                  }}
                >
                  {fileContents[previewFile.name]}
                </div>
              ) : canPreviewContent(previewFile) ? (
                <div
                  style={{
                    backgroundColor: theme.colors.background.primary,
                    padding: theme.spacing.xl,
                    borderRadius: theme.borderRadius.lg,
                    textAlign: "center",
                  }}
                >
                  <DocumentIcon
                    style={{
                      width: "4rem",
                      height: "4rem",
                      color: theme.colors.text.secondary,
                      marginBottom: theme.spacing.md,
                    }}
                  />
                  <p
                    style={{
                      color: theme.colors.text.primary,
                      margin: 0,
                      fontWeight: theme.typography.fontWeight.medium,
                    }}
                  >
                    {previewFile.name}
                  </p>
                  <p
                    style={{
                      color: theme.colors.text.secondary,
                      margin: theme.spacing.sm,
                      fontSize: theme.typography.fontSize.sm[0],
                    }}
                  >
                    Loading preview...
                  </p>
                </div>
              ) : (
                // File information preview for unsupported types
                <div
                  style={{
                    backgroundColor: theme.colors.background.primary,
                    padding: theme.spacing.xl,
                    borderRadius: theme.borderRadius.lg,
                    textAlign: "center",
                  }}
                >
                  <DocumentIcon
                    style={{
                      width: "4rem",
                      height: "4rem",
                      color: theme.colors.primary.DEFAULT,
                      marginBottom: theme.spacing.md,
                    }}
                  />
                  <p
                    style={{
                      color: theme.colors.text.primary,
                      margin: 0,
                      marginBottom: theme.spacing.sm,
                      fontWeight: theme.typography.fontWeight.semibold,
                      fontSize: theme.typography.fontSize.lg[0],
                    }}
                  >
                    {previewFile.name}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: theme.spacing.xs,
                      alignItems: "center",
                      marginTop: theme.spacing.md,
                    }}
                  >
                    <p
                      style={{
                        color: theme.colors.text.secondary,
                        margin: 0,
                        fontSize: theme.typography.fontSize.sm[0],
                      }}
                    >
                      <strong>File Type:</strong> {previewFile.type || "Unknown"}
                    </p>
                    <p
                      style={{
                        color: theme.colors.text.secondary,
                        margin: 0,
                        fontSize: theme.typography.fontSize.sm[0],
                      }}
                    >
                      <strong>File Size:</strong> {formatFileSize(previewFile.size)}
                    </p>
                    <p
                      style={{
                        color: theme.colors.text.secondary,
                        margin: 0,
                        marginTop: theme.spacing.sm,
                        fontSize: theme.typography.fontSize.sm[0],
                        fontStyle: "italic",
                      }}
                    >
                      Content preview not available for this file type
                    </p>
                    <p
                      style={{
                        color: theme.colors.text.secondary,
                        margin: 0,
                        marginTop: theme.spacing.xs,
                        fontSize: theme.typography.fontSize.xs[0],
                      }}
                    >
                      You can still import this file
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CommonImport;

