"use server";
import { createReschedule } from "@/lib/service/reschedule";

export default async function ReschedulesAction(
  teamAvailabilityId: string,
  newScheduleId: string,
  newStartTime: string,
  newEndTime: string,
  originalScheduleIds: string[]
) {
  const rescheduleCreateRes = await createReschedule({
    teamAvailabilityId, newScheduleId, newStartTime, newEndTime, originalScheduleIds
  });

  return rescheduleCreateRes.data;
}
