import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { AudioUnlockBanner } from '../../components/ui/AudioUnlockBanner';
import { NewOrderAlertModal } from '../../components/ui/NewOrderAlertModal';

export const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-background text-secondary-900 dark:text-white">
      {/* Dark Sidebar matching UI reference */}
      <AdminSidebar />

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AudioUnlockBanner />
        <NewOrderAlertModal />
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

