"use server";
import { deepBooking, getBookingById, getBookings, renewBooking, specialiseBooking, updatePaymentStatus } from "@/lib/service/booking";

export default async function BookingAction(page: number, limit: number, service_id: string[], search: string) {
  const bookings = await getBookings(page, limit, service_id, search);
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

export async function updatePaymentStatusAction(id: string, data: any) {
  const renewResponse = await updatePaymentStatus(id, data);
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