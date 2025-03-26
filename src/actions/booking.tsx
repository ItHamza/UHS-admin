"use server";
import { getBookings } from "@/lib/service/booking";

export default async function BookingAction() {
  const bookings = await getBookings();
  return bookings.data;
}
