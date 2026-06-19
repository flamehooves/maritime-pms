import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { RequireAuth } from './components/auth/RequireAuth';
import { LoginPage } from './pages/Login/LoginPage';
import { RedirectPage } from './pages/Auth/RedirectPage';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/Dashboard/index';
import { VesselsPage } from './pages/Vessels/VesselsPage';
import { VesselDetailPage } from './pages/Vessels/VesselDetailPage';
import { EquipmentPage } from './pages/Equipment/EquipmentPage';
import { EquipmentOverviewPage } from './pages/Equipment/EquipmentOverviewPage';
import { JobPlansPage } from './pages/JobPlans/JobPlansPage';
import { JobOrdersPage } from './pages/JobOrders/JobOrdersPage';
import { SparesPage } from './pages/Spares/SparesPage';
import { DefectsPage } from './pages/Defects/DefectsPage';
import { ApprovalsPage } from './pages/Approvals/ApprovalsPage';
import { ReportsPage } from './pages/Reports/ReportsPage';
import { SettingsPage } from './pages/Settings/SettingsPage';
import { DueJobsPage } from './pages/DueJobs/DueJobsPage';
import { TomFormsPage } from './pages/TomForms/TomFormsPage';
import { RunningHoursPage } from './pages/RunningHours/RunningHoursPage';
import { GuaranteeClaimsPage } from './pages/GuaranteeClaims/GuaranteeClaimsPage';
import { FleetMapPage } from './pages/FleetMap/FleetMapPage';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter basename="/maritime-pms">
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/redirect" element={<RedirectPage />} />

            {/* Protected */}
            <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
              <Route index element={<DashboardPage />} />
              <Route path="vessels" element={<VesselsPage />} />
              <Route path="vessels/:id" element={<VesselDetailPage />} />
              <Route path="equipment" element={<EquipmentPage />} />
              <Route path="equipment/overview" element={<EquipmentOverviewPage />} />
              <Route path="job-plans" element={<JobPlansPage />} />
              <Route path="job-orders" element={<JobOrdersPage />} />
              <Route path="spares" element={<SparesPage />} />
              <Route path="defects" element={<DefectsPage />} />
              <Route path="approvals" element={<ApprovalsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="due-jobs" element={<DueJobsPage />} />
              <Route path="tom-forms" element={<TomFormsPage />} />
              <Route path="running-hours" element={<RunningHoursPage />} />
              <Route path="guarantee-claims" element={<GuaranteeClaimsPage />} />
              <Route path="fleet-map" element={<FleetMapPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
