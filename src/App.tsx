import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: string | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(e: Error) { return { error: e.message }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', gap: 12, padding: 24, fontFamily: 'sans-serif' }}>
          <div style={{ fontSize: 32 }}>⚓</div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: 0 }}>Something went wrong</h2>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>{this.state.error}</p>
          <button onClick={() => window.location.href = '/maritime-pms/login'} style={{ marginTop: 8, padding: '8px 20px', borderRadius: 10, border: 'none', background: '#4f46e6', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Return to Login
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
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
import { MdmCommonPage } from './pages/MDM/MdmCommonPage';
import { AdminPage } from './pages/Admin/AdminPage';

function App() {
  return (
    <ErrorBoundary>
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
              <Route path="mdm/common" element={<MdmCommonPage />} />
              <Route path="admin" element={<AdminPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
