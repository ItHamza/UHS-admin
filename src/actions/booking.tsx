"use server";
import { getBookingById, getBookings } from "@/lib/service/booking";

export default async function BookingAction() {
  const bookings = await getBookings();
  return bookings.data;
}

export async function BookingByIdAction(id: string) {
  const bookings = await getBookingById(id);
  return bookings.data;
}