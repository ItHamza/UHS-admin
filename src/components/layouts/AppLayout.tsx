"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import MobileMenu from "./MobileMenu";
import Navbar from "./Navbar";

interface LayoutProps {
  children: React.ReactNode;
}
import { usePathname } from 'next/navigation';

const AppLayout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const hideLayout = ['/sign-in', '/sign-up'].includes(pathname);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <div className="min-h-screen flex md:flex-row flex-col bg-gray-100 font-['Poppins']">
      {!hideLayout && sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {!hideLayout && (
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      )}

      {!hideLayout && <MobileMenu toggleSidebar={toggleSidebar} />}

      <div className="flex w-full flex-col">
        {!hideLayout && <Navbar />}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;
