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
import { FormControl, FormControlLabel, FormLabel, Grid, InputLabel, MenuItem, Radio, RadioGroup, Select, TextField } from "@mui/material";
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
import {
  createLocation,
  fetchLocationItemCodeList,
  fetchLocationList,
} from "@core/store/slices/LocationPage/locarionPageSlice";

function LocationPage() {
  const theme = useTheme();
  const dispatch = useDispatch();


  const {
    locationList: locationPageData,
    loading,
    pagination,
    error,
  } = useSelector((state) => state.location);

  const [locationCode, setLocationCode] = useState("");
  const [locationName, setLocationName] = useState("");
  const [page, setPage] = useState(1);
  const [locationCodeOptions, setLocationCodeOptions] = useState([]);
  const [locationNameOptions, setLocationNameOptions] = useState([]);
  const [openImportDialog, setOpenImportDialog] = useState(false);
  const [rows, setRows] = useState([]);

  const [openAddDialog, setOpenAddDialog] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    location_type: "store",
    is_active: true,
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
    if (locationPageData?.length) {
      if (page === 1) {
        setRows(locationPageData);
      } else {
        setRows((prev) => [...prev, ...locationPageData]);
      }
    }
  }, [locationPageData]);

  useEffect(() => {
    dispatch(
      fetchLocationItemCodeList({
        page_size: "all",
      }),
    ).then((res) => {
      const items = res?.payload || [];
      const locationCodes = items.map((item) => item.code);
      const locationNames = items.map((item) => item.name);

      setLocationCodeOptions(locationCodes);
      setLocationNameOptions(locationNames);
    });
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchLocationList({
        page,
        plant_code: locationCode || undefined,
        plant_name: locationName || undefined,
      }),
    );
  }, [dispatch, page, locationCode, locationName]);

  const locationColumns = [
    {
      key: "name",
      label: "Location Name",
      headerAlign: "center",
      render: (val) => (
        <div style={{ textAlign: "center" }}>{emptyToDash(val)}</div>
      ),
    },
    {
      key: "code",
      label: "Location Code",
      headerAlign: "center",
      render: (val) => (
        <div style={{ textAlign: "center" }}>{emptyToDash(val)}</div>
      ),
    },
    {
      key: "description",
      label: "Description",
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
    // {
    //   key: "updated_on",
    //   label: "Updated On",
    //   headerAlign: "center",
    //   render: (val) => (
    //     <div style={{ textAlign: "center" }}>
    //       {new Date(val).toLocaleDateString()}
    //     </div>
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
    const worksheet = XLSX.utils.json_to_sheet(locationPageData);

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

  const handleSaveLocation = async () => {
    try {
      await dispatch(createLocation(formData)).unwrap();

      showSuccess("Location  Added Successfully");

      setOpenAddDialog(false);

      setFormData({
        code: "",
        name: "",
        description: "",
        location_type: "",
        is_active: true,
      });

      setPage(1);

      dispatch(fetchLocationList({ page: 1 }));
    } catch (err) {
      showError(err?.message || "Failed to create stock issue");
    }
  };

  return (
    <div style={{ 
      width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
    }}>
      <CommonHeading
        title="Location List"
        rightContent={
          <Grid
            container
            spacing={2}
            alignItems="center"
            justifyContent="flex-end"
            sx={{ width: "100%" }}
          >
            {/* Location Code Filter */}
            <Grid item xs={12} sm={6} md="auto">
              <FormControl
                size="small"
                sx={{ minWidth: { xs: "100%", sm: 220 } }}
                fullWidth
              >
                <InputLabel>Location Code</InputLabel>
                <Select
                  label="Location Code"
                  value={locationCode}
                  onChange={(event) => {
                    const value = event.target.value || "";
                    setLocationCode(value);
                    setPage(1);
                    setRows([]);
                  }}
                >
                  <MenuItem value="">
                    <em>All</em>
                  </MenuItem>
                  {locationCodeOptions.map((code) => (
                    <MenuItem key={code} value={code}>
                      {code}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Location Name Filter */}
            <Grid item xs={12} sm={6} md="auto">
              <FormControl
                size="small"
                sx={{ minWidth: { xs: "100%", sm: 220 } }}
                fullWidth
              >
                <InputLabel>Location Name</InputLabel>
                <Select
                  label="Location Name"
                  value={locationName}
                  onChange={(event) => {
                    const value = event.target.value || "";
                    setLocationName(value);
                    setPage(1);
                    setRows([]);
                  }}
                >
                  <MenuItem value="">
                    <em>All</em>
                  </MenuItem>
                  {locationNameOptions.map((name) => (
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
    flex: 1,              // ✅ important
    display: "flex",      // ✅ important
    flexDirection: "column",
    overflow: "hidden",   // ✅ prevent outer scroll
  }}
>
        <CommonDataGrid
          columns={locationColumns}
          data={rows}
          showSearch={false}
          showPagination={true}
          // stickyHeader
          // serverPagination
          // infiniteScroll
          // loading={loading}
          // hasMore={Boolean(pagination?.next)}
          // onLoadMore={() => setPage((p) => p + 1)}
          page={pagination.current_page}
          serverPagination
          totalCount={pagination.count}
          onPageChange={(newPage) => {
            const pageSize = pagination?.pageSize || 10;
            dispatch(
              fetchLocationList({
                page: newPage,
                pageSize,
              }),
            );
          }}
          onPageSizeChange={(newPageSize) => {
            dispatch(
              fetchLocationList({
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
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: 600,
            pb: 1,
          }}
        >
          Add Location
          <IconButton size="small" onClick={() => setOpenAddDialog(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            pt: 0,
          }}
        >
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Location Code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Location Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Location Type"
                name="location_type"
                value={formData.location_type}
                onChange={handleChange}
                fullWidth
                select
                size="small"
              >
                <MenuItem value="warehouse">Warehouse</MenuItem>
                <MenuItem value="store">Store</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Is Active</FormLabel>
                <RadioGroup
                  row
                  name="is_active"
                  value={formData.is_active ? "true" : "false"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      is_active: e.target.value === "true",
                    })
                  }
                >
                  <FormControlLabel
                    value="true"
                    control={<Radio size="small" />}
                    label="Yes"
                  />
                  <FormControlLabel
                    value="false"
                    control={<Radio size="small" />}
                    label="No"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 24,
              gap: 12,
            }}
          >
            <button
              onClick={() => setOpenAddDialog(false)}
              style={{
                padding: "8px 18px",
                borderRadius: 6,
                border: "1px solid #d0d7de",
                background: "#f6f8fa",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              Cancel
            </button>

            <button
              onClick={handleSaveLocation}
              style={{
                padding: "8px 20px",
                borderRadius: 6,
                border: "none",
                background: "#1976d2",
                color: "#fff",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 500,
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

export default LocationPage;
