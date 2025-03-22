/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiRequest } from "../api";

export const getProperties = async (districtId: string | null) => {
  return districtId
    ? apiRequest<any>(`/property?districtId=${districtId}`)
    : apiRequest<any>(`/property`);
};

export const getPropertyById = async (id: string) => {
  return apiRequest<any>(`/property/${id}`);
};
