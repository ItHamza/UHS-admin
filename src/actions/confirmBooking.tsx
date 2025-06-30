"use server";
import { confirmBooking } from "@/lib/service/confirm-booking";
import { revalidatePath } from "next/cache";

export default async function ConfirmBookingAction(data: {
  userPhone: string;
  userAvailableInApartment?: boolean;
  specialInstructions?: string;
  appartmentNumber?: string;
  bookingId: string;
}) {
  const bookings = await confirmBooking(data);
  return bookings.data;
}
