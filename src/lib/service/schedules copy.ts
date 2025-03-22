/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiRequest } from "../api";

export const getSchedules = async () => {
  return apiRequest<any>("/schedule");
};

export const getScheduleById = async (id: string) => {
  return apiRequest<any>(`/schedule/${id}`);
};
