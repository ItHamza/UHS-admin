import { Booking } from "@/types/booking";
import { XIcon } from "lucide-react";
import { useState } from "react";

const RescheduleModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
}> = ({ isOpen, onClose, booking }) => {
  const [newStartDate, setNewStartDate] = useState<string>("");
  const [newEndDate, setNewEndDate] = useState<string>("");

  const handleReschedule = () => {
    // Implement rescheduling logic
    console.log("Rescheduling to", newStartDate, newEndDate);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='bg-white rounded-lg shadow-xl w-96 p-6'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-semibold'>Reschedule Booking</h2>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700'>
            <XIcon className='h-6 w-6' />
          </button>
        </div>
        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              New Start Date
            </label>
            <input
              type='date'
              value={newStartDate}
              onChange={(e) => setNewStartDate(e.target.value)}
              className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700'>
              New End Date
            </label>
            <input
              type='date'
              value={newEndDate}
              onChange={(e) => setNewEndDate(e.target.value)}
              className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3'
            />
          </div>
          <button
            onClick={handleReschedule}
            disabled={!newStartDate || !newEndDate}
            className='w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50'>
            Confirm Reschedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default RescheduleModal;
