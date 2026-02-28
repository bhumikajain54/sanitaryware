import { useState, useEffect } from 'react';
import CustomerSidebar from './CustomerSidebar';
import CustomerHeader from './CustomerHeader';

const CustomerLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on small screens when route changes is handled in Sidebar
  
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen bg-[var(--bg-app)] overflow-hidden transition-colors duration-300">
      {/* Sidebar Component */}
      <CustomerSidebar 
        isMobileOpen={isSidebarOpen} 
        onMobileClose={closeSidebar} 
        onMobileToggle={toggleSidebar}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative transition-all duration-300 md:pl-20">
        {/* Fixed Header */}
        <CustomerHeader onMenuClick={toggleSidebar} />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CustomerLayout;
