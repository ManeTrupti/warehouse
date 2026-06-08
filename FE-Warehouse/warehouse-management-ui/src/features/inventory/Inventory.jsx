import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "@core/theme";
import { CommonHeading } from "@shared/components/CommonHeading";
import { CommonDataGrid } from "@shared/components/CommonDataGrid";
import CommonLoader from "@shared/components/CommonLoader";
import {
  fetchInventoryItemCodes,
  fetchInventoryStocks,
} from "@core/store/slices/Inventory/inventorySlice";
import { Autocomplete, TextField } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import UploadIcon from "@mui/icons-material/Upload";
import DescriptionIcon from "@mui/icons-material/Description";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import CommonImport from "@shared/components/CommonImport";
import { Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

function InventoryPage() {
  const theme = useTheme();
  const dispatch = useDispatch();

    // const inventoryData = useSelector(selectInventoryStock);
    // const loading = useSelector(selectInventoryLoading);
    // const pagination = useSelector(selectInventoryPagination);

  const {
    inventoryStock: inventoryData,
    loading,
    pagination,
    error,
  } = useSelector((state) => state.inventory);

  const [itemCode, setItemCode] = useState("");
  const [page, setPage] = useState(1);
  const [itemOptions, setItemOptions] = useState([]);
  const [openImportDialog, setOpenImportDialog] = useState(false);

  const emptyToDash = (v) => (v == null || v === "" ? "–" : v);

  useEffect(() => {
    dispatch(
      fetchInventoryItemCodes({
        page: 1,
        page_size: "all",
      }),
    ).then((res) => {
      const items = res?.payload || [];
      const codes = items.map((item) => item.item_code);
      setItemOptions(codes);
    });
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchInventoryStocks({
        page,
        item_code: itemCode || undefined,
      }),
    );
  }, [dispatch, page, itemCode]);

  const inventoryColumns = [
    {
      key: "item_code",
      label: "Item Code",
      headerAlign: "center",
      render: (val) => (
        <div style={{ textAlign: "center" }}>{emptyToDash(val)}</div>
      ),
    },
    {
      key: "total_qty",
      label: "Total Qty",
      headerAlign: "center",
      render: (val) => (
        <div style={{ textAlign: "center" }}>{emptyToDash(val)}</div>
      ),
    },
    {
      key: "reserved_qty",
      label: "Reserved Qty",
      headerAlign: "center",
      render: (val) => (
        <div style={{ textAlign: "center" }}>{emptyToDash(val)}</div>
      ),
    },
    {
      key: "available_qty",
      label: "Available Qty",
      headerAlign: "center",
      render: (val) => (
        <div style={{ textAlign: "center" }}>{emptyToDash(val)}</div>
      ),
    },
    {
      key: "created_on",
      label: "Created On",
      headerAlign: "center",
      render: (val) => (
        <div style={{ textAlign: "center" }}>
          {new Date(val).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: "updated_on",
      label: "Updated On",
      headerAlign: "center",
      render: (val) => (
        <div style={{ textAlign: "center" }}>
          {new Date(val).toLocaleDateString()}
        </div>
      ),
    },
  ];

  const filterBarStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
    backgroundColor: "#f5f5f5",
  };

  const inputStyle = {
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.gray[300]}`,
    fontSize: theme.typography.fontSize.sm[0],
    minWidth: "200px",
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        item_code: "",
        reserved_quantity: "",
        total_quantity: "",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory Template");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "inventory_template.xlsx");
  };

  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(sheet);

      console.log("Uploaded Data:", jsonData);

      // send to API here if needed
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDownloadInventory = () => {
    const worksheet = XLSX.utils.json_to_sheet(inventoryData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "inventory_data.xlsx");
  };

  return (
    <div style={{ paddingBottom: theme.spacing.xl }}>
      <CommonHeading
        title="Inventory Stock"
        subtitle="View available inventory items"
        rightContent={
          <>
            {/* Filter Bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: theme.spacing.md,
              }}
            >
              <Autocomplete
                freeSolo
                options={itemOptions}
                value={itemCode}
                onChange={(event, newValue) => {
                  setItemCode(newValue || "");
                  setPage(1);
                }}
                onInputChange={(event, newInputValue) => {
                  setItemCode(newInputValue || "");
                  setPage(1);
                }}
                sx={{ minWidth: 250 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Search or select Item Code"
                    size="small"
                  />
                )}
              />

              {/* Template Download */}
              <button
                onClick={handleDownloadTemplate}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  cursor: "pointer",
                }}
              >
                <DescriptionIcon fontSize="small" />
                Template
              </button>

              {/* Upload */}
              <button
                onClick={() => setOpenImportDialog(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  cursor: "pointer",
                }}
              >
                <UploadIcon fontSize="small" />
                Upload
              </button>

              {/* Download Data */}
              <button
                onClick={handleDownloadInventory}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  cursor: "pointer",
                }}
              >
                <DownloadIcon fontSize="small" />
                Download
              </button>
            </div>
          </>
        }
      />

      {/* Inventory Table */}
      <div
        style={{
          marginTop: theme.spacing.lg,
          backgroundColor: theme.colors.background.primary,
          borderRadius: theme.borderRadius.lg,
          boxShadow: theme.shadows.md,
          overflow: "hidden",
        }}
      >
        {loading && (
          <div
            style={{
              padding: theme.spacing.xl,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <CommonLoader message="Loading inventory..." size="md" />
          </div>
        )}

        <CommonDataGrid
          columns={inventoryColumns}
          data={inventoryData}
          showSearch={false}
          page={pagination.current_page}
          serverPagination
          totalCount={pagination.count}
          onPageChange={(newPage) => {
            const pageSize = pagination?.pageSize || 10;
            dispatch(
              fetchInventoryStocks({
                page: newPage,
                pageSize,
              }),
            );
          }}
          onPageSizeChange={(newPageSize) => {
            dispatch(
              fetchInventoryStocks({
                page: 1,
                pageSize: newPageSize,
              }),
            );
          }}
        />
      </div>
      <Dialog
        open={openImportDialog}
        onClose={() => setOpenImportDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Import Inventory
          <IconButton onClick={() => setOpenImportDialog(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <CommonImport />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default InventoryPage;
