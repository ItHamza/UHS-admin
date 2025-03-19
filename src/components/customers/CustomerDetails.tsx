import React from "react";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  type: "residential" | "commercial";
  services: string[];
  totalBookings: number;
  lastServiceDate: string;
  totalSpent: number;
  notes: string;
  status: "Active" | "Inactive";
  joinDate: string;
}

interface CustomerDetailProps {
  customer: Customer;
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({ customer }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className='mt-6'>
      <div className='border-b border-gray-200 pb-6'>
        <div className='flex items-center mb-4'>
          <div className='bg-gray-100 rounded-full h-12 w-12 flex items-center justify-center mr-4'>
            <span className='text-lg font-medium text-gray-600'>
              {customer.name.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className='text-lg font-medium text-gray-900'>
              {customer.name}
            </h3>
            <p className='text-sm text-gray-500'>
              {customer.type === "commercial" ? "Commercial" : "Residential"}{" "}
              Customer
            </p>
          </div>
        </div>
        <div className='mb-4'>
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${
              customer.status === "Active"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}>
            {customer.status === "Active" ? "Active" : "Inactive"}
          </span>
          <span className='text-sm text-gray-500 ml-2'>
            Customer since {formatDate(customer.joinDate)}
          </span>
        </div>
      </div>

      <div className='py-4 border-b border-gray-200'>
        <h4 className='text-sm font-medium text-gray-500 mb-2'>
          Contact Information
        </h4>
        <div className='grid grid-cols-1 gap-2'>
          <div className='flex items-center'>
            <svg
              className='h-5 w-5 text-gray-400 mr-2'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
              />
            </svg>
            <span className='text-sm'>{customer.email}</span>
          </div>
          <div className='flex items-center'>
            <svg
              className='h-5 w-5 text-gray-400 mr-2'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
              />
            </svg>
            <span className='text-sm'>{customer.phone}</span>
          </div>
          <div className='flex items-center'>
            <svg
              className='h-5 w-5 text-gray-400 mr-2'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
              />
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
              />
            </svg>
            <span className='text-sm'>{customer.address}</span>
          </div>
        </div>
      </div>

      <div className='py-4 border-b border-gray-200'>
        <h4 className='text-sm font-medium text-gray-500 mb-2'>
          Service History
        </h4>
        <div className='grid grid-cols-2 gap-4 mb-4'>
          <div className='bg-gray-50 p-3 rounded'>
            <p className='text-sm text-gray-500'>Total Bookings</p>
            <p className='text-lg font-medium'>{customer.totalBookings}</p>
          </div>
          <div className='bg-gray-50 p-3 rounded'>
            <p className='text-sm text-gray-500'>Total Spent</p>
            <p className='text-lg font-medium'>
              ${customer.totalSpent.toLocaleString()}
            </p>
          </div>
        </div>
        <div className='mb-4'>
          <p className='text-sm text-gray-500'>Last Booking</p>
          <p className='text-sm font-medium'>
            {formatDate(customer.lastServiceDate)}
          </p>
        </div>
      </div>

      <div className='py-4 border-b border-gray-200'>
        <h4 className='text-sm font-medium text-gray-500 mb-2'>
          Services Used
        </h4>
        <div className='flex flex-wrap gap-2'>
          {customer.services.map((service, index) => (
            <span
              key={index}
              className='px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded'>
              {service}
            </span>
          ))}
        </div>
      </div>

      <div className='py-4'>
        <h4 className='text-sm font-medium text-gray-500 mb-2'>Notes</h4>
        <div className='bg-yellow-50 p-3 rounded border border-yellow-100'>
          <p className='text-sm'>{customer.notes}</p>
        </div>
      </div>

      <div className='mt-6 flex space-x-3'>
        <button className='flex-1 bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
          Edit Customer
        </button>
        <button className='flex-1 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
          Schedule Service
        </button>
      </div>
    </div>
  );
};

export default CustomerDetail;
