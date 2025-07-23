import {
  CancelBookingAction,
  CancelSingleBookingAction,
} from "@/actions/cancel-booking";
import { Booking } from "@/types/booking";
import { XIcon } from "lucide-react";
import { useState } from "react";
import Loader from "../ui/loader";
import toast from "react-hot-toast";

type CancellationStep =
  | "initial"
  | "date-selection"
  | "reason-selection"
  | "confirmation";

const CancelModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
}> = ({ isOpen, onClose, booking }) => {
  const [step, setStep] = useState<CancellationStep>("initial");
  const [selectedDate, setSelectedDate] = useState<any | null>(null);
  const [cancellationMode, setCancellationMode] = useState<"partial" | "full">(
    "full"
  );
  const [loading, setLoading] = useState(false);
  const [cancellationReason, setCancellationReason] = useState<string>("");

  // Assuming booking has a dates array with ISO date strings
  const bookingDates = booking.teamAvailabilities || [];

  const handleInitialSelection = (mode: "partial" | "full") => {
    setCancellationMode(mode);
    if (mode === "partial") {
      setStep("date-selection");
    } else {
      setStep("reason-selection");
    }
  };

  const handleDateSelection = (date: string) => {
    setSelectedDate(date);
  };
  const handleCancel = async () => {
    try {
      setLoading(true);
      if (selectedDate) {
        await CancelSingleBookingAction(selectedDate);
      } else {
        await CancelBookingAction(booking.id);
      }

      onClose();
      setTimeout(() => window.location.reload(), 100); // Optional delay
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep("initial");
    setSelectedDate(null);
    setCancellationReason("");
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='bg-white rounded-lg shadow-xl w-96 p-6'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-semibold'>Cancel Booking</h2>
          <button
            onClick={() => {
              resetModal();
              onClose();
            }}
            className='text-gray-500 hover:text-gray-700'>
            <XIcon className='h-6 w-6' />
          </button>
        </div>

        {/* Initial Selection Step */}
        {step === "initial" && (
          <div className='space-y-4'>
            <p className='text-gray-600 text-center'>
              How would you like to cancel your booking?
            </p>
            <div className='space-y-3'>
              <button
                onClick={() => handleInitialSelection("partial")}
                className='w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600'>
                Cancel Specific Dates
              </button>
              <button
                onClick={() => handleInitialSelection("full")}
                className='w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700'>
                Cancel Entire Booking
              </button>
            </div>
          </div>
        )}

        {/* Date Selection Step */}
        {step === "date-selection" && (
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Select Dates to Cancel</h3>
            <div className='space-y-2 max-h-48 overflow-y-auto'>
              {bookingDates?.map((service: any) => (
                <label
                  key={service.id}
                  className={`flex items-center space-x-2 p-2 border rounded-md ${
                    service.is_cancelled && "border-red-200 "
                  }`}>
                  {!service.is_cancelled && (
                    <input
                      type='checkbox'
                      checked={selectedDate === service.id}
                      disabled={service.is_cancelled}
                      onChange={() => handleDateSelection(service.id)}
                      className={`form-checkbox`}
                    />
                  )}
                  <span className={`${service.is_cancelled && "line-through"}`}>
                    {new Date(service.date).toLocaleDateString()}
                  </span>
                </label>
              ))}
            </div>
            <div className='flex space-x-2'>
              <button
                onClick={() => setStep("initial")}
                className='w-full bg-gray-200 text-gray-800 py-2 rounded-md'>
                Back
              </button>
              <button
                disabled={cancellationMode === "partial" && !selectedDate}
                onClick={() => setStep("reason-selection")}
                className='w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 disabled:opacity-50'>
                Next
              </button>
            </div>
          </div>
        )}

        {/* Reason Selection Step */}
        {step === "reason-selection" && (
          <div className='space-y-4'>
            <p className='text-gray-600'>Are you sure?</p>
            <div className='space-y-2'>
              Please confirm to proceed cancellation
            </div>
            <div className='flex space-x-2'>
              <button
                onClick={() =>
                  setStep(
                    cancellationMode === "full" ? "initial" : "date-selection"
                  )
                }
                className='w-full bg-gray-200 text-gray-800 py-2 rounded-md'>
                Back
              </button>
              {!loading ? (
                <button
                  onClick={handleCancel}
                  className='w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 disabled:opacity-50'>
                  Confirm Cancellation
                </button>
              ) : (
                <Loader />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CancelModal;
