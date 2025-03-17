"use client";

import React, { useState } from "react";

const CustomerFilters: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [customerType, setCustomerType] = useState("all");
  const [serviceCategories, setServiceCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("recent");

  const handleServiceCategoryToggle = (category: string) => {
    if (serviceCategories.includes(category)) {
      setServiceCategories(serviceCategories.filter((c) => c !== category));
    } else {
      setServiceCategories([...serviceCategories, category]);
    }
  };

  const handleReset = () => {
    setSearchQuery("");
    setCustomerType("all");
    setServiceCategories([]);
    setSortBy("recent");
  };

  return (
    <div className='bg-white rounded-lg shadow p-4'>
      <h2 className='text-lg font-medium mb-4'>Filters</h2>

      <div className='mb-4'>
        <label
          htmlFor='search'
          className='block text-sm font-medium text-gray-700 mb-1'>
          Search
        </label>
        <div className='relative'>
          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
            <svg
              className='h-4 w-4 text-gray-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              />
            </svg>
          </div>
          <input
            type='text'
            id='search'
            className='pl-10 py-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm'
            placeholder='Name, email, phone...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className='mb-4'>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Customer Type
        </label>
        <div className='space-y-2'>
          <div className='flex items-center'>
            <input
              id='all'
              name='customerType'
              type='radio'
              checked={customerType === "all"}
              onChange={() => setCustomerType("all")}
              className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300'
            />
            <label htmlFor='all' className='ml-2 block text-sm text-gray-700'>
              All Customers
            </label>
          </div>
          <div className='flex items-center'>
            <input
              id='residential'
              name='customerType'
              type='radio'
              checked={customerType === "residential"}
              onChange={() => setCustomerType("residential")}
              className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300'
            />
            <label
              htmlFor='residential'
              className='ml-2 block text-sm text-gray-700'>
              Residential
            </label>
          </div>
          <div className='flex items-center'>
            <input
              id='commercial'
              name='customerType'
              type='radio'
              checked={customerType === "commercial"}
              onChange={() => setCustomerType("commercial")}
              className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300'
            />
            <label
              htmlFor='commercial'
              className='ml-2 block text-sm text-gray-700'>
              Commercial
            </label>
          </div>
        </div>
      </div>

      <div className='mb-4'>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Service Categories
        </label>
        <div className='space-y-2'>
          {[
            "Regular Cleaning",
            "Deep Cleaning",
            "Post-Construction",
            "Move In/Out",
            "Special Events",
          ].map((category) => (
            <div key={category} className='flex items-center'>
              <input
                id={category}
                type='checkbox'
                checked={serviceCategories.includes(category)}
                onChange={() => handleServiceCategoryToggle(category)}
                className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
              />
              <label
                htmlFor={category}
                className='ml-2 block text-sm text-gray-700'>
                {category}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className='mb-6'>
        <label
          htmlFor='sortBy'
          className='block text-sm font-medium text-gray-700 mb-1'>
          Sort By
        </label>
        <select
          id='sortBy'
          className='block w-full py-2 pl-3 pr-10 text-sm border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md'
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}>
          <option value='recent'>Most Recent</option>
          <option value='name'>Name A-Z</option>
          <option value='bookings'>Most Bookings</option>
          <option value='value'>Highest Value</option>
        </select>
      </div>

      <div className='pt-4 border-t border-gray-200 flex justify-between'>
        <button
          onClick={handleReset}
          className='text-sm text-gray-600 hover:text-gray-900'>
          Reset Filters
        </button>
        <button
          onClick={() => {}}
          className='text-sm bg-blue-50 text-blue-600 py-1 px-3 rounded hover:bg-blue-100'>
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default CustomerFilters;
