"use client";

import React, { useEffect, useState } from "react";
import AddCustomerModal from "../bookings/CreateCustomerDialog";
import AreaAction from "@/actions/area";
import toast from "react-hot-toast";

const CustomersHeader: React.FC = () => {
  const [showCreateUser, setShowCreateUser] = useState<boolean>(false);
  const [areas, setAreas] = useState<any[]>([]);

  const fetchArea = async () => {
    try {
      const area = await AreaAction();
      setAreas(area);
    } catch (error: any) {
      console.log("error", error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchArea();
  }, []);

  return (
    <div className='flex flex-col md:flex-row md:items-center md:justify-between'>
      <div>
        <h1 className='text-2xl font-semibold text-gray-800'>Customers</h1>
        <p className='mt-1 text-sm text-gray-500'>
          Manage your customer database and view detailed customer information
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
        <button
          onClick={() => {
            setShowCreateUser(true);
          }}
          className='bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-sm flex items-center'>
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
          Add Customer
        </button>
      </div>
      {showCreateUser && (
        <AddCustomerModal
          isOpen={showCreateUser}
          onClose={() => {
            setShowCreateUser(!showCreateUser);
          }}
          areas={areas}
        />
      )}
    </div>
  );
};

export default CustomersHeader;
