import React, { useEffect, useState } from "react";
import { Booking } from "@/types/booking"
import { Dialog } from "@headlessui/react"
import {
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  PhoneIcon,
  InformationCircleIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline"
import RescheduleModal from "./RescheduleDialog";
import RenewModal from "./RenewDialog";
import CancelModal from "./CancelModal";
import { Edit, Mail } from "lucide-react";
import PaymentModal from "./booking/PaymentModal";
import { BookingByIdAction } from "@/actions/booking";
interface BookingDetailProps {
  booking_id: string;
  onClose: () => void
  formatTime: (time: string) => string
  formatDate: (date: string) => string
  formatCurrency: (amount: number, currency?: string) => string
  getStatusColor: (status: string) => string
}

const DayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const BookingDetail: React.FC<BookingDetailProps> = ({
  booking_id,
  onClose,
  formatTime,
  formatDate,
  formatCurrency,
  getStatusColor,
}) => {
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const booking = await BookingByIdAction(booking_id);
        setBooking(booking);
      } catch (error) {
        console.error('Failed to fetch booking:', error);
      } finally {
        setLoading(false);
      }
    };

    if (booking_id) {
      fetchBooking();
    }
  }, [booking_id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-indigo-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-gray-600 text-sm">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <p className="text-gray-500">Booking not found or failed to load.</p>
      </div>
    );
  }

  const bookingDays = booking?.teamAvailabilities
  ? [...new Set(booking.teamAvailabilities?.map((s: any) => DayNames[new Date(s.date).getDay()]))]
  : [];

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <span className="text-xl font-bold text-white">{booking.customer.charAt(0).toUpperCase()}</span>
              </div>
            </div>
            <div className="ml-4">
              <Dialog.Title className="text-xl font-semibold text-white">{booking.customer}</Dialog.Title>
              <p className="text-indigo-100">Booking #{booking.booking_number}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border bg-white ${getStatusColor(
                booking.status,
              )}`}
            >
              {booking.status.charAt(0).toUpperCase() + booking.status.replaceAll("_", " ").slice(1)}
            </span>
            <button
              type="button"
              className="rounded-md bg-white bg-opacity-20 p-2 text-white hover:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-white"
              onClick={onClose}
            >
              <XMarkIcon className="h-6 w-6 text-black" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6 space-y-6">
          {/* Customer Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <UserGroupIcon className="h-5 w-5 mr-2 text-gray-500" />
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <PhoneIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Phone</p>
                  <p className="text-sm text-gray-600">{booking.user?.phone}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Email</p>
                  <p className="text-sm text-gray-600">{booking.user?.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPinIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Address</p>
                  <p className="text-sm text-gray-600">
                    Apt {booking.appartment_number}, {booking.residence_type?.type}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Property</p>
                  <p className="text-sm text-gray-600">{booking.property?.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPinIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Location</p>
                  <p className="text-sm text-gray-600">
                    {booking.district?.name}, {booking.area?.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Total Amount</p>
                  <p className="text-sm text-gray-600">{formatCurrency(booking.total_amount, booking.currency)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-blue-500" />
              Service Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-900">Service Type</p>
                <p className="text-sm text-gray-600 mt-1">{booking.service?.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Frequency</p>
                <p className="text-sm text-gray-600 mt-1">
                  {booking.frequency.charAt(0).toUpperCase() + booking.frequency.slice(1)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Duration</p>
                <p className="text-sm text-gray-600 mt-1">{booking.duration}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Period</p>
                <p className="text-sm text-gray-600 mt-1">
                  {formatDate(booking.date)} - {formatDate(booking.end_date)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Days</p>
                <p className="text-sm text-gray-600 mt-1">
                  {bookingDays.join(', ')}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Team Information */}
            {booking.team && (
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <UserGroupIcon className="h-5 w-5 mr-2 text-green-500" />
                  Team Information
                </h3>
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-900">{booking.team.name}</p>
                  <p className="text-sm text-gray-600">Team ID: {booking.team.team_number}</p>
                </div>
                {booking.team?.Users && booking.team?.Users?.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-900">Team Members</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {booking.team.Users.map((member: any, index: number) => (
                        <div key={index} className="flex items-center space-x-3 bg-white rounded-lg p-3">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-green-800">
                                {member.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                            {member.phone && (
                              <div className="flex items-center mt-1">
                                <PhoneIcon className="h-3 w-3 text-gray-400 mr-1" />
                                <p className="text-xs text-gray-600">{member.phone}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Payment Information */}
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <BanknotesIcon className="h-5 w-5 mr-2 text-green-500" />
                Payment Information
                <Edit className="h-4 w-4 ml-auto cursor-pointer" onClick={() => setIsPaymentModalOpen(true)} />
              </h3>
              <div className="mb-4">
                {/* <p className="text-sm font-medium text-gray-900">{booking.payment_status}</p> */}
                <p className="text-sm text-gray-600">Status: {booking.paymentStatus}</p>
                <p className="text-sm text-gray-600">Payment ID: {booking.payment?.id}</p>
              </div>
            </div>

          </div>

          {/* Service Schedule */}
          <div className="bg-purple-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <ClockIcon className="h-5 w-5 mr-2 text-purple-500" />
              Service Schedule
            </h3>
            {Array.isArray(booking?.teamAvailabilities) && booking?.teamAvailabilities?.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  {booking?.teamAvailabilities.length} service{booking?.teamAvailabilities.length > 1 ? "s" : ""} scheduled
                </p>
                <div className="grid grid-cols-1 gap-4">
                  {booking?.teamAvailabilities.map((service: any, index: number) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg border border-purple-200 p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-purple-800">{index + 1}</span>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">
                              {service.status && (
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}
                                >
                                  {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                                </span>
                              )}
                            </p>
                          </div>
                          {/* <div className=" h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-purple-800">{service.team.name}</span>
                          </div> */}
                          <div>
                            <p className="text-xs text-gray-500">
                              {service.status && (
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border-blue-200`}
                                >
                                  TEAM: {service.team.name}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date</p>
                          <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(service.date)}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Day</p>
                          <p className="text-sm font-medium text-gray-900 mt-1">{DayNames[new Date(service.date).getDay()]}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Start Time</p>
                          <p className="text-sm font-medium text-gray-900 mt-1">{formatTime(service.start_time)}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">End Time</p>
                          <p className="text-sm font-medium text-gray-900 mt-1">{formatTime(service.end_time)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-500">No service dates scheduled yet.</p>
              </div>
            )}
          </div>


          {/* Special Instructions */}
          {booking.instructions && (
            <div className="bg-amber-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <InformationCircleIcon className="h-5 w-5 mr-2 text-amber-500" />
                Special Instructions
              </h3>
              <div className="bg-white rounded-lg border border-amber-200 p-4">
                <p className="text-sm text-gray-700">{booking.instructions}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              {(booking.status === "active" || booking.status === "scheduled" || booking.status === "upcoming") && (
                <>
                  {booking.is_renewed ? (
                    <button
                      disabled
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-green-100 cursor-not-allowed"
                    >
                      Already Renewed
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsRenewModalOpen(true)}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors">
                      Renew Booking
                    </button>
                  )}
                  <button
                    onClick={() => setIsRescheduleModalOpen(true)}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                    Reschedule
                  </button>
                </>
              )}
              {booking.status !== "cancelled" && booking.status !== "completed" && (
                <button
                  onClick={() => setIsCancelModalOpen(true)}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors">
                  Cancel Booking
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {isRenewModalOpen && (
        <RenewModal
          isOpen={isRenewModalOpen}
          onClose={() => setIsRenewModalOpen(false)}
          bookingData={booking}
          onRenew={() => {
            window.location.reload();
          }}
        />
      )}
      
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
      {isPaymentModalOpen && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          booking={booking}
          />
      )}
    </>
  );
};

export default BookingDetail;
