"use client";

import React, { useState } from "react";
import { Booking } from "@/types/booking";
import BookingFilter from "./BookingFilter";
import BookingDetail from "./BookingDetail";

const BookingsList: React.FC = () => {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Sample data
  const bookings: Booking[] = [
    {
      id: "B-5012",
      customerId: "C-10245",
      customerName: "Alex Johnson",
      customerType: "residential",
      serviceType: "Deep Cleaning",
      status: "scheduled",
      date: "2025-03-21",
      timeSlot: "09:00 - 12:00",
      duration: 3,
      address: "123 Main St, Anytown, CA 94105",
      teamMembers: ["Maria Rodriguez", "David Smith"],
      price: 210,
      notes: "Third floor apartment. Parking available in visitor spots.",
      specialRequests: "Please pay special attention to kitchen appliances.",
      createdAt: "2025-03-12T10:23:18",
      lastUpdated: "2025-03-12T10:23:18",
    },
    {
      id: "B-5013",
      customerId: "C-10252",
      customerName: "TechCorp Inc.",
      customerType: "commercial",
      serviceType: "Regular Cleaning",
      status: "scheduled",
      date: "2025-03-20",
      timeSlot: "18:00 - 22:00",
      duration: 4,
      address: "789 Business Blvd, Downtown, CA 94111",
      teamMembers: ["James Wilson", "Sarah Lee", "Miguel Hernandez"],
      price: 450,
      notes:
        "Use service entrance at the back of the building. Security will be expecting the team.",
      specialRequests:
        "Conference rooms on 3rd floor need to be ready for morning meetings.",
      createdAt: "2025-03-10T14:15:00",
      lastUpdated: "2025-03-15T09:20:10",
    },
    {
      id: "B-5009",
      customerId: "C-10246",
      customerName: "Maria Garcia",
      customerType: "residential",
      serviceType: "Move In/Out",
      status: "in-progress",
      date: "2025-03-17",
      timeSlot: "10:00 - 16:00",
      duration: 6,
      address: "456 Oak Ave, Somewhere, CA 94107",
      teamMembers: ["Lisa Chen", "Robert Taylor"],
      price: 375,
      notes:
        "New construction. All supplies need to be eco-friendly as requested.",
      specialRequests: "Focus on removing paint spots from windows and floors.",
      createdAt: "2025-03-05T11:45:32",
      lastUpdated: "2025-03-17T10:05:12",
    },
    {
      id: "B-5006",
      customerId: "C-10291",
      customerName: "Riverfront Restaurant",
      customerType: "commercial",
      serviceType: "Deep Cleaning",
      status: "completed",
      date: "2025-03-14",
      timeSlot: "22:00 - 03:00",
      duration: 5,
      address: "159 River St, Waterside, CA 94133",
      teamMembers: ["Carlos Mendes", "Aisha Patel", "Tom Johnson"],
      price: 650,
      notes:
        "Health inspection scheduled for next day. Critical to meet all standards.",
      specialRequests: "Steam clean all kitchen surfaces and equipment.",
      createdAt: "2025-03-01T16:30:00",
      lastUpdated: "2025-03-15T03:10:45",
    },
    {
      id: "B-5001",
      customerId: "C-10273",
      customerName: "James Wilson",
      customerType: "residential",
      serviceType: "Post-Construction",
      status: "completed",
      date: "2025-02-28",
      timeSlot: "08:00 - 15:00",
      duration: 7,
      address: "321 Cedar Ln, Elsewhere, CA 94110",
      teamMembers: ["Emma White", "Jose Garcia", "Nicole Brown"],
      price: 525,
      notes:
        "Major renovation cleanup. Bring industrial vacuum for construction dust.",
      specialRequests:
        "Careful attention to new wooden floors, use only approved cleaners.",
      createdAt: "2025-02-15T09:12:45",
      lastUpdated: "2025-02-28T15:30:22",
    },
    {
      id: "B-4998",
      customerId: "C-10234",
      customerName: "Emily Chen",
      customerType: "residential",
      serviceType: "Regular Cleaning",
      status: "cancelled",
      date: "2025-01-20",
      timeSlot: "13:00 - 15:00",
      duration: 2,
      address: "753 Maple Dr, Suburb, CA 94112",
      teamMembers: ["David Smith"],
      price: 120,
      notes: "Customer has cats. Ensure doors are kept closed at all times.",
      specialRequests: "Use only pet-friendly products.",
      createdAt: "2025-01-10T14:22:15",
      lastUpdated: "2025-01-18T09:45:30",
    },
  ];

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
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "in-progress":
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

  return (
    <div className='bg-white rounded-lg shadow overflow-hidden'>
      <div className='flex justify-between items-center p-4 border-b'>
        <h2 className='text-lg font-medium'>Bookings</h2>
        <BookingFilter
          currentFilter={filterStatus}
          onFilterChange={handleStatusChange}
          bookingCount={filteredBookings.length}
        />
      </div>

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
                Service
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Date & Time
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
            {filteredBookings.map((booking) => (
              <tr key={booking.id} className='hover:bg-gray-50'>
                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                  {booking.id}
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='flex items-center'>
                    <div>
                      <div className='text-sm font-medium text-gray-900'>
                        {booking.customerName}
                      </div>
                      <div className='text-xs text-gray-500'>
                        <span
                          className={`inline-flex px-2 text-xs leading-5 font-semibold rounded-full ${
                            booking.customerType === "commercial"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}>
                          {booking.customerType === "commercial"
                            ? "Commercial"
                            : "Residential"}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm text-gray-900'>
                    {booking.serviceType}
                  </div>
                  <div className='text-sm text-gray-500'>
                    {booking.duration} hours
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm text-gray-900'>
                    {formatDate(booking.date)}
                  </div>
                  <div className='text-sm text-gray-500'>
                    {booking.timeSlot}
                  </div>
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
                  <div className='text-sm text-gray-900'>
                    {booking.teamMembers.length}{" "}
                    {booking.teamMembers.length === 1 ? "member" : "members"}
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
