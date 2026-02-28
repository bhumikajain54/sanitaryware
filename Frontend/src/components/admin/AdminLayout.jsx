import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen bg-[var(--admin-bg-primary)] overflow-hidden w-full max-w-full transition-colors duration-300">
      {/* Sidebar Component */}
      <AdminSidebar 
        isMobileOpen={isSidebarOpen} 
        onMobileClose={closeSidebar} 
        onMobileToggle={toggleSidebar}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-hidden relative transition-all duration-300 md:pl-20">
        {/* Fixed Header */}
        <AdminHeader toggleSidebar={toggleSidebar} />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent w-full max-w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
