# PalLite — Planned Maintenance System (PMS)

A maritime fleet management and planned maintenance system built with React + TypeScript, using **Zoho CRM as the live database** for all data. No separate backend — all reads and writes go directly to Zoho CRM via REST API v3.

---

## Live App

**GitHub Pages:** https://flamehooves.github.io/maritime-pms/

---

## Repositories

| Remote | URL |
|--------|-----|
| GitHub | https://github.com/flamehooves/maritime-pms.git |
| Zoho   | https://zrepository.zohocorpcloud.in/zohocorp/user/harsh.k/pallite.git |

```bash
# Clone from GitHub
git clone https://github.com/flamehooves/maritime-pms.git

# Add Zoho as a second remote (already set up locally)
git remote add zoho https://harsh.k@zrepository.zohocorpcloud.in/zohocorp/user/harsh.k/pallite.git
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS v3 |
| Routing | React Router v6 |
| Map | Leaflet + react-leaflet (OpenStreetMap, no API key needed) |
| Charts | Recharts |
| Icons | Lucide React |
| Database | Zoho CRM REST API v3 (India DC: `https://www.zohoapis.in`) |
| Auth | Zoho OAuth implicit flow |
| Hosting | GitHub Pages (auto-deploy via GitHub Actions on push to `main`) |

---

## Authentication

- OAuth implicit flow — token stored in `localStorage.pls_access_token`
- API domain stored in `localStorage.pls_api_domain`
- Login page: `/login` → redirects to Zoho OAuth → `/redirect` callback
- Token is used for all CRM API calls in `src/services/crmService.ts`

---

## Zoho CRM Modules

All data lives in these CRM modules (India DC):

| Module API Name | Description |
|----------------|-------------|
| `Vessels` | Fleet vessels with position (lat/lon/MMSI) |
| `Equipments` | Equipment hierarchy with hierarchical codes |
| `Job_Plans` | Maintenance job plans with frequency/intervals |
| `Job_Orders` | Job orders (Planned / Breakdown / Defect Rectification) |
| `Defects` | Defect reports with severity and status |
| `Spare_Parts` | Spare parts inventory with stock levels |
| `Guarantee_Claims` | Equipment guarantee/warranty claims |
| `Running_Hours_Log` | Running hours log entries per equipment |
| `TOM_Forms` | Technical Office Memorandum forms (weekly completion matrix) |
| `Postponed_Jobs` | Postponement requests for job orders (with approval workflow) |
| `PMS_Reference_Data` | Reference/lookup data (categories, ranks, etc.) |
| `Equipment_Specifications` | Equipment spec sheets |
| `Equipment_Surveys` | Survey records per equipment |
| `Condition_Of_Class` | Class condition records |
| `Equipment_Memoranda` | Technical memoranda per equipment |
| `HSEQ_Records` | Health, Safety, Environment & Quality records |

---

## Project Structure

```
src/
├── services/
│   └── crmService.ts          # All CRM API calls (fetch, create, update, delete)
├── hooks/
│   └── useCrmFetch.ts         # Custom hook: fetches CRM data, handles loading/reload
├── types/
│   └── index.ts               # TypeScript interfaces for all data models
├── context/
│   ├── AppContext.tsx          # Vessel selector, role, sidebar state
│   └── AuthContext.tsx         # OAuth token management
├── pages/
│   ├── Dashboard/             # Admin, Chief Engineer, Technician dashboards
│   │   └── AdminDashboard.tsx # Fleet map (Leaflet), health gauge, approval queue
│   ├── Vessels/               # Fleet vessel list + detail pages
│   ├── Equipment/             # Equipment hierarchy tree + detail tabs
│   ├── JobPlans/              # Job plans with frequency-based scheduling
│   ├── JobOrders/             # Job orders (3 tabs: Planned / Breakdown / Postponed)
│   ├── DueJobs/               # Due this week / overdue view
│   ├── RunningHours/          # Running hours log with service threshold progress bars
│   ├── TomForms/              # TOM Forms weekly completion matrix
│   ├── Defects/               # Defect management
│   ├── Spares/                # Spare parts inventory
│   ├── GuaranteeClaims/       # Guarantee/warranty claims
│   ├── Approvals/             # Job order approval queue
│   └── Reports/               # Reports page
└── components/
    ├── layout/
    │   ├── Sidebar.tsx         # Navigation sidebar with role-based visibility
    │   ├── TopBar.tsx          # Vessel selector + role switcher
    │   └── Layout.tsx
    └── ui/                     # StatCard, StatusBadge, etc.
```

---

## Key Patterns

### CRM Data Flow
Every page reads **and writes** to Zoho CRM:
```
Page → crmService.ts → Zoho CRM API → back to Page via useCrmFetch
```

### useCrmFetch Hook
```tsx
const { data, loading, reload } = useCrmFetch(() => fetchJobOrders(vesselId), [vesselId]);
```

### CRM Write Pattern
```tsx
await createJobOrder({ title, equipmentId, dueDate }, vesselId);
await updateJobOrder(id, { status: 'Completed', completionDate });
await deleteJobOrder(id);
```

### Vessel Position (Fleet Map)
- Vessels have `Latitude`, `Longitude`, `MMSI`, `Last_Position_Update` fields in CRM
- Map is embedded in Admin Dashboard using Leaflet/OpenStreetMap (free, no API key)
- "Seed Demo Positions" button populates realistic maritime coordinates for all vessels
- Future: wire up AIS provider (MarineTraffic/VesselFinder) → call `updateVesselPosition(id, lat, lng)`

### Role-Based Access
Three roles: `admin`, `chief_engineer`, `technician`
- Sidebar items filtered by `roles[]` array per nav item
- Different dashboard views per role

---

## Local Development

```bash
# Install dependencies
npm install

# Start dev server (port 5173)
npm run dev

# Build for production
npx vite build   # skips tsc strict check
npm run build    # runs tsc + vite (requires zero TS errors)

# Deploy to GitHub Pages (auto via Actions, or manually)
git checkout gh-pages
cp -r dist/* .
git add -A && git commit -m "deploy" && git push origin gh-pages
git checkout main
```

---

## Deploying

GitHub Actions (`.github/workflows/deploy.yml`) auto-builds and deploys to GitHub Pages on every push to `main`. No manual deployment needed — just push to `main`.

---

## Pending / Future Work

- [ ] AIS integration — connect MarineTraffic or VesselFinder API using vessel MMSI to auto-update positions
- [ ] Reports page — build out analytics (maintenance compliance rate, overdue trends, spare consumption)
- [ ] Push notifications — alert CE/admin when jobs go overdue or defects are raised
- [ ] Mobile-responsive layout
- [ ] Offline support / PWA

---

## CRM Profile IDs (for adding new modules/fields)

| Profile | ID |
|---------|----|
| Administrator | `1333317000000031157` |
| Standard | `1333317000000031160` |
