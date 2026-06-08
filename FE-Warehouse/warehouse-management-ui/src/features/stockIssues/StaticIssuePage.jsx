import React from "react"
import IssuesSection from "./IssuesSection"

const StaticIssuesPage = () => {

  const issues = [
    {
      id: 1,
      request_no: "REQ-001",
      itemmaster_fk: 1,
      itemmaster_name: "Gear Box",
      quantity: 10,
      subzone_fk: 1,
      status: "Issued",
      issued_by: "John",
      issue_date: "2024-01-01T10:00:00",
    },
    {
      id: 2,
      request_no: "REQ-002",
      itemmaster_fk: 2,
      itemmaster_name: "Motor Shaft",
      quantity: 5,
      subzone_fk: 2,
      status: "Pending",
      issued_by: "Alex",
      issue_date: "2024-01-03T10:00:00",
    },
  ]

  const requests = [
    {
      id: 1,
      request_no: "REQ-001",
      itemmaster_fk: 1,
      itemmaster_name: "Gear Box",
      quantity: 20,
      from_subzone_fk: 1,
      status: "Pending",
    },
    {
      id: 2,
      request_no: "REQ-002",
      itemmaster_fk: 2,
      itemmaster_name: "Motor Shaft",
      quantity: 10,
      from_subzone_fk: 2,
      status: "Pending",
    },
  ]

  const itemMasters = [
    { id: 1, item_name: "Gear Box", sku_no: "GBX-100" },
    { id: 2, item_name: "Motor Shaft", sku_no: "MS-200" },
    { id: 3, item_name: "Bearing", sku_no: "BRG-300" },
  ]

  const subzones = [
    { id: 1, name: "A1", zone_name: "Zone A", warehouse_name: "Main WH" },
    { id: 2, name: "B1", zone_name: "Zone B", warehouse_name: "Main WH" },
  ]

  const inventoryData = [
    { itemmaster_fk: 1, subzone_fk: 1, quantity: 120 },
    { itemmaster_fk: 2, subzone_fk: 2, quantity: 75 },
  ]

  const kits = [
    {
      id: 1,
      code: "KIT-100",
      name: "Starter Kit",
      components: [
        { component_item_id: 1, component_item_name: "Gear Box", base_quantity_per_kit: 2 },
        { component_item_id: 2, component_item_name: "Motor Shaft", base_quantity_per_kit: 1 },
      ],
    },
  ]

  const metrics = {
    total: issues.length,
    byStatus: [
      { status: "Pending", count: 1 },
      { status: "Issued", count: 1 },
    ],
  }

  /* ----- STUB FUNCTIONS ----- */

  const onCreateIssue = async (data) => {
    console.log("Create Issue:", data)
  }

  const onUpdateStatus = async (id, status) => {
    console.log("Update Status:", id, status)
  }

  const onRejectRequest = async (data) => {
    console.log("Reject Request:", data)
  }

  const onRefresh = async () => {
    console.log("Refresh called")
  }

  const onFetchStock = async ({ itemmaster_fk, subzone_fk }) => {
    const found = inventoryData.find(
      (i) =>
        String(i.itemmaster_fk) === String(itemmaster_fk) &&
        String(i.subzone_fk) === String(subzone_fk)
    )
    return found?.quantity || 0
  }

  return (
    <IssuesSection
      issues={issues}
      requests={requests}
      metrics={metrics}
      itemMasters={itemMasters}
      subzones={subzones}
      inventoryData={inventoryData}
      kits={kits}
      kitTransfers={[]}
      loading={false}
      loadingSubzones={false}
      loadingKits={false}
      loadingKitTransfers={false}
      subzoneError={null}
      kitsError={null}
      kitTransfersError={null}
      defaultIssuer="Admin"
      ensureRequestsLoaded={() => {}}
      onCreateIssue={onCreateIssue}
      onUpdateStatus={onUpdateStatus}
      onRejectRequest={onRejectRequest}
      onRefresh={onRefresh}
      onFetchStock={onFetchStock}
    />
  )
}

export default StaticIssuesPage