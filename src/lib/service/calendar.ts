import { apiRequest } from "../api";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const getCalendar = async (data: {
  startDate: string;
  endDate: string;
  booking_id: string; 
  team_id: string,
  user_id: string
}) => {
  return apiRequest<any>("/booking/schedules/calendar", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};
