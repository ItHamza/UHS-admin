import React, { useEffect, useState } from "react";
import { Booking } from "@/types/booking";
import { Clock, X, CreditCard, Calendar, MapPin, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { BookingByIdAction, ConfirmRenewAction, updatePaymentStatusAction } from "@/actions/booking";
import { Button } from "@headlessui/react";
import ConfirmBookingAction from "@/actions/confirmBooking";

interface Bundle {
  id: string;
  name: string;
  description: string;
  price: number;
}

interface RenewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: Booking;
  onRenew: () => void
}

interface ServiceDetail {
  id: string;
  name: string;
  description?: string;
  price?: number;
}

interface BookingService {
  service: ServiceDetail;
  teamAvailabilities: Array<{
    id: string;
    date: string;
    start_time: string;
    end_time: string;
  }>;
  total_amount?: number;
  recurrence_plan?: string;
  start_date?: string;
  end_date?: string;
}


const RenewModal: React.FC<RenewModalProps> = ({
  isOpen,
  onClose,
  bookingData,
  onRenew,
}) => {
  
  const [loading, setLoading] = useState(false)

  const [blockingTimer, setBlockingTimer] = useState<number | null>(null);
  const [isBlockingTimerActive, setIsBlockingTimerActive] = useState(false);

  const [services, setServices] = useState<BookingService[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  
  const [isConfirmRenew, setIsConfirmRenew] = useState(false);


  const formatDate = (dateString: string): string => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "PPP");
    } catch {
      return "Invalid Date";
    }
  };

    // Format time function
  const formatTime = (timeString: string): string => {
    if (!timeString) return "N/A";
    try {
      return format(new Date(`2000-01-01T${timeString}`), "h:mm a");
    } catch {
      return "Invalid Time";
    }
  };


  const fetchBookingServices = async (bookingId: string) => {
    try {
      setLoading(true);

      // If we already have renewBookingData with a renew_booking_id, use that
      const targetBookingId = bookingData?.renew_booking_id || bookingId;

      const response = await BookingByIdAction(targetBookingId);
      if (response) {
        // Transform the response into our expected format
        const serviceData: BookingService = {
          service: {
            id: response.service?.id || "",
            name: response.service?.name || "Unknown Service",
            description: response.service?.description,
            price: response.service?.price,
          },
          teamAvailabilities: response.teamAvailabilities || [],
          total_amount: response.total_amount,
          recurrence_plan: response.recurrence_plan,
          start_date: response.date,
          end_date: response.end_date,
        };

        setServices([serviceData]);
        debugger;
        setTotalAmount(parseFloat(response.total_amount) || 0);
      } else {
        toast.error("Failed to load booking details");
      }
    } catch (error) {
      console.error("Error fetching booking services:", error);
      toast.error("Error loading booking information");
    } finally {
      setLoading(false);
    }
  };

  const onConfirmRenew = async (): Promise<void> => {
    try {
      setIsConfirmRenew(true);
      // Use the renewal booking ID or the main booking ID
      const renew_booking_id = bookingData?.renew_booking_id;

      // const newData = { status: "pending", payment_status: 'pending', prev_booking_id: bookingData.id}
      if (!renew_booking_id) {
        toast.error("Booking ID not found for renewal");
        return;
      }
      // const response = await ConfirmRenewAction(bookingId, newData);
      await ConfirmBookingAction({
        userPhone: bookingData.user?.phone,
        specialInstructions: bookingData.special_instructions,
        appartmentNumber: bookingData.appartment_number,
        userAvailableInApartment: bookingData.user_available_in_apartment,
        is_renewed: bookingData ? true : false,
        prev_booking_id: bookingData.id,
        bookingId: renew_booking_id,
      });

      await updatePaymentStatusAction(renew_booking_id, { has_renewed: false });
      setIsConfirmRenew(false);
      onRenew()
    } catch (error: any) {
      console.error("Error renewal booking:", error);
      toast.error(error.message || "Failed to initiate renew booking");
      setIsConfirmRenew(false);
    }
  };

  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (isBlockingTimerActive && blockingTimer !== null && blockingTimer > 0) {
      timerId = setInterval(() => {
        setBlockingTimer((prev) => {
          if (prev !== null && prev <= 1) {
            clearInterval(timerId);
            setIsBlockingTimerActive(false);
            return 0;
          }
          return (prev as number) - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isBlockingTimerActive, blockingTimer]);

  useEffect(() => {
    fetchBookingServices(bookingData.id)
  }, []);


  if (!isOpen) return null;


  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-auto p-4'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6'>
        <div className='flex justify-between items-center'>
          <h2 className='text-2xl font-bold'>Renew Service</h2>
          <button onClick={onClose} className='text-gray-400 hover:text-gray-600 transition'>
            <X className='h-6 w-6' />
          </button>
        </div>

        <div className='space-y-6'>
          {/* Header */}
          <div className='bg-green-50 p-4 rounded-lg border border-green-200'>
            <h3 className='font-semibold text-green-800 mb-2 flex items-center'>
              <CreditCard className='h-5 w-5 mr-2' />
              Service Renewal
            </h3>
            <p className='text-sm text-green-700'>
              Review your service details below and proceed with renewal payment.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-full py-20">
              <div className="text-center">
                <svg className="animate-spin h-8 w-8 text-indigo-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-gray-600 text-sm">Loading renew details...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Services List */}
              <div className='space-y-4'>
                {services.map((serviceItem, index) => (
                  <div key={index} className='border rounded-lg p-4 bg-white shadow-sm'>
                    {/* Service Header */}
                    <div className='flex justify-between items-start mb-4'>
                      <div>
                        <h4 className='text-lg font-semibold text-gray-900'>
                          {serviceItem.service.name}
                        </h4>
                        {serviceItem.service.description && (
                          <p className='text-sm text-gray-600 mt-1'>
                            {serviceItem.service.description}
                          </p>
                        )}
                      </div>
                      {serviceItem.service.price && (
                        <div className='text-right'>
                          <p className='text-lg font-bold text-primary'>
                            QAR {serviceItem.service.price}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Service Details Grid */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                      <div className='flex items-center text-sm'>
                        <Calendar className='h-4 w-4 mr-2 text-gray-500' />
                        <div>
                          <span className='font-medium'>Frequency: </span>
                          <span className='capitalize'>
                            {serviceItem.recurrence_plan?.replace("_", " ") || "N/A"}
                          </span>
                        </div>
                      </div>

                      <div className='flex items-center text-sm'>
                        <MapPin className='h-4 w-4 mr-2 text-gray-500' />
                        <div>
                          <span className='font-medium'>Service Period: </span>
                          <span>
                            {formatDate(serviceItem.start_date as string)} -{" "}
                            {formatDate(serviceItem.end_date as string)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Team Availabilities */}
                    {serviceItem.teamAvailabilities &&
                      serviceItem.teamAvailabilities.length > 0 && (
                        <div>
                          <h5 className='font-medium text-gray-700 mb-3 flex items-center'>
                            <Clock className='h-4 w-4 mr-2' />
                            Scheduled Sessions
                          </h5>
                          <div className='space-y-3'>
                            {serviceItem.teamAvailabilities.map((availability) => (
                              <div
                                key={availability.id}
                                className='flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-md'>
                                <div className='flex items-center'>
                                  <Calendar className='h-4 w-4 mr-2 text-gray-500' />
                                  <span className='font-medium'>
                                    {formatDate(availability.date)}
                                  </span>
                                </div>
                                <div className='flex items-center mt-2 sm:mt-0'>
                                  <Clock className='h-4 w-4 mr-2 text-gray-500' />
                                  <span>
                                    {formatTime(availability.start_time)} -{" "}
                                    {formatTime(availability.end_time)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                ))}
              </div>

              {/* Total Amount */}
              <div className='bg-gray-100 p-4 rounded-lg border'>
                <div className='flex justify-between items-center'>
                  <h4 className='text-lg font-medium'>Total Renewal Amount</h4>
                  <p className='text-xl font-bold text-green-700'>QAR {totalAmount.toFixed(2)}</p>
                </div>
              </div>

              {/* Confirm Button */}
              <div className='sticky bottom-0 bg-white pt-4 border-t mt-6'>
                <Button
                  onClick={onConfirmRenew}
                  disabled={isConfirmRenew}
                  className='w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base flex justify-center items-center'>
                  {isConfirmRenew ? (
                    <>
                      <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                      Confirming renew booking...
                    </>
                  ) : (
                    <>
                      <CreditCard className='mr-2 h-5 w-5 -mt-0.5' />
                      Confirm Renew Booking (QAR {totalAmount.toFixed(2)})
                    </>
                  )}
                </Button>
              </div>
            </>
            )}
        </div>
      </div>
    </div>
  );
};

export default RenewModal;
