# KPI Dashboard – API Payload & Response Spec

This document describes the **payload** and **response** shapes for integrating the KPI Dashboard with a backend API. Data is stored **day-wise** (one row per date).

## UI behaviour (in scope)

- **KPI Overview** has a **filter**: **Year** (default: current year) and **Month** (default: *All months*).
  - **Month selected** (e.g. Feb 2025): data is shown **day-wise** (one point per day in that month).
  - **Month not selected** (*All months*): data is shown **monthly** (one point per month in that year; each point uses the last day in that month that has data).
- **Custom Calculations** and **Reset all data** are not part of the current UI and are not required from the API.

---

## Base URL (example)

```
/api/kpi-dashboard
```

---

## 1. List all KPIs

**GET** `/api/kpi-dashboard/kpis`

### Response (200)

```json
{
  "data": [
    {
      "id": "orders-volume",
      "name": "Orders Volume",
      "description": "Total order amounts per month",
      "dataSource": "/api/kpis/orders",
      "calculation": {
        "type": "EXPRESSION",
        "expression": "amount * 1.5"
      },
      "chartType": "BAR",
      "dataKey": "value",
      "categoryKey": "label",
      "showGridLines": true,
      "showLegend": true,
      "showActualOnGraph": true,
      "showTargetOnGraph": false,
      "xAxisLabel": "Date",
      "yAxisLabel": "Value",
      "legendPosition": "bottom",
      "colors": {
        "bars": ["#0ea5e9", "#38bdf8"],
        "line": "#6366f1",
        "fill": "rgba(14,165,233,0.2)",
        "segments": ["#0ea5e9", "#6366f1", "#22c55e"]
      },
      "unit": "%",
      "thresholds": {
        "greenThreshold": 95,
        "yellowThreshold": 85
      },
      "department": "production"
    }
  ]
}
```

### KPI object shape (for create/update and list)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes (update) | Unique KPI id (e.g. `orders-volume`) |
| `name` | string | Yes | Display name |
| `description` | string | Yes | Formula expression (e.g. `a + b`) |
| `dataSource` | string | No | Optional API path for external data |
| `calculation` | object | Yes | `{ type: "EXPRESSION", expression: "..." }` |
| `chartType` | string | Yes | `BAR` \| `COMBO` \| `PIE` \| `DONUT` \| `RADAR` |
| `dataKey` | string | No | Chart value key (default `value`) |
| `categoryKey` | string | No | Chart category key (default `label`) |
| `showGridLines` | boolean | No | Default true |
| `showLegend` | boolean | No | Default true |
| `showActualOnGraph` | boolean | No | Default true |
| `showTargetOnGraph` | boolean | No | Default false |
| `xAxisLabel` | string | No | X-axis label |
| `yAxisLabel` | string | No | Y-axis label |
| `legendPosition` | string | No | e.g. `bottom`, `top-right` |
| `colors` | object | No | `bars`, `line`, `fill`, `segments` (arrays/strings) |
| `unit` | string | No | e.g. `%`, `count`, `minutes`, `units` |
| `thresholds` | object | No | `greenThreshold`, `yellowThreshold` (numbers) |
| `department` | string | No | e.g. `production`, `quality`, `maintenance` |

---

## 2. Create KPI

**POST** `/api/kpi-dashboard/kpis`

### Payload (body)

```json
{
  "id": "orders-volume",
  "name": "Orders Volume",
  "description": "amount * 1.5",
  "dataSource": "/api/kpis/orders",
  "calculation": {
    "type": "EXPRESSION",
    "expression": "amount * 1.5"
  },
  "chartType": "BAR",
  "dataKey": "value",
  "categoryKey": "label",
  "showGridLines": true,
  "showLegend": true,
  "showActualOnGraph": true,
  "showTargetOnGraph": false,
  "xAxisLabel": "Date",
  "yAxisLabel": "Value",
  "legendPosition": "bottom",
  "colors": {
    "bars": ["#0ea5e9", "#6366f1"],
    "line": "#6366f1",
    "fill": "rgba(14,165,233,0.2)",
    "segments": ["#0ea5e9", "#6366f1", "#22c55e"]
  },
  "unit": "%",
  "thresholds": {
    "greenThreshold": 95,
    "yellowThreshold": 85
  },
  "department": "production"
}
```

### Response (201)

```json
{
  "data": { ... }
}
```

`data` is the created KPI object (same shape as in List all KPIs).

---

## 3. Update KPI

**PUT** `/api/kpi-dashboard/kpis/:id`

### Payload (body)

Same as Create KPI; `id` in URL must match the KPI being updated.

### Response (200)

```json
{
  "data": { ... }
}
```

`data` is the updated KPI object.

---

## 4. Delete KPI

**DELETE** `/api/kpi-dashboard/kpis/:id`

### Response (200 or 204)

```json
{
  "success": true
}
```

Or empty body with status 204.

---

## 5. Get KPI data (day-wise)

**GET** `/api/kpi-dashboard/kpis/:kpiId/data`

Returns all **day-wise** data points for one KPI.

### Response (200)

```json
{
  "data": [
    {
      "date": "2025-02-01",
      "label": "2025-02-01",
      "actual": 120.5,
      "target": 100,
      "amount": 80,
      "completed": 75
    },
    {
      "date": "2025-02-02",
      "label": "2025-02-02",
      "actual": 95.2,
      "target": 100,
      "amount": 70,
      "completed": 65
    }
  ]
}
```

### Day-wise data row shape

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `date` | string | Yes | ISO date `YYYY-MM-DD` (day for the point) |
| `label` | string | No | Display label on chart (defaults to `date`) |
| `actual` | number | No | Calculated/actual value |
| `target` | number | No | Target value |
| *variables* | number | No | One key per formula variable (e.g. `amount`, `completed`) |

Variable keys come from the KPI’s formula expression (e.g. `amount + completed` → `amount`, `completed`).

---

## 6. Save KPI data (day-wise) – full replace

**PUT** `/api/kpi-dashboard/kpis/:kpiId/data`

Replaces all day-wise data for the KPI with the given array.

### Payload (body)

```json
{
  "data": [
    {
      "date": "2025-02-01",
      "label": "2025-02-01",
      "actual": 120.5,
      "target": 100,
      "amount": 80,
      "completed": 75
    },
    {
      "date": "2025-02-02",
      "label": "2025-02-02",
      "actual": 95.2,
      "target": 100,
      "amount": 70,
      "completed": 65
    }
  ]
}
```

### Response (200)

```json
{
  "data": [ ... ]
}
```

`data` is the saved array (same day-wise row shape).

---

## 7. Add one day-wise data point (optional)

**POST** `/api/kpi-dashboard/kpis/:kpiId/data`

Adds a single day; backend may merge by `date` for the same KPI.

### Payload (body)

```json
{
  "date": "2025-02-19",
  "label": "2025-02-19",
  "actual": 110,
  "target": 100,
  "amount": 60,
  "completed": 55
}
```

### Response (201)

```json
{
  "data": { ... }
}
```

`data` is the created/merged row (same shape as a row in section 5).

---

## 8. Delete one day-wise data point (optional)

**DELETE** `/api/kpi-dashboard/kpis/:kpiId/data/:date`

Example: `DELETE /api/kpi-dashboard/kpis/orders-volume/data/2025-02-19`

### Response (200 or 204)

```json
{
  "success": true
}
```

---

## 9. KPI Overview filter (optional query params)

The frontend filters KPI data by **year** and **month** in the Overview tab. The backend may support the same via query parameters so the client can request pre-filtered data.

### Get KPI data filtered by year (and optionally month)

**GET** `/api/kpi-dashboard/kpis/:kpiId/data?year=2025`  
**GET** `/api/kpi-dashboard/kpis/:kpiId/data?year=2025&month=2`

| Query param | Type | Required | Description |
|-------------|------|----------|-------------|
| `year` | number | No | Filter to rows with `date` in this year (e.g. `2025`). |
| `month` | number (1–12) | No | If present, filter to this month (day-wise). If omitted, client may aggregate by month (monthly view). |

When `month` is provided, the response is day-wise for that month. When only `year` is provided, the response is all day-wise rows in that year; the client aggregates by month for the monthly view.

### List KPIs (optional filter)

**GET** `/api/kpi-dashboard/kpis?year=2025&month=2`

If the backend supports it, these params can be used to return KPIs that have data in the given year (and month). This is optional; the main contract is day-wise data per KPI with a `date` field.

---

## Summary

| Action | Method | Endpoint | Payload | Response |
|--------|--------|----------|---------|----------|
| List KPIs | GET | `/kpis` | — | `{ data: KPI[] }` |
| Create KPI | POST | `/kpis` | KPI object | `{ data: KPI }` |
| Update KPI | PUT | `/kpis/:id` | KPI object | `{ data: KPI }` |
| Delete KPI | DELETE | `/kpis/:id` | — | `{ success: true }` |
| Get KPI data (day-wise) | GET | `/kpis/:kpiId/data` | — | `{ data: DayRow[] }` |
| Save KPI data (day-wise) | PUT | `/kpis/:kpiId/data` | `{ data: DayRow[] }` | `{ data: DayRow[] }` |
| Add one day | POST | `/kpis/:kpiId/data` | DayRow | `{ data: DayRow }` |
| Delete one day | DELETE | `/kpis/:kpiId/data/:date` | — | `{ success: true }` |
| Get KPI data (filtered) | GET | `/kpis/:kpiId/data?year=2025&month=2` | — | `{ data: DayRow[] }` |

**DayRow** = `{ date, label?, actual?, target?, ...variables }` with `date` as `YYYY-MM-DD`.

**Note:** Custom Calculations and Reset All Data are not in the current UI; no API is required for them.
