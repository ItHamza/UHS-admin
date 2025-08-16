import Loader from "@/components/ui/loader";
import { Booking, PropBooking } from "@/types/booking";
import { XIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { updatePaymentStatusAction } from "@/actions/booking";

const PaymentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | PropBooking;
  onStatusChange: (status: string) => void;
}> = ({ isOpen, onClose, booking, onStatusChange }) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handlePayment = (status: string) => async () => {
    try {
      setLoading(true);
      const data = { payment_status: status, status: 'scheduled' } 
      await updatePaymentStatusAction(booking.id, data);

      toast.success(`Payment status updated to "${status}"`);
      onStatusChange(status);
      onClose();
    } catch (error: any) {
      console.error("Payment update failed:", error);
      toast.error("Failed to update payment status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='bg-white rounded-lg shadow-xl w-96 p-6 relative'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-semibold'>Update Payment</h2>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700'
            disabled={loading}>
            <XIcon className='h-6 w-6' />
          </button>
        </div>

        {loading ? (
          <div className="py-10">
            <Loader />
            <p className="text-center text-sm text-gray-500 mt-3">Updating payment status...</p>
          </div>
        ) : (booking.paymentStatus === "paid" || booking.payment_status === "paid") ? (
          <div className='space-y-4'>
            <p className='text-gray-600 text-center'>
              This booking is marked as <strong>Paid</strong>.<br />
              Would you like to mark it as <strong>Pending</strong>?
            </p>
            <button
              onClick={handlePayment("pending")}
              className='w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600'>
              Mark as Pending
            </button>
          </div>
        ) : (
          <div className='space-y-4'>
            <p className='text-gray-600 text-center'>
              This booking is marked as <strong>Pending</strong>.<br />
              Would you like to mark it as <strong>Paid</strong>?
            </p>
            <button
              onClick={handlePayment("paid")}
              className='w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600'>
              Mark as Paid
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
