"use server";
import { cancelBooking, cancelSingleBooking } from "@/lib/service/cancel";

export async function CancelBookingAction(bookingId: string) {
  const bookingsRes = await cancelBooking(bookingId);
  return bookingsRes.data;
}

export async function CancelSingleBookingAction(teamAvailabilityId: string) {
  const bookingsRes = await cancelSingleBooking(teamAvailabilityId);
  return bookingsRes.data;
}
