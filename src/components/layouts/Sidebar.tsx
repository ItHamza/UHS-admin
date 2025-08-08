"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  RiDashboardLine,
  RiUserLine,
  RiCalendarLine,
  RiTeamLine,
  RiBookmarkLine,
  RiSettings4Line,
  RiCloseLine,
  RiTeamFill,
  RiCalculatorFill,
  RiMapPinRangeFill,
  RiPrinterFill,
} from "react-icons/ri";
import { useNotificationStore } from "@/store/useNotificationStore";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const pathname = usePathname();
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const displayCount = unreadCount > 99 ? "99+" : unreadCount;

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: RiDashboardLine },
    { name: "Customers", href: "/customers", icon: RiUserLine },
    { name: "Bookings", href: "/bookings", icon: RiBookmarkLine },
    { name: "Roster Management", href: "/roster", icon: RiCalculatorFill },
    { name: "Teams", href: "/teams", icon: RiTeamFill },
    { name: "Project Management", href: "/managements", icon: RiMapPinRangeFill },
    { name: "Price Management", href: "/pricing", icon: RiPrinterFill },
    { name: "Notification", href: "/notifications", icon: RiSettings4Line },
  ];

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <>
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-blue-800 text-white transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}>
        <div className='flex items-center justify-between h-16 px-6 bg-blue-900'>
          <div className='flex items-center'>
            <span className='text-xl font-semibold whitespace-nowrap'>
              Urban Hospitality
            </span>
          </div>
          <button
            className='p-1 rounded-md lg:hidden focus:outline-none focus:ring-2 focus:ring-white'
            onClick={() => setSidebarOpen(false)}>
            <RiCloseLine className='w-6 h-6' />
          </button>
        </div>
        <div className='px-2 py-4'>
          <nav className='space-y-1'>
            {navigation.map((item) => {
              const active = isActive(item.href);
              const isNotifications = item.href === "/notifications";
              return (
                <Link
                  href={item.href}
                  key={item.name}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                    active
                      ? "bg-blue-900 text-white"
                      : "text-blue-100 hover:bg-blue-700"
                  }`}>
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      active
                        ? "text-white"
                        : "text-blue-300 group-hover:text-white"
                    }`}
                  />
                  <span className="flex-1">{item.name}</span>

                  {isNotifications && unreadCount > 0 && (
                    <span
                      className="ml-auto inline-flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-semibold min-w-5 h-5 px-1"
                      aria-label={`Unread notifications: ${displayCount}`}
                    >
                      {displayCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className='absolute bottom-0 w-full p-4 border-t border-blue-700'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <div className='h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center'>
                <span className='text-sm font-medium'>UA</span>
              </div>
            </div>
            <div className='ml-3'>
              <p className='text-sm font-medium text-white'>Admin User</p>
              <p className='text-xs text-blue-300'>View Profile</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
