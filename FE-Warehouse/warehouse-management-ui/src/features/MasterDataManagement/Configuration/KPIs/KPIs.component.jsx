import React, { useEffect, useMemo, useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { CommonButton } from '@shared/components/CommonButton';
import { DeleteConfirmationDialog } from '@shared/components/DeleteConfirmationDialog';
import { CommonEditDeleteActions } from '@shared/components/CommonEditDeleteActions';
import { CommonDataGrid } from '@shared/components/CommonDataGrid';
import AddKpiModal from '../../KPIDashboard/forms/AddKpiModal';
import AddDataModal from '../../KPIDashboard/forms/AddDataModal';
import { loadKpis, persistKpis } from '../../KPIDashboard/kpiDefaults';

function KPIs() {
  const [kpis, setKpis] = useState(() => loadKpis());
  const [addKpiModalOpen, setAddKpiModalOpen] = useState(false);
  const [addDataModalKpi, setAddDataModalKpi] = useState(null);
  const [kpiCustomData, setKpiCustomData] = useState({});
  const [editingKpi, setEditingKpi] = useState(null);
  const [kpiToDelete, setKpiToDelete] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    persistKpis(kpis);
  }, [kpis]);

  const handleCreateKpi = (config) => {
    setKpis((prev) => [...prev, config]);
  };

  const handleUpdateKpi = (config) => {
    setKpis((prev) => prev.map((k) => (k.id === config.id ? config : k)));
    setEditingKpi(null);
  };

  const handleSaveKpiData = ({ kpiId, data }) => {
    if (!kpiId) return;
    setKpiCustomData((prev) => ({
      ...prev,
      [kpiId]: { ...prev[kpiId], data },
    }));
  };

  const openEditKpi = (kpi) => {
    setEditingKpi(kpi);
  };

  const openDeleteDialog = (kpi) => {
    setKpiToDelete(kpi);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (kpiToDelete) {
      const id = kpiToDelete.id;
      setKpis((prev) => prev.filter((k) => k.id !== id));
      setKpiCustomData((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setKpiToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setKpiToDelete(null);
  };

  const columns = useMemo(
    () => [
      {
        key: 'name',
        label: 'KPI Name',
        sortable: true,
        minWidth: '12rem',
      },
      {
        key: 'formula',
        label: 'Formula',
        sortable: true,
        minWidth: '16rem',
        render: (_, row) => row.calculation?.expression || row.description || '—',
      },
      {
        key: 'target',
        label: 'Target',
        sortable: false,
        minWidth: '6rem',
        render: (_, row) => row.thresholds?.target ?? '—',
      },
      {
        key: 'unit',
        label: 'Unit',
        sortable: false,
        minWidth: '6rem',
        render: (_, row) => row.unit || '—',
      },
      {
        key: 'dataInfo',
        label: 'Data',
        sortable: false,
        minWidth: '8rem',
        render: (_, row) => {
          const custom = kpiCustomData[row.id];
          if (custom?.data?.length != null) {
            return `${custom.data.length} rows`;
          }
          if (Array.isArray(row.fieldMappings) && row.fieldMappings.length > 0) {
            return `${row.fieldMappings.length} field mappings`;
          }
          if (row.dataSource) return 'From source';
          return 'Not set';
        },
      },
      {
        key: 'actions',
        label: 'Actions',
        sortable: false,
        minWidth: '10rem',
        render: (_, row) => (
          <div className="flex items-center justify-end gap-2">
            <CommonButton
              variant="outline"
              size="xs"
              onClick={() => setAddDataModalKpi(row)}
            >
              Add data
            </CommonButton>
            <CommonEditDeleteActions
              size="xs"
              editVariant="ghost"
              deleteVariant="ghost"
              onEdit={() => openEditKpi(row)}
              onDelete={() => openDeleteDialog(row)}
              editAriaLabel="Edit KPI"
              deleteAriaLabel="Delete KPI"
            />
          </div>
        ),
      },
    ],
    [kpiCustomData],
  );

  return (
    <div className="space-y-4">
      <CommonDataGrid
        title="KPI list – Add data"
        columns={columns}
        data={kpis}
        showSearch={false}
        actions={
          <CommonButton
            variant="primary"
            size="sm"
            icon={PlusIcon}
            onClick={() => setAddKpiModalOpen(true)}
          >
            Add New KPI
          </CommonButton>
        }
      />

      <AddKpiModal
        isOpen={addKpiModalOpen || !!editingKpi}
        onClose={() => {
          setAddKpiModalOpen(false);
          setEditingKpi(null);
        }}
        onSubmit={handleCreateKpi}
        editKpi={editingKpi}
        onUpdate={handleUpdateKpi}
      />

      <AddDataModal
        isOpen={!!addDataModalKpi}
        onClose={() => setAddDataModalKpi(null)}
        kpi={addDataModalKpi}
        initialData={addDataModalKpi ? kpiCustomData[addDataModalKpi.id]?.data : undefined}
        onSave={handleSaveKpiData}
      />

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Delete KPI"
        itemName={kpiToDelete?.name}
        message="Are you sure you want to delete this KPI? This action cannot be undone."
        confirmButtonText="Delete"
        cancelButtonText="Cancel"
      />
    </div>
  );
}

export default KPIs;