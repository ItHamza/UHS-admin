import { confirmBooking } from "@/lib/service/confirm-booking";

export default async function ConfirmBookingAction(data: {
  userPhone: string;
  userAvailableInApartment?: boolean;
  specialInstructions?: string;
  appartmentNumber?: string;
}) {
  const bookings = await confirmBooking(data);
  return bookings.data;
}
