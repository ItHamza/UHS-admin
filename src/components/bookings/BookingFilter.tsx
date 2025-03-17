import React from "react";

interface BookingFilterProps {
  currentFilter: string;
  onFilterChange: (status: string) => void;
  bookingCount: number;
}

const BookingFilter: React.FC<BookingFilterProps> = ({
  currentFilter,
  onFilterChange,
  bookingCount,
}) => {
  return (
    <div className='flex space-x-2 items-center'>
      <select
        className='form-select rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'
        value={currentFilter}
        onChange={(e) => onFilterChange(e.target.value)}>
        <option value='all'>All Statuses</option>
        <option value='scheduled'>Scheduled</option>
        <option value='in-progress'>In Progress</option>
        <option value='completed'>Completed</option>
        <option value='cancelled'>Cancelled</option>
      </select>
      <span className='text-sm text-gray-500 flex items-center'>
        {bookingCount} bookings
      </span>
    </div>
  );
};

export default BookingFilter;
