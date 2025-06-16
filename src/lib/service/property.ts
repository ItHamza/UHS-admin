/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiRequest } from "../api";

export const getProperties = async (districtId?: string | null) => {
  return districtId
    ? apiRequest<any>(`/property?districtId=${districtId}`)
    : apiRequest<any>(`/property`);
};

export const getPropertyById = async (id: string) => {
  return apiRequest<any>(`/property/${id}`);
};

export async function createProperty(data: any) {
  return apiRequest<any>("/property", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function updateProperty(data: any) {
  const { id, ...rest } = data;
  return apiRequest<any>(`/property/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(rest),
  });
}


export async function deleteProperty(id: string) {
  return apiRequest<any>(`/property/${id}`, {
    method: "DELETE",
  });
}
