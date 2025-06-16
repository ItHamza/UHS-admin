/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiRequest } from "../api";

export const getResidences = async () => {
  return apiRequest<any>("/residence");
};

// export const getAreaById = async (id: string) => {
//   return apiRequest<any>(`/area/${id}`);
// };


export async function createResidence(data: any) {
  return apiRequest<any>("/residence", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function updateResidence(data: any) {
  const { id, ...rest } = data;
  return apiRequest<any>(`/residence/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(rest),
  });
}


export async function deleteResidence(id: string) {
  return apiRequest<any>(`/residence/${id}`, {
    method: "DELETE",
  });
}

