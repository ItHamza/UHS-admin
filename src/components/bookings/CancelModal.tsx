import { Booking } from "@/types/booking";
import { XIcon } from "lucide-react";
import { useState } from "react";

const CancelModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
}> = ({ isOpen, onClose, booking }) => {
  const [cancellationReason, setCancellationReason] = useState<string>("");

  const cancellationReasons = [
    "No longer needed",
    "Found alternative service",
    "Schedule conflict",
    "Other",
  ];

  const handleCancel = () => {
    // Implement cancellation logic
    console.log("Cancelling booking with reason:", cancellationReason);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='bg-white rounded-lg shadow-xl w-96 p-6'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-semibold'>Cancel Booking</h2>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700'>
            <XIcon className='h-6 w-6' />
          </button>
        </div>
        <div className='space-y-4'>
          <p className='text-gray-600'>Why are you cancelling this booking?</p>
          <div className='space-y-2'>
            {cancellationReasons.map((reason) => (
              <label key={reason} className='flex items-center space-x-2'>
                <input
                  type='radio'
                  name='cancelReason'
                  value={reason}
                  checked={cancellationReason === reason}
                  onChange={() => setCancellationReason(reason)}
                  className='form-radio'
                />
                <span>{reason}</span>
              </label>
            ))}
            {cancellationReason === "Other" && (
              <textarea
                placeholder='Please specify your reason'
                className='mt-2 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3'
                rows={3}
              />
            )}
          </div>
          <button
            onClick={handleCancel}
            disabled={!cancellationReason}
            className='w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 disabled:opacity-50'>
            Confirm Cancellation
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelModal;
