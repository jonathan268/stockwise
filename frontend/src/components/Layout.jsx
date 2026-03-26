import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import BottomNav from "./BottomNav";
import SEO from "./common/SEO";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="h-screen bg-base-200 overflow-hidden">
      <SEO noindex={true} title="Dashboard" />
      {/* Sidebar - Desktop */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      {/* Main Content Area */}
      <div
        className={`h-screen flex flex-col overflow-hidden transition-all duration-300 ${
          sidebarOpen ? "lg:ml-64" : "lg:ml-20"
        }`}
      >
        {/* Header */}
        <Header onMenuClick={toggleSidebar} />

        {/* Page Content - Adjust PB to leave room for Bottom Nav on mobile */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto w-full pb-20 lg:pb-6 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Layout;
