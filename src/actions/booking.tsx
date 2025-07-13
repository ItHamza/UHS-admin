"use server";
import { deepBooking, getBookingById, getBookings, renewBooking, specialiseBooking } from "@/lib/service/booking";

export default async function BookingAction(page: number, limit: number) {
  const bookings = await getBookings(page, limit);
  return bookings;
}

export async function BookingByIdAction(id: string) {
  const bookings = await getBookingById(id);
  return bookings.data;
}

export async function ConfirmRenewAction(id: string, data: any) {
  const renewResponse = await renewBooking(id, data);
  return renewResponse.data;
}

export async function SpecialisedBookingAction(data: any) {
  const booking = await specialiseBooking(data);
  return booking.data;
}

export async function DeepBookingAction(data: any) {
  const booking = await deepBooking(data);
  return booking.data;
}