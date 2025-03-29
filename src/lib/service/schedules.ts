import { apiRequest } from "../api";

export const getSchedules = async () => {
  return apiRequest<any>("/schedule");
};

export const getScheduleById = async (id: string) => {
  return apiRequest<any>(`/schedule/${id}`);
};

export const generateSchedule = async (data: any) => {
  return apiRequest<any>("/schedule", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};
