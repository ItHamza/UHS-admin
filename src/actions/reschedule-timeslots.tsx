"use server";
import { getRescheduleTimeslots } from "@/lib/service/reschedule-timeslots";

export default async function RescheduleTimeslotsAction(
  teamId: string,
  date: string,
  minutes: number
) {
  const timeslots = await getRescheduleTimeslots({ teamId, date, minutes });

  return timeslots.data;
}
