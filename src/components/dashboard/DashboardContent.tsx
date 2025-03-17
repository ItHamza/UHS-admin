"use client";

import React from "react";
import DashboardMetrics from "./DahboardMetrics";
import RecentBookings from "./RecentBookings";
import TeamAvailability from "./TeamAvailability";

const DashboardContent: React.FC = () => {
  return (
    <div className='space-y-6'>
      <div className='flex flex-col md:flex-row md:items-center md:justify-between'>
        <h1 className='text-2xl font-semibold text-gray-800'>Dashboard</h1>
        <div className='mt-4 md:mt-0'>
          <button className='bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm'>
            Generate Report
          </button>
        </div>
      </div>

      <DashboardMetrics />
      <RecentBookings />
      <TeamAvailability />
    </div>
  );
};

export default DashboardContent;
