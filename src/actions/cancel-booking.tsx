"use server";
import { cancelBooking } from "@/lib/service/cancel";

export default async function CancelBookingAction(bookingId: string) {
  const bookingsRes = await cancelBooking(bookingId);
  return bookingsRes.data;
}
