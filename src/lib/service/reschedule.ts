import { apiRequest } from "../api";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const createReschedule = async (data: {
  teamAvailabilityId: string;
  scheduleId: string;
  startTime: string;
  endTime: string;
  date?: string | null;
  originalScheduleIds?: string[] | null;
}) => {
  return apiRequest<any>("/reschedule", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};
