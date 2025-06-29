"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Booking } from "@/types/booking";
import BookingFilter from "./BookingFilter";
import BookingDetail from "./BookingDetail";
import BookingAction from "@/actions/booking";
import moment from "moment";

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
      ? bookings.filter((booking) => booking.service?.name != "Deep Cleaning" && booking.service?.name != "Residential Cleaning")
      : bookings.filter((booking) => (booking.status === filterStatus) && (booking.service?.name != "Deep Cleaning" && booking.service?.name != "Residential Cleaning"));

  const getStatusColor = (status: string) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-red-100 text-red-800",
      completed: "bg-green-100 text-green-800",
      in_progress: "bg-blue-100 text-blue-800",
    };
    return (
      statusColors[status as keyof typeof statusColors] ||
      "bg-gray-100 text-gray-800"
    );
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
    <div className='bg-white rounded-lg shadow overflow-hidden w-full'>
      {isPending ? (
        <ShimmerHeader />
      ) : (
        <div className='flex justify-between flex-col md:flex-row  md:items-center p-4 border-b'>
          <h2 className='text-lg font-medium'>Bookings</h2>
          <BookingFilter
            currentFilter={filterStatus}
            onFilterChange={handleStatusChange}
            bookingCount={filteredBookings.length}
          />
        </div>
      )}

      {/* Responsive Container with Horizontal Scroll */}
      <div className='w-full overflow-x-auto'>
        {isPending ? (
          <ShimmerTable />
        ) : (
          <div className='max-w-[600px]'>
            {" "}
            {/* Ensure minimum width for full content */}
            <table className='w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  {[
                    "Booking ID",
                    "Customer",
                    "Frequency",
                    "Period",
                    "Status",
                    "Team",
                    "Created At",
                    "Actions",
                  ].map((header, idx) => (
                    <th
                      key={idx}
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {filteredBookings.length > 0 &&
                  filteredBookings.map((booking, idx) => (
                    <tr key={idx} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                        {booking.booking_number}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <div>
                            <div className='text-sm font-medium text-gray-900'>
                              {booking.customer}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-900'>
                          {booking.frequency.charAt(0).toUpperCase() +
                            booking.frequency.slice(1)}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-900'>
                          {moment(booking.date).format("DD MMM YYYY")} -{" "}
                          {moment(booking.end_date).format("DD MMM YYYY")}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            booking.status
                          )}`}>
                          {booking.status.charAt(0).toUpperCase() +
                            booking.status.replaceAll("_", " ").slice(1)}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-900'>
                          {booking.team?.name}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-900'>
                          {moment(booking.createdAt).format("DD MMM YYYY")}
                        </div>
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
      </div>

      {/* Pagination - Simplified and Responsive */}
      <div className='bg-white px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200'>
        <div className='w-full flex justify-between items-center'>
          <div>
            <p className='text-sm text-gray-700'>
              Showing <span className='font-medium'>1</span> to{" "}
              <span className='font-medium'>{filteredBookings.length}</span> of{" "}
              <span className='font-medium'>{filteredBookings.length}</span>{" "}
              results
            </p>
          </div>
          <div className='flex space-x-2'>
            <button
              disabled={true}
              className='px-3 py-1 border rounded text-sm text-gray-500 bg-gray-100 cursor-not-allowed'>
              Previous
            </button>
            <button
              disabled={true}
              className='px-3 py-1 border rounded text-sm text-gray-500 bg-gray-100 cursor-not-allowed'>
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Booking detail modal/sidebar */}
      {isDetailOpen && selectedBooking && (
        <div
          className='fixed inset-0 overflow-hidden z-50'
          aria-labelledby='slide-over-title'
          role='dialog'
          aria-modal='true'>
          <div className='absolute inset-0 overflow-hidden'>
            {/* Background overlay */}
            <div
              className='absolute inset-0 bg-gray-800/40 bg-opacity-75 transition-opacity'
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
