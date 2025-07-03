"use server";
import { blockBooking } from "@/lib/service/block";

export default async function BlockBookingAction(data: {
  userPhone: string;
  no_of_cleaners: number;
  userId: string;
  timeslots: Array<{
    schedule_id: string;
    start_time: string;
    end_time: string;
  }>;
  teamId: string;
  areaId: string;
  districtId: string;
  propertyId: string;
  residenceTypeId: string;
  startDate: string;
  endDate: string;
  total_amount: number;
  frequency: string;
  userAvailableInApartment?: boolean;
  specialInstructions?: string;
  appartmentNumber?: string;
  serviceId?: string;
  renewal_slots: any[];
  status: string;
  payment_status: string;
}) {
  const bookings = await blockBooking(data);
  return bookings.data;
}
