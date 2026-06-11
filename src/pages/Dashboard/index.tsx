import React from 'react';
import { useApp } from '../../context/AppContext';
import { AdminDashboard } from './AdminDashboard';
import { ChiefEngineerDashboard } from './ChiefEngineerDashboard';
import { TechnicianDashboard } from './TechnicianDashboard';

export function DashboardPage() {
  const { currentRole } = useApp();
  if (currentRole === 'admin') return <AdminDashboard />;
  if (currentRole === 'chief_engineer') return <ChiefEngineerDashboard />;
  return <TechnicianDashboard />;
}
