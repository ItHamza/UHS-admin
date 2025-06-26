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

export const getBookingServices = async () => {
  return apiRequest<any>("/booking/schedules");
};

export const OneTimeServiceTeamAvailabilities = async (data: any) => {
  return apiRequest<any>("/team-assigning", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

export async function assignTeamSlot(data: any) {
  const { id, ...rest } = data;
  return apiRequest<any>(`/team-assigning/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(rest),
  });
}
