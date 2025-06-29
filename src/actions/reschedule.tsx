"use server";
import { createReschedule } from "@/lib/service/reschedule";

export default async function ReschedulesAction(
  teamAvailabilityId: string,
  scheduleId: string,
  startTime: string,
  endTime: string,
  date?: string | null,
  originalScheduleIds?: string[] | null
) {
  const rescheduleCreateRes = await createReschedule({
    teamAvailabilityId,
    scheduleId,
    startTime,
    endTime,
    date,
    originalScheduleIds,
  });

  return rescheduleCreateRes.data;
}
