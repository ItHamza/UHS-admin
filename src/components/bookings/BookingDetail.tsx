import React from "react";
import BookingDetailHeader from "./BookingDetailHeader";
import { Booking } from "@/types/booking";

interface BookingDetailProps {
  booking: Booking;
  onClose: () => void;
}

const BookingDetail: React.FC<BookingDetailProps> = ({ booking, onClose }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <>
      <BookingDetailHeader booking={booking} onClose={onClose} />

      <div className='flex-1 overflow-y-auto py-6 px-4 sm:px-6'>
        {/* Customer Information */}
        <div className='mb-6'>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            Customer Information
          </h3>
          <div className='bg-gray-50 p-4 rounded-lg'>
            <div className='flex items-center mb-3'>
              <div className='bg-indigo-100 rounded-full h-10 w-10 flex items-center justify-center mr-3'>
                <span className='text-indigo-800 font-medium'>
                  {booking.customerName.charAt(0)}
                </span>
              </div>
              <div>
                <h4 className='text-md font-medium'>{booking.customerName}</h4>
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
            <div className='text-sm'>
              <p className='text-gray-700'>
                <span className='font-medium'>Customer ID:</span>{" "}
                {booking.customerId}
              </p>
              <p className='text-gray-700 mt-1'>
                <span className='font-medium'>Address:</span> {booking.address}
              </p>
            </div>
          </div>
        </div>

        {/* Service Details */}
        <div className='mb-6'>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            Service Details
          </h3>
          <div className='bg-gray-50 p-4 rounded-lg'>
            <div className='grid grid-cols-2 gap-4 mb-4'>
              <div>
                <p className='text-sm text-gray-500'>Service Type</p>
                <p className='font-medium'>{booking.serviceType}</p>
              </div>
              <div>
                <p className='text-sm text-gray-500'>Price</p>
                <p className='font-medium'>{formatCurrency(booking.price)}</p>
              </div>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <p className='text-sm text-gray-500'>Date</p>
                <p className='font-medium'>{formatDate(booking.date)}</p>
              </div>
              <div>
                <p className='text-sm text-gray-500'>Time</p>
                <p className='font-medium'>{booking.timeSlot}</p>
              </div>
            </div>
            <div className='mt-4'>
              <p className='text-sm text-gray-500'>Duration</p>
              <p className='font-medium'>{booking.duration} hours</p>
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className='mb-6'>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            Team Members
          </h3>
          <div className='bg-gray-50 p-4 rounded-lg'>
            <ul className='divide-y divide-gray-200'>
              {booking.teamMembers.map((member, index) => (
                <li key={index} className='py-2 flex items-center'>
                  <div className='bg-gray-200 rounded-full h-8 w-8 flex items-center justify-center mr-3'>
                    <span className='text-gray-600 font-medium text-sm'>
                      {member
                        .split(" ")
                        .map((part) => part[0])
                        .join("")}
                    </span>
                  </div>
                  <span>{member}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Notes & Special Requests */}
        <div className='mb-6'>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            Notes & Requests
          </h3>
          <div className='bg-gray-50 p-4 rounded-lg'>
            <div className='mb-4'>
              <h4 className='text-sm font-medium text-gray-700 mb-2'>Notes</h4>
              <p className='text-sm text-gray-800 bg-white p-3 rounded border border-gray-200'>
                {booking.notes || "No notes provided."}
              </p>
            </div>
            <div>
              <h4 className='text-sm font-medium text-gray-700 mb-2'>
                Special Requests
              </h4>
              <p className='text-sm text-gray-800 bg-white p-3 rounded border border-gray-200'>
                {booking.specialRequests || "No special requests."}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='mt-6 flex space-x-3'>
          {booking.status === "scheduled" && (
            <>
              <button className='flex-1 bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                Edit Booking
              </button>
              <button className='flex-1 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                Start Service
              </button>
            </>
          )}
          {booking.status === "in-progress" && (
            <button className='flex-1 bg-green-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'>
              Complete Service
            </button>
          )}
          {booking.status === "completed" && (
            <button className='flex-1 bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
              Create Invoice
            </button>
          )}
          {booking.status !== "cancelled" && booking.status !== "completed" && (
            <button className='flex-1 bg-red-50 py-2 px-4 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'>
              Cancel Booking
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default BookingDetail;
