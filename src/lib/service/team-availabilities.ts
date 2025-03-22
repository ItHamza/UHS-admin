import { apiRequest } from "../api";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const teamAvailabilities = async (data: { ids: string[] }) => {
  return apiRequest<any>("/bookings/schedules", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};
