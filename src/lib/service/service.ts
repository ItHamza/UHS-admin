import { apiRequest } from "../api";

export async function fetchServices() {
  return apiRequest<any>("/services");
}

export async function fetchChildServices(parentId: string) {
  return apiRequest<any>(`/services/parent/${parentId}`);
}

export async function createService(data: any) {
  return apiRequest<any>("/services", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function updateService(data: any) {
  const { id, ...rest } = data;
  return apiRequest<any>(`/services/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(rest),
  });
}


export async function deleteService(id: string) {
  return apiRequest<any>(`/services/${id}`, {
    method: "DELETE",
  });
}
