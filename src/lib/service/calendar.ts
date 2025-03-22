import { apiRequest } from "../api";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const getCalendar = async (data: {
  startDate: string;
  endDate: string;
}) => {
  return apiRequest<any>("/booking/schedules/calendar", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};
