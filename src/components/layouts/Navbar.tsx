"use client";

import React, { useState } from "react";
import {
  RiBellLine,
  RiSearchLine,
  RiArrowDownSLine,
  RiUserLine,
} from "react-icons/ri";

const Navbar: React.FC = () => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <header className='bg-white shadow'>
      <div className='px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          <div className='flex items-center flex-1'>
            <div className='max-w-xs w-full'>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <RiSearchLine className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  type='text'
                  className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm'
                  placeholder='Search...'
                />
              </div>
            </div>
          </div>
          <div className='flex items-center space-x-4'>
            <button className='p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'>
              <span className='sr-only'>View notifications</span>
              <div className='relative'>
                <RiBellLine className='h-6 w-6' />
                <span className='absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 transform -translate-y-1/2 translate-x-1/2'></span>
              </div>
            </button>

            {/* Profile dropdown */}
            <div className='relative'>
              <button
                className='flex items-center space-x-2 focus:outline-none'
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}>
                <div className='h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center'>
                  <span className='text-sm font-medium text-white'>UA</span>
                </div>
                <div className='hidden md:block text-left'>
                  <div className='text-sm font-medium text-gray-700'>
                    Admin User
                  </div>
                  <div className='text-xs text-gray-500'>admin@urban.com</div>
                </div>
                <RiArrowDownSLine className='hidden md:block h-5 w-5 text-gray-400' />
              </button>

              {profileDropdownOpen && (
                <div className='origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-10'>
                  <a
                    href='#'
                    className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'>
                    Your Profile
                  </a>
                  <a
                    href='#'
                    className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'>
                    Settings
                  </a>
                  <a
                    href='#'
                    className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'>
                    Sign out
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
