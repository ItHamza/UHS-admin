import { Booking } from "@/types/booking";
import React from "react";

interface BookingDetailHeaderProps {
  booking: Booking;
  onClose: () => void;
}

const BookingDetailHeader: React.FC<BookingDetailHeaderProps> = ({
  booking,
  onClose,
}) => {
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
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className='flex mt-15 md:mt-0 items-start justify-between px-4 py-6 sm:px-6 border-b border-gray-200'>
      <div>
        <div className='flex items-center'>
          <h2 className='text-lg font-medium text-gray-900 mr-2'>
            Booking {booking.id}
          </h2>
          <span
            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
              booking.status
            )}`}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </span>
        </div>
        <p className='mt-1 text-sm text-gray-500'>
          Created on {new Date(booking.createdAt).toLocaleString()}
        </p>
        {booking.createdAt !== booking.lastUpdated && (
          <p className='text-xs text-gray-500'>
            Last updated: {new Date(booking.lastUpdated).toLocaleString()}
          </p>
        )}
      </div>
      <div>
        <button
          type='button'
          className='-m-2 p-2 text-gray-400 hover:text-gray-500'
          onClick={onClose}>
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
  );
};

export default BookingDetailHeader;
