import { getCalendar } from "@/lib/service/calendar";

export default async function CalendarAction(
  startDate: string,
  endDate: string
) {
  const timeslots = await getCalendar({ startDate, endDate });

  return timeslots.data;
}
