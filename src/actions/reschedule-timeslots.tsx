"use server";
import { getRescheduleTimeslots } from "@/lib/service/reschedule-timeslots";

export default async function RescheduleTimeslotsAction(
  teamId: string,
  date: string,
  minutes: number,
  propertyId: string,
  residenceTypeId: string,
  apartmentNumber: string,
  usePropertyLogic: boolean
) {
  const timeslots = await getRescheduleTimeslots({ teamId, date, minutes, propertyId, residenceTypeId, apartmentNumber, usePropertyLogic });

  return timeslots;
}
