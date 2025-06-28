"use server";
import { getCalendar } from "@/lib/service/calendar";

export default async function CalendarAction(
  startDate: string,
  endDate: string,
  booking_id: string,
  team_id: string,
  user_id: string
) {
  const timeslots = await getCalendar({ startDate, endDate, booking_id, team_id, user_id });

  return timeslots.data;
}
