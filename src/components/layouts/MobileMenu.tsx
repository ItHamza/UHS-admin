"use client";
import React from "react";
import { RiMenu4Line } from "react-icons/ri";

interface MobileMenuProps {
  toggleSidebar: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ toggleSidebar }) => {
  return (
    <div className='sticky top-0 z-10 lg:hidden bg-blue-800 flex items-center px-4 h-16'>
      <button
        className='text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-white'
        onClick={toggleSidebar}>
        <RiMenu4Line className='h-6 w-6' />
      </button>
      <div className='flex-1 flex justify-center'>
        <div className='text-white text-xl font-semibold'>
          Urban Hospitality
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
