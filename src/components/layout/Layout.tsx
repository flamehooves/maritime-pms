import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-surface-2 w-full">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto w-full">
          <div className="min-h-full w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
