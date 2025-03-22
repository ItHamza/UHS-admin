/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiRequest } from "../api";

export const getDistricts = async (areaId: string | null) => {
  return areaId
    ? apiRequest<any>(`/district?areaId=${areaId}`)
    : apiRequest<any>(`/district`);
};

export const getDistrictById = async (id: string) => {
  return apiRequest<any>(`/area/${id}`);
};
