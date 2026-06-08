import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "@core/theme";
import { CommonHeading } from "@shared/components/CommonHeading";
import { CommonDataGrid } from "@shared/components/CommonDataGrid";
import CommonLoader from "@shared/components/CommonLoader";
import {
  clearError,
  uploadInventoryExcel,
} from "@core/store/slices/StorePage/storePageSlice";
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import UploadIcon from "@mui/icons-material/Upload";
import DescriptionIcon from "@mui/icons-material/Description";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import CommonImport from "@shared/components/CommonImport";
import { Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useToast } from "@shared/hooks/useToast";
import { ToastContainer } from "@shared/components/Toast";
import AddIcon from "@mui/icons-material/Add";
import { createWarehouse, fetchWarehouseItemCodeList, fetchWarehouseList } from "@core/store/slices/WarehousePage/warehousePageSlice";

function WarehousePage() {
  const theme = useTheme();
  const dispatch = useDispatch();

  //   const warehousePageData = useSelector(selectInventoryStock);
  //   const loading = useSelector(selectInventoryLoading);
  //   const pagination = useSelector(selectInventoryPagination);

  const {
    warehouseList: warehousePageData,
    loading,
    pagination,
    error,
  } = useSelector((state) => state.warehouse);

  const { stockIssuesItemList } = useSelector((state) => state.stockIssues);

  const [warehouseCode, setWarehouseCode] = useState("");
  const [warehouseName, setWarehouseName] = useState("");
  const [page, setPage] = useState(1);
  const [warehouseCodeOptions, setWarehouseCodeOptions] = useState([]);
  const [warehouseNameOptions, setWarehouseNameOptions] = useState([]);
  const [openImportDialog, setOpenImportDialog] = useState(false);
  const [rows, setRows] = useState([]);

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [plantCodeOptions, setPlantCodeOptions] = useState([]);

  const [formData, setFormData] = useState({
    plant_code: "",
    warehouse_code: "",
    warehouse_name: "",
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const { toasts, showError, showSuccess, removeToast } = useToast();

  const emptyToDash = (v) => (v == null || v === "" ? "–" : v);

  useEffect(() => {
    if (error) {
      const errorMessage =
        typeof error === "string"
          ? error
          : error?.message ||
            error?.payload?.message ||
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            "An error occurred. Please try again.";
      showError(errorMessage);
      dispatch(clearError());
    }
  }, [error, showError, dispatch]);

  useEffect(() => {
    if (warehousePageData?.length) {
      if (page === 1) {
        setRows(warehousePageData);
      } else {
        setRows((prev) => [...prev, ...warehousePageData]);
      }
    }
  }, [warehousePageData]);

  useEffect(() => {
    dispatch(
      fetchWarehouseItemCodeList({
        page_size: "all",
      }),
    ).then((res) => {
      const items = res?.payload || [];
      const warehouseCodes = items.map((item) => item.warehouse_code);
      const warehouseNames = items.map((item) => item.warehouse_name);

      setWarehouseCodeOptions(warehouseCodes);
      setWarehouseNameOptions(warehouseNames);

    });
  }, [dispatch]);

    useEffect(()=>{
        const plantCodeOptionsList = stockIssuesItemList.map(
          (item) => item.plant_code,
        );
  
        setPlantCodeOptions(plantCodeOptionsList);
    },[stockIssuesItemList])

  useEffect(() => {
    dispatch(
      fetchWarehouseList({
        page,
        plant_code: warehouseCode || undefined,
        plant_name: warehouseName || undefined,
      }),
    );
  }, [dispatch, page, warehouseCode, warehouseName]);

  const warehouseColumns = [
    {
      key: "warehouse_code",
      label: "Warehouse Code",
      headerAlign: "center",
      render: (val) => (
        <div style={{ textAlign: "center" }}>{emptyToDash(val)}</div>
      ),
    },
    {
      key: "warehouse_name",
      label: "Warehouse Name",
      headerAlign: "center",
      render: (val) => (
        <div style={{ textAlign: "center" }}>{emptyToDash(val)}</div>
      ),
    },
    {
      key: "plant_code_display",
      label: "Plant Code",
      headerAlign: "center",
      render: (val) => (
        <div style={{ textAlign: "center" }}>{emptyToDash(val)}</div>
      ),
    },
    // {
    //   key: "available_qty",
    //   label: "Available Qty",
    //   headerAlign: "center",
    //   render: (val) => (
    //     <div style={{ textAlign: "center" }}>{emptyToDash(val)}</div>
    //   ),
    // },
    
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
        product_id: "",
        store_id: "",
        quantity: "",
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
    showSuccess("Template Downloaded Successfully");
  };

  const handleDownloadInventory = () => {
    const worksheet = XLSX.utils.json_to_sheet(warehousePageData);

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
    showSuccess("Data Downloaded Successfully");
  };

  const handleUploadFiles = async () => {
    try {
      setUploading(true);

      await dispatch(uploadInventoryExcel(selectedFiles[0])).unwrap();
      showSuccess("Inventory Uploaded Successfully");

      setUploading(false);
      setOpenImportDialog(false);
    } catch (err) {
      const errorMessage =
        err?.message ||
        err?.payload?.message ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to delete breakdown. Please try again.";
      showError(errorMessage);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleWarehouse = async () => {
    try {
      await dispatch(createWarehouse(formData)).unwrap();

      showSuccess("Stock Issue Added Successfully");

      setOpenAddDialog(false);

      setFormData({
        plant: "",
        warehouse_code: "",
        warehouse_name: "",
      });

      setPage(1);

      dispatch(fetchWarehouseList({ page: 1 }));
    } catch (err) {
      showError(err?.message || "Failed to create stock issue");
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CommonHeading
        title="Warehouse List"
        rightContent={
          <Grid
            container
            spacing={2}
            alignItems="center"
            justifyContent="flex-end"
            sx={{ width: "100%" }}
          >
            {/* Warehouse Code Filter */}
            <Grid item xs={12} sm={6} md="auto">
              <FormControl
                size="small"
                sx={{ minWidth: { xs: "100%", sm: 220 } }}
                fullWidth
              >
                <InputLabel>Warehouse Code</InputLabel>
                <Select
                  label="Warehouse Code"
                  value={warehouseCode}
                  onChange={(event) => {
                    const value = event.target.value || "";
                    setWarehouseCode(value);
                    setPage(1);
                    setRows([]);
                  }}
                >
                  <MenuItem value="">
                    <em>All</em>
                  </MenuItem>
                  {warehouseCodeOptions.map((code) => (
                    <MenuItem key={code} value={code}>
                      {code}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Warehouse Name Filter */}
            <Grid item xs={12} sm={6} md="auto">
              <FormControl
                size="small"
                sx={{ minWidth: { xs: "100%", sm: 220 } }}
                fullWidth
              >
                <InputLabel>Warehouse Name</InputLabel>
                <Select
                  label="Warehouse Name"
                  value={warehouseName}
                  onChange={(event) => {
                    const value = event.target.value || "";
                    setWarehouseName(value);
                    setPage(1);
                    setRows([]);
                  }}
                >
                  <MenuItem value="">
                    <em>All</em>
                  </MenuItem>
                  {warehouseNameOptions.map((name) => (
                    <MenuItem key={name} value={name}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Template Download */}
            <Grid item xs={4} sm="auto">
              <button
                onClick={handleDownloadTemplate}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                <DescriptionIcon fontSize="small" />
                Template
              </button>
            </Grid>

            {/* Upload */}
            {/* <Grid item xs={4} sm="auto">
              <button
                onClick={() => setOpenImportDialog(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                <UploadIcon fontSize="small" />
                Upload
              </button>
            </Grid> */}

            <Grid item xs={4} sm="auto">
              <button
                onClick={() => setOpenAddDialog(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                <AddIcon fontSize="small" />
                Add
              </button>
            </Grid>

            {/* Download */}
            <Grid item xs={4} sm="auto">
              <button
                onClick={handleDownloadInventory}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                <DownloadIcon fontSize="small" />
                Download
              </button>
            </Grid>
          </Grid>
        }
      />

      {/* Inventory Table */}
      <div
        style={{
          marginTop: theme.spacing.lg,
          backgroundColor: theme.colors.background.primary,
          borderRadius: theme.borderRadius.lg,
          boxShadow: theme.shadows.md,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
        }}
      >
        <CommonDataGrid
          columns={warehouseColumns}
          data={rows}
          showSearch={false}
          showPagination={true}
        //   stickyHeader
        //   serverPagination
        //   infiniteScroll
        //   loading={loading}
        //   hasMore={Boolean(pagination?.next)}
        //   onLoadMore={() => setPage((p) => p + 1)}
          page={pagination.current_page}
          serverPagination
          totalCount={pagination.count}
          onPageChange={(newPage) => {
            const pageSize = pagination?.pageSize || 10;
            dispatch(
              fetchWarehouseList({
                page: newPage,
                pageSize,
              }),
            );
          }}
          onPageSizeChange={(newPageSize) => {
            dispatch(
              fetchWarehouseList({
                page: 1,
                pageSize: newPageSize,
              }),
            );
          }}
        />

        {/* {loading && (
          <div
            style={{
              padding: theme.spacing.xl,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <CommonLoader message="Loading inventory..." size="md" />
          </div>
        )} */}
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
          <CommonImport onFilesChange={setSelectedFiles} />

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 20,
              gap: 10,
            }}
          >
            <button
              onClick={() => setOpenImportDialog(false)}
              style={{
                padding: "8px 16px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>

            <button
              // disabled={!selectedFiles.length || uploading}
              onClick={handleUploadFiles}
              style={{
                padding: "8px 16px",
                background: "#1976d2",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                borderRadius: 4,
              }}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Add Store
          <IconButton onClick={() => setOpenAddDialog(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={2} style={{ marginTop: 10 }}>
            <Grid item xs={12}>
              <FormControl size="small" fullWidth>
                <InputLabel>Plant Code</InputLabel>
                <Select
                  label="Plant Code"
                  value={formData.plant_code}
                  onChange={(event) => {
                    const value = event.target.value || "";
                    setFormData((prev) => ({
                      ...prev,
                      plant_code: value,
                    }));
                  }}
                >
                  {plantCodeOptions.map((code) => (
                    <MenuItem key={code} value={code}>
                      {code}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Warehouse Code"
                name="warehouse_code"
                value={formData.warehouse_code}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Warehouse Name"
                name="warehouse_name"
                value={formData.warehouse_name}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
          </Grid>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 20,
              gap: 10,
            }}
          >
            <button
              onClick={() => setOpenAddDialog(false)}
              style={{ padding: "8px 16px", cursor: "pointer" }}
            >
              Cancel
            </button>

            <button
              onClick={handleWarehouse}
              style={{
                padding: "8px 16px",
                background: "#1976d2",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                borderRadius: 4,
              }}
            >
              Save
            </button>
          </div>
        </DialogContent>
      </Dialog>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default WarehousePage;
