"use client";

import React from "react";

const BookingsHeader: React.FC = () => {
  return (
    <div className='flex flex-col md:flex-row md:items-center md:justify-between'>
      <div>
        <h1 className='text-2xl font-semibold text-gray-800'>Bookings</h1>
        <p className='mt-1 text-sm text-gray-500'>
          Manage your bookings database and view detailed booking information
        </p>
      </div>
      <div className='mt-4 md:mt-0 flex space-x-3'>
        <button className='bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-4 rounded text-sm flex items-center'>
          <svg
            className='w-4 h-4 mr-2'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12'
            />
          </svg>
          Export
        </button>
        <button className='bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm flex items-center'>
          <svg
            className='w-4 h-4 mr-2'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 6v6m0 0v6m0-6h6m-6 0H6'
            />
          </svg>
          New Booking
        </button>
      </div>
    </div>
  );
};

export default BookingsHeader;
