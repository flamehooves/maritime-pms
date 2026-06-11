import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Role, Equipment, Vessel } from '../types';
import { vessels } from '../data/vessels';

interface AppState {
  currentRole: Role;
  currentVessel: Vessel;
  selectedEquipment: Equipment | null;
  sidebarCollapsed: boolean;
  setCurrentRole: (role: Role) => void;
  setCurrentVessel: (vessel: Vessel) => void;
  setSelectedEquipment: (equipment: Equipment | null) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRole] = useState<Role>('admin');
  const [currentVessel, setCurrentVessel] = useState<Vessel>(vessels[0]);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <AppContext.Provider value={{
      currentRole,
      currentVessel,
      selectedEquipment,
      sidebarCollapsed,
      setCurrentRole,
      setCurrentVessel,
      setSelectedEquipment,
      setSidebarCollapsed,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
