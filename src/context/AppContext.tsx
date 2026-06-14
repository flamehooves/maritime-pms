import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Role, Equipment, Vessel } from '../types';

export const ALL_VESSELS_ID = '__all__';

interface AppState {
  currentRole: Role;
  currentVesselId: string;
  selectedEquipment: Equipment | null;
  sidebarCollapsed: boolean;
  setCurrentRole: (role: Role) => void;
  setCurrentVesselId: (id: string) => void;
  setSelectedEquipment: (equipment: Equipment | null) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  // Legacy compat — kept so existing components compile
  currentVessel: Vessel;
  setCurrentVessel: (vessel: Vessel) => void;
}

const PLACEHOLDER_VESSEL: Vessel = {
  id: ALL_VESSELS_ID, name: 'All Vessels', imo: '', type: '', flag: '',
  buildYear: 0, owner: '', manager: '', status: 'active',
  classSociety: '', dwt: 0, grt: 0, callSign: '', port: '',
};

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRole] = useState<Role>('admin');
  const [currentVesselId, setCurrentVesselId] = useState<string>(ALL_VESSELS_ID);
  const [currentVessel, setCurrentVessel] = useState<Vessel>(PLACEHOLDER_VESSEL);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSetCurrentVessel = (v: Vessel) => {
    setCurrentVessel(v);
    setCurrentVesselId(v.id);
  };

  return (
    <AppContext.Provider value={{
      currentRole,
      currentVesselId,
      selectedEquipment,
      sidebarCollapsed,
      currentVessel,
      setCurrentRole,
      setCurrentVesselId,
      setCurrentVessel: handleSetCurrentVessel,
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
