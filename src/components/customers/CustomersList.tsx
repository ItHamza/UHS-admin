"use client";

import React, { useEffect, useMemo, useState, useTransition } from "react";
import CustomerDetail from "./CustomerDetails";
import CustomerAction from "@/actions/customer";
import EditCustomerModal from "./EditCustomerDailog";
import { UserDeleteAction } from "@/actions/users";
import toast from "react-hot-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MagnifyingGlassIcon, XCircleIcon } from "@heroicons/react/24/outline";

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
  const queryClient = useQueryClient()
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [showEditUser, setShowEditUser] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [searchInput, setSearchInput] = useState(''); // local input
  const [search, setSearch] = useState("");

    // Enhanced filter states
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    service: "all",
    team: "all",
    frequency: "all",
    dateRange: "all",
    amountRange: "all",
  })

  const { data, isPending } = useQuery<{ data: Customer[], pagination: any }>({
    queryKey: ['customers', page, itemsPerPage, search],
    queryFn: () => fetch(`/api/customer?page=${page}&limit=${itemsPerPage}&search=${search}`).then(res => res.json())
  })

  const customers = data?.data ?? []
  const pagination = data?.pagination ?? {
    current_page: 1,
    per_page: 10,
    total: 0,
    total_pages: 0,
    has_next_page: false,
    has_previous_page: false,
    next_page: null,
    previous_page: null,
    showing_from: 0,
    showing_to: 0,
  }


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


  const refreshCustomers = () => {
    queryClient.invalidateQueries({ queryKey: ['customers'] })
  }

  
  const getActiveFilterCount = () => {
    return (
      Object.entries(filters).filter(([key, value]) => key !== "search" && value !== "all").length +
      (filters.search ? 1 : 0)
    )
  }

  
  const clearAllFilters = () => {
    setFilters({
      search: "",
      status: "all",
      service: "all",
      team: "all",
      frequency: "all",
      dateRange: "all",
      amountRange: "all",
    })
  }


  return (
    <div className='bg-white rounded-lg shadow overflow-hidden'>
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Customer</h2>
              <p className="text-sm text-gray-600 mt-1">
                Manage customers ({customers?.length} results)
              </p>
            </div>

            {/* Filter Toggle Button */}
            <div className="flex items-center space-x-3">
              {/* <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Filters
                {getActiveFilterCount() > 0 && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {getActiveFilterCount()}
                  </span>
                )}
                <ChevronDownIcon className={`ml-2 h-4 w-4 transition-transform ${isFilterOpen ? "rotate-180" : ""}`} />
              </button> */}

              {getActiveFilterCount() > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <XCircleIcon className="h-4 w-4 mr-1" />
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchInput}
              placeholder="Search by customer name, phone & email"
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setSearch(searchInput);
                }
              }}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />

            {search && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <XCircleIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>
      </div>
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
              {customers?.map((customer, index) => (
                <tr key={`${customer.id}:${index}`} className='hover:bg-gray-50'>
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

      {/* Pagination */}
      <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 gap-4">
          <div>
          <p className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-medium">{pagination.showing_from}</span> to{" "}
            <span className="font-medium">{pagination.showing_to}</span> of{" "}
            <span className="font-medium">{pagination.total}</span> results
          </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-700 flex items-center gap-2">
              <span>Show</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setPage(1);
                }}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <span>per page</span>
            </div>
            <div className="inline-flex space-x-2">
              <button
                onClick={() => setPage(pagination.previous_page!)}
                disabled={!pagination.has_previous_page}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(pagination.next_page!)}
                disabled={!pagination.has_next_page}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
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
