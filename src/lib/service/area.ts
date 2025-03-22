/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiRequest } from "../api";

export const getAreas = async () => {
  return apiRequest<any>("/area");
};

export const getAreaById = async (id: string) => {
  return apiRequest<any>(`/area/${id}`);
};
