"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Booking } from "@/types/booking";
import BookingFilter from "./BookingFilter";
import BookingDetail from "./BookingDetail";
import BookingAction from "@/actions/booking";

const BookingsList: React.FC = () => {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      try {
        const data = await BookingAction();
        console.log("bookingdata", data);
        setBookings(data);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
      }
    });
  }, []);

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
  };

  const handleStatusChange = (status: string) => {
    setFilterStatus(status);
  };

  const filteredBookings =
    filterStatus === "all"
      ? bookings
      : bookings.filter((booking) => booking.status === filterStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-blue-100 text-blue-800";
      case "in progress":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
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
        <span className='text-sm bg-gray-300 text-gray-500 h-6 w-20'></span>
      </div>
    </div>
  );

  return (
    <div className='bg-white rounded-lg shadow overflow-hidden'>
      {isPending ? (
        <ShimmerHeader />
      ) : (
        <div className='flex justify-between items-center p-4 border-b'>
          <h2 className='text-lg font-medium'>Bookings</h2>
          <BookingFilter
            currentFilter={filterStatus}
            onFilterChange={handleStatusChange}
            bookingCount={filteredBookings.length}
          />
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
                  Booking ID
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Customer
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Frequency
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Period
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Status
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Team
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {filteredBookings.map((booking, idx) => (
                <tr key={idx} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                    {booking.id}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center'>
                      <div>
                        <div className='text-sm font-medium text-gray-900'>
                          {booking.customer}
                        </div>
                        <div className='text-xs text-gray-500'></div>
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-gray-900'>
                      {booking.frequency.charAt(0).toUpperCase() +
                        booking.frequency.slice(1)}
                    </div>
                    {/* <div className='text-sm text-gray-500'>
                      {booking.duration} hours
                    </div> */}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-gray-900'>{booking.date}</div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        booking.status
                      )}`}>
                      {booking.status.charAt(0).toUpperCase() +
                        booking.status.slice(1)}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-gray-900'>{booking.team}</div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                    <button
                      onClick={() => handleViewBooking(booking)}
                      className='text-indigo-600 hover:text-indigo-900'>
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
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
              <span className='font-medium'>{filteredBookings.length}</span> of{" "}
              <span className='font-medium'>{filteredBookings.length}</span>{" "}
              results
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

      {/* Booking detail modal/sidebar */}
      {isDetailOpen && selectedBooking && (
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
                  <BookingDetail
                    booking={selectedBooking}
                    onClose={handleCloseDetail}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsList;
