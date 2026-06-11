import React from 'react';
import { EquipmentTree } from './EquipmentTree';
import { EquipmentDetail, EquipmentDetailEmpty } from './EquipmentDetail';
import { useApp } from '../../context/AppContext';

export function EquipmentPage() {
  const { selectedEquipment } = useApp();

  return (
    <div className="flex h-full overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>
      <EquipmentTree />
      <div className="flex-1 overflow-hidden flex flex-col">
        {selectedEquipment && !selectedEquipment.isGroup
          ? <EquipmentDetail equipment={selectedEquipment} />
          : <EquipmentDetailEmpty />
        }
      </div>
    </div>
  );
}
