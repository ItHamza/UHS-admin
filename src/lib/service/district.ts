/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiRequest } from "../api";

export const getDistricts = async (areaId?: string | null) => {
  return areaId
    ? apiRequest<any>(`/district?areaId=${areaId}`)
    : apiRequest<any>(`/district`);
};

export const getDistrictById = async (id: string) => {
  return apiRequest<any>(`/area/${id}`);
};

export async function createDistrict(data: any) {
  return apiRequest<any>("/district", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function updateDistrict(data: any) {
  const { id, ...rest } = data;
  return apiRequest<any>(`/district/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(rest),
  });
}


export async function deleteDistrict(id: string) {
  return apiRequest<any>(`/district/${id}`, {
    method: "DELETE",
  });
}
