"use client";

import React from "react";

interface TeamRosterFilterProps {
  specializations: string[];
  currentFilter: string;
  onFilterChange: (filter: string) => void;
}

const TeamRosterFilter: React.FC<TeamRosterFilterProps> = ({
  specializations,
  currentFilter,
  onFilterChange,
}) => {
  return (
    <div className='bg-white rounded-lg shadow-sm p-4 border border-gray-200'>
      <div className='flex flex-col md:flex-row md:items-center justify-between'>
        <h2 className='text-lg font-medium mb-3 md:mb-0'>Filter Teams</h2>

        <div className='flex flex-wrap gap-2'>
          <button
            className={`px-3 py-1 rounded-full text-sm ${
              currentFilter === "all"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
            onClick={() => onFilterChange("all")}>
            All Teams
          </button>

          {specializations.map((specialization) => (
            <button
              key={specialization}
              className={`px-3 py-1 rounded-full text-sm ${
                currentFilter === specialization.toLowerCase()
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
              onClick={() => onFilterChange(specialization.toLowerCase())}>
              {specialization}
            </button>
          ))}
        </div>
      </div>

      <div className='mt-4 flex items-center'>
        <div className='relative flex-grow'>
          <input
            type='text'
            placeholder='Search teams...'
            className='w-full pl-10 pr-4 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
          <div className='absolute left-3 top-1/2 transform -translate-y-1/2'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5 text-gray-400'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              />
            </svg>
          </div>
        </div>

        <div className='ml-3'>
          <select className='border border-gray-200 rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500'>
            <option>Sort By</option>
            <option>Name A-Z</option>
            <option>Name Z-A</option>
            <option>Rating (High to Low)</option>
            <option>Rating (Low to High)</option>
            <option>Team Size</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default TeamRosterFilter;
