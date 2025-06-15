"use client";

import React, { useEffect, useState, useTransition } from "react";
import CustomerDetail from "./CustomerDetails";
import CustomerAction from "@/actions/customer";
import EditCustomerModal from "./EditCustomerDailog";
import { UserDeleteAction } from "@/actions/users";
import toast from "react-hot-toast";

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
  residence_type: any;
  [key: string]: any;
}

const CustomersList: React.FC = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [showEditUser, setShowEditUser] = useState<boolean>(false);
  

  const [customers, setCustomers] = useState<Customer[]>([]);

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      try {
        const data = await CustomerAction();

        setCustomers(data);
      } catch (error) {
        console.error("Failed to fetch customers:", error);
      }
    });
  }, []);

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
  };

  const ShimmerTable = () => (
    <div className='animate-pulse'>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className='flex space-x-4 p-4 border-b'>
          <div className='w-24 h-6 bg-gray-300 rounded'></div>
          <div className='w-40 h-6 bg-gray-300 rounded'></div>
          <div className='w-40 h-6 bg-gray-300 rounded'></div>
          <div className='w-24 h-6 bg-gray-300 rounded'></div>
          <div className='w-24 h-6 bg-gray-300 rounded'></div>
          <div className='w-24 h-6 bg-gray-300 rounded'></div>
          <div className='w-24 h-6 bg-gray-300 rounded'></div>
        </div>
      ))}
    </div>
  );

  const ShimmerHeader = () => (
    <div className='animate-pulse'>
      <div className='flex justify-between items-center p-4 border-b'>
        <h2 className='text-lg bg-gray-300 font-medium h-6 w-28'></h2>
        <span className='text-sm bg-gray-300 text-gray-500  h-6 w-20'></span>
      </div>
    </div>
  );

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowEditUser(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await UserDeleteAction(id);
      toast.success("User deleted successfully");
      // Optional: refresh or update local state here
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete user");
    } finally {
      refreshCustomers()
    }
  };


  const refreshCustomers = async () => {
    const data = await CustomerAction();
    setCustomers(data);
  };


  return (
    <div className='bg-white rounded-lg shadow overflow-hidden'>
      {isPending ? (
        <ShimmerHeader />
      ) : (
        <div className='flex justify-between items-center p-4 border-b'>
          <h2 className='text-lg font-medium'>Customer Directory</h2>
          <span className='text-sm text-gray-500'>
            {customers.length} customers
          </span>
        </div>
      )}
      {isPending ? (
        <ShimmerTable />
      ) : (
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Customer
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Contact Info
                </th>
                {/* <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Type
                </th> */}
                {/* <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Services
                </th> */}
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Bookings
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Status
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  {/* Actions */}
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {customers.map((customer) => (
                <tr key={customer.id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center'>
                      <div>
                        <div className='text-sm font-medium text-gray-900'>
                          {customer.name}
                        </div>
                        <div className='text-sm text-gray-500'>
                          {customer.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-gray-900'>
                      {customer.email}
                    </div>
                    <div className='text-sm text-gray-500'>
                      {customer.phone}
                    </div>
                  </td>
                  {/* <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        customer.type === "commercial"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}>
                      {customer.type === "commercial"
                        ? "Commercial"
                        : "Residential"}
                    </span>
                  </td> */}
                  {/* <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-gray-900'>
                      {customer.services.slice(0, 2).join(", ")}
                      {customer.services.length > 2 && "..."}
                    </div>
                  </td> */}
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-gray-900'>
                      {customer.totalBookings} total
                    </div>
                    <div className='text-sm text-gray-500'>
                      Last:{" "}
                      {new Date(
                        customer.lastServiceDate
                      ).toLocaleDateString() === "Invalid Date"
                        ? customer.lastServiceDate
                        : new Date(
                            customer.lastServiceDate
                          ).toLocaleDateString()}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        customer.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                      {customer.status === "Active" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className='px-6 gap-2 flex items-center py-4 whitespace-nowrap text-right text-sm font-medium'>
                    <button
                      onClick={() => handleEditCustomer(customer)}
                      className='text-indigo-600 cursor-pointer hover:text-indigo-900'>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(customer.base_id)}
                      className='text-red-600 cursor-pointer hover:text-red-900'>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination could go here */}
      <div className='bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6'>
        <div className='flex-1 flex justify-between sm:hidden'>
          <button className='relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'>
            Previous
          </button>
          <button className='ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'>
            Next
          </button>
        </div>
        <div className='hidden sm:flex-1 sm:flex sm:items-center sm:justify-between'>
          <div>
            <p className='text-sm text-gray-700'>
              Showing <span className='font-medium'>1</span> to{" "}
              <span className='font-medium'>{customers.length}</span> of{" "}
              <span className='font-medium'>{customers.length}</span> results
            </p>
          </div>
          <div>
            <nav
              className='relative z-0 inline-flex rounded-md shadow-sm -space-x-px'
              aria-label='Pagination'>
              <button className='relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50'>
                Previous
              </button>
              <button className='bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium'>
                1
              </button>
              <button className='relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50'>
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Customer detail modal/sidebar */}
      {isDetailOpen && selectedCustomer && (
        <div
          className='fixed inset-0 overflow-hidden'
          aria-labelledby='slide-over-title'
          role='dialog'
          aria-modal='true'>
          <div className='absolute inset-0 overflow-hidden'>
            {/* Background overlay */}
            <div
              className='absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity'
              aria-hidden='true'
              onClick={handleCloseDetail}></div>

            <div className='fixed inset-y-0 right-0 pl-10 max-w-full flex'>
              <div className='relative w-screen max-w-md'>
                <div className='h-full flex flex-col bg-white shadow-xl overflow-y-scroll'>
                  <div className='flex-1 overflow-y-auto py-6 px-4 sm:px-6'>
                    <div className='flex md:mt-0 mt-15 items-start justify-between'>
                      <h2
                        className='text-lg font-medium text-gray-900'
                        id='slide-over-title'>
                        Customer Details
                      </h2>
                      <div className='ml-3 h-7 flex items-center'>
                        <button
                          type='button'
                          className='-m-2 p-2 text-gray-400 hover:text-gray-500'
                          onClick={handleCloseDetail}>
                          <span className='sr-only'>Close panel</span>
                          <svg
                            className='h-6 w-6'
                            xmlns='http://www.w3.org/2000/svg'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                            aria-hidden='true'>
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth='2'
                              d='M6 18L18 6M6 6l12 12'
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    {/* <CustomerDetail customer={selectedCustomer} /> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showEditUser && (
        <EditCustomerModal
          customer={selectedCustomer}
          isOpen={showEditUser}
          onClose={() => {
            setShowEditUser(!showEditUser);
          }}
        />
      )}
    </div>
  );
};

export default CustomersList;
