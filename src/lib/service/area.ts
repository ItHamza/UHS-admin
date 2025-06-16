/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiRequest } from "../api";

export const getAreas = async () => {
  return apiRequest<any>("/area");
};

export const getAreaById = async (id: string) => {
  return apiRequest<any>(`/area/${id}`);
};

export async function createArea(data: any) {
  return apiRequest<any>("/area", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function updateArea(data: any) {
  const { id, ...rest } = data;
  return apiRequest<any>(`/area/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(rest),
  });
}


export async function deleteArea(id: string) {
  return apiRequest<any>(`/area/${id}`, {
    method: "DELETE",
  });
}

