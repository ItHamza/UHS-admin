import React, { useState } from "react";
import BookingDetailHeader from "./BookingDetailHeader";
import { Booking } from "@/types/booking";
import {
  BuildingIcon,
  LayoutGridIcon,
  MapPinIcon,
  UsersIcon,
} from "lucide-react";
import { formatTime } from "@/utils/format-time";
import RescheduleModal from "./RescheduleDialog";
import RenewModal from "./RenewDialog";
import CancelModal from "./CancelModal";

interface BookingDetailProps {
  booking: Booking;
  onClose: () => void;
}

const BookingDetail: React.FC<BookingDetailProps> = ({ booking, onClose }) => {
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

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

      <div className='flex-1 overflow-y-auto py-6 px-6'>
        <div className='flex-1 overflow-y-auto '>
          <div className='mb-6'>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Customer Information
            </h3>
            <div className='bg-gray-50 p-4 rounded-lg'>
              <div className='flex items-center mb-3'>
                <div className='bg-indigo-100 rounded-full h-10 w-10 flex items-center justify-center mr-3'>
                  <span className='text-indigo-800 font-medium'>
                    {booking.customer.charAt(0)}
                  </span>
                </div>
                <div>
                  <h4 className='text-md font-medium'>{booking.customer}</h4>
                  <span
                    className={`inline-flex px-2 py-1 text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-600`}>
                    {booking.service?.name?.replace("_", " ")}
                  </span>
                </div>
              </div>
              <div className='text-sm space-y-2'>
                <div className='flex items-center text-gray-700'>
                  <MapPinIcon className='mr-2 h-5 w-5 text-gray-500' />
                  <div>
                    <span className='font-medium'>
                      Apt {booking.appartment_number},{" "}
                    </span>
                    <span>{booking.residence_type?.type}</span>
                  </div>
                </div>
                <div className='flex items-center text-gray-700'>
                  <BuildingIcon className='mr-2 h-5 w-5 text-gray-500' />
                  <span>{booking.property?.name}</span>
                </div>
                <div className='flex items-center text-gray-700'>
                  <LayoutGridIcon className='mr-2 h-5 w-5 text-gray-500' />
                  <span>
                    {booking.district?.name}, {booking.area?.name}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className='mb-6'>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Service Details
            </h3>
            <div className='bg-gray-50 p-4 rounded-lg'>
              <div className='grid grid-cols-2 gap-4 mb-4'>
                <div>
                  <p className='text-sm text-gray-500'>Service Type</p>
                  <p className='font-medium'>{booking.service?.name}</p>
                </div>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-gray-500'>Start Date</p>
                  <p className='font-medium'>{formatDate(booking.date)}</p>
                </div>
                <div>
                  <p className='text-sm text-gray-500'>End Date</p>
                  <p className='font-medium'>{formatDate(booking.end_date)}</p>
                </div>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div className='mt-4'>
                  <p className='text-sm text-gray-500'>Timeslots</p>
                  <p className='font-medium'>{booking.duration}</p>
                </div>
                <div className='mt-4'>
                  <p className='text-sm text-gray-500'>Total Price</p>
                  <p className='font-medium'>
                    {booking.currency} {booking.total_amount}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className='mb-6'>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Team Members
            </h3>
            <div className='bg-gray-50 p-4 rounded-lg'>
              <div className='flex items-center mb-3'>
                <UsersIcon className='mr-2 h-6 w-6 text-gray-600' />
                <h4 className='text-md font-medium'>{booking.team?.name}</h4>
              </div>
              {booking.team?.Users && (
                <ul className='divide-y divide-gray-200'>
                  {booking.team?.Users.map((member: any, index: number) => (
                    <li key={index} className='py-2 flex items-center'>
                      <div className='bg-gray-200 rounded-full h-8 w-8 flex items-center justify-center mr-3'>
                        <span className='text-gray-600 font-medium text-sm'>
                          {member.name.charAt(0)}
                        </span>
                      </div>
                      <div className='flex items-center flex-col'>
                        <span>{member.name}</span>
                        <span>{member.phone}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className='mb-6'>
            <div className='bg-gray-50 p-4 rounded-lg'>
              <div>
                <h4 className='text-sm font-medium text-gray-700 mb-2'>
                  Special Requests
                </h4>
                <p className='text-sm text-gray-800 bg-white p-3 rounded border border-gray-200'>
                  {booking.instructions || "No special requests."}
                </p>
              </div>
            </div>
          </div>

          <div className='mb-6'>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Service Schedule
            </h3>
            <div className='bg-gray-50 p-4 rounded-lg'>
              {Array.isArray(booking?.services) && booking.services.length > 0 ? (
                <div className='divide-y divide-gray-200'>
                  {booking.services.map((service: any, index: number) => (
                    <div key={index} className='py-3 grid grid-cols-3 gap-4'>
                      <div>
                        <p className='text-sm text-gray-500'>Date</p>
                        <p className='font-medium'>
                          {formatDate(service.date)}
                        </p>
                      </div>
                      <div>
                        <p className='text-sm text-gray-500'>Start Time</p>
                        <p className='font-medium'>
                          {formatTime(service.start_time)}
                        </p>
                      </div>
                      <div>
                        <p className='text-sm text-gray-500'>End Time</p>
                        <p className='font-medium'>
                          {formatTime(service.end_time)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-gray-500'>No service dates scheduled.</p>
              )}
            </div>
          </div>
          <div className='mt-6 flex gap-4 '>
      
            {(booking.status === "active" || booking.status == 'scheduled' || booking.status == 'upcoming') && (
              <>
                <button
                  onClick={() => setIsRenewModalOpen(true)}
                  className='flex-1 h-10 bg-green-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'>
                  Renew
                </button>
                <button
                  onClick={() => setIsRescheduleModalOpen(true)}
                  className='flex-1 h-10 bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'>
                  Reschedule
                </button>
              </>
            )}
            {/* {booking.status === "completed" && (
              <button className='flex-1 bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
                Create Invoice
              </button>
            )} */}
            {booking.status !== "cancelled" &&
              booking.status !== "completed" && (
                <button
                  onClick={() => setIsCancelModalOpen(true)}
                  className='flex-1 h-10 bg-red-50 py-2 px-4 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'>
                  Cancel
                </button>
              )}
          </div>
        </div>
      </div>
      <RenewModal
        isOpen={isRenewModalOpen}
        onClose={() => setIsRenewModalOpen(false)}
        bookingData={booking}
        onRenew={() => {
          window.location.reload();
        }}
      />
      {isRescheduleModalOpen && (
        <RescheduleModal
          pkg={booking}
          onClose={() => setIsRescheduleModalOpen(false)}
        />
      )}
      <CancelModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        booking={booking}
      />
    </>
  );
};

export default BookingDetail;
