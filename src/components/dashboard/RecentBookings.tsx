"use client";

import React, { useState } from "react";

interface Booking {
  id: string;
  customer: string;
  service: string;
  team: string;
  date: string;
  time: string;
  status: "confirmed" | "completed" | "cancelled";
}

const RecentBookings: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const bookings: Booking[] = [
    {
      id: "B-7829",
      customer: "Alex Johnson",
      service: "Premium Cleaning",
      team: "Team A",
      date: "2025-03-17",
      time: "09:00 AM",
      status: "confirmed",
    },
    {
      id: "B-7830",
      customer: "Maria Garcia",
      service: "Deep Cleaning",
      team: "Team B",
      date: "2025-03-17",
      time: "01:30 PM",
      status: "confirmed",
    },
    {
      id: "B-7831",
      customer: "James Wilson",
      service: "Post-Construction",
      team: "Team C",
      date: "2025-03-18",
      time: "10:00 AM",
      status: "confirmed",
    },
    {
      id: "B-7824",
      customer: "Emily Chen",
      service: "Standard Cleaning",
      team: "Team A",
      date: "2025-03-16",
      time: "02:00 PM",
      status: "completed",
    },
    {
      id: "B-7825",
      customer: "David Kim",
      service: "Move-Out Cleaning",
      team: "Team D",
      date: "2025-03-15",
      time: "11:30 AM",
      status: "completed",
    },
    {
      id: "B-7826",
      customer: "Sophie Martinez",
      service: "Premium Cleaning",
      team: "Team B",
      date: "2025-03-14",
      time: "09:00 AM",
      status: "cancelled",
    },
  ];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleString("default", { month: "long" });
  };

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className='h-10 w-10'></div>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split("T")[0];

      const hasBookings = bookings.some(
        (booking) => booking.date === dateString
      );

      days.push(
        <div
          key={day}
          className={`flex items-center justify-center h-10 w-10 rounded-full cursor-pointer transition-colors
            ${
              selectedDate && selectedDate.getTime() === date.getTime()
                ? "bg-blue-500 text-white"
                : hasBookings
                ? "text-blue-800 hover:bg-blue-100 relative"
                : "hover:bg-gray-100"
            }`}
          onClick={() => {
            if (selectedDate && selectedDate.getTime() === date.getTime()) {
              setSelectedDate(null);
            } else {
              setSelectedDate(date);
            }
          }}>
          {day}
          {hasBookings && (
            <span className='absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full'></span>
          )}
        </div>
      );
    }

    return days;
  };

  const filteredBookings = selectedDate
    ? bookings.filter(
        (booking) => booking.date === selectedDate.toISOString().split("T")[0]
      )
    : bookings;

  const getStatusBadgeColor = (status: Booking["status"]) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className='grid grid-cols-1 lg:grid-cols-5 gap-6'>
      <div className='lg:col-span-2 bg-white rounded-lg shadow p-4'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-lg font-medium'>Booking Calendar</h2>
          <div className='flex space-x-2 items-center'>
            <button
              onClick={prevMonth}
              className='p-1 rounded-full hover:bg-gray-100'>
              <svg
                className='w-5 h-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15 19l-7-7 7-7'
                />
              </svg>
            </button>
            <span className='text-sm font-medium'>
              {getMonthName(currentMonth)} {currentMonth.getFullYear()}
            </span>
            <button
              onClick={nextMonth}
              className='p-1 rounded-full hover:bg-gray-100'>
              <svg
                className='w-5 h-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 5l7 7-7 7'
                />
              </svg>
            </button>
          </div>
        </div>

        <div className='grid grid-cols-7 gap-1 mb-2'>
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div
              key={day}
              className='h-8 flex items-center justify-center text-xs text-gray-500 font-medium'>
              {day}
            </div>
          ))}
        </div>

        <div className='grid grid-cols-7 gap-1'>{renderCalendar()}</div>

        <div className='mt-4 pt-4 border-t'>
          <h3 className='text-sm font-medium mb-2'>
            {selectedDate
              ? selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })
              : "All Upcoming Bookings"}
          </h3>

          {filteredBookings.length === 0 ? (
            <p className='text-sm text-gray-500'>No bookings for this date.</p>
          ) : (
            <div className='space-y-2'>
              {filteredBookings.slice(0, 3).map((booking) => (
                <div
                  key={booking.id}
                  className='flex items-center space-x-2 text-sm p-2 hover:bg-gray-50 rounded'>
                  <div className='flex-shrink-0 w-2 h-2 rounded-full bg-blue-500'></div>
                  <div>
                    <p className='font-medium'>{booking.time}</p>
                    <p className='text-gray-500'>{booking.service}</p>
                  </div>
                </div>
              ))}
              {filteredBookings.length > 3 && (
                <p className='text-sm text-blue-500 cursor-pointer hover:underline'>
                  View all {filteredBookings.length} bookings
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className='lg:col-span-3 bg-white rounded-lg shadow overflow-hidden'>
        <div className='p-4 border-b'>
          <h2 className='text-lg font-medium'>Recent Bookings</h2>
        </div>

        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Booking
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
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {bookings.slice(0, 5).map((booking) => (
                <tr key={booking.id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                    {booking.id}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {booking.customer}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {booking.service}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    <div>{new Date(booking.date).toLocaleDateString()}</div>
                    <div className='text-xs'>{booking.time}</div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                        booking.status
                      )}`}>
                      {booking.status.charAt(0).toUpperCase() +
                        booking.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className='p-4 border-t'>
          <button className='text-sm text-blue-500 hover:text-blue-700'>
            View all bookings
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecentBookings;
