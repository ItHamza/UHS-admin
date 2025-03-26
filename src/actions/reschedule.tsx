"use server";
import { createReschedule } from "@/lib/service/reschedule";

export default async function ReschedulesAction(
  teamAvailabilityId: string,
  scheduleId: string,
  startTime: string,
  endTime: string
) {
  const rescheduleCreateRes = await createReschedule({
    teamAvailabilityId,
    scheduleId,
    startTime,
    endTime,
  });

  return rescheduleCreateRes.data;
}
