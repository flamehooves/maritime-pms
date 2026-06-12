import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/Dashboard/index';
import { VesselsPage } from './pages/Vessels/VesselsPage';
import { VesselDetailPage } from './pages/Vessels/VesselDetailPage';
import { EquipmentPage } from './pages/Equipment/EquipmentPage';
import { JobPlansPage } from './pages/JobPlans/JobPlansPage';
import { JobOrdersPage } from './pages/JobOrders/JobOrdersPage';
import { SparesPage } from './pages/Spares/SparesPage';
import { DefectsPage } from './pages/Defects/DefectsPage';
import { ApprovalsPage } from './pages/Approvals/ApprovalsPage';
import { ReportsPage } from './pages/Reports/ReportsPage';
import { SettingsPage } from './pages/Settings/SettingsPage';

function App() {
  return (
    <AppProvider>
      <BrowserRouter basename="/maritime-pms">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="vessels" element={<VesselsPage />} />
            <Route path="vessels/:id" element={<VesselDetailPage />} />
            <Route path="equipment" element={<EquipmentPage />} />
            <Route path="job-plans" element={<JobPlansPage />} />
            <Route path="job-orders" element={<JobOrdersPage />} />
            <Route path="spares" element={<SparesPage />} />
            <Route path="defects" element={<DefectsPage />} />
            <Route path="approvals" element={<ApprovalsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
