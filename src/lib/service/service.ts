import { apiRequest } from "../api";

export async function fetchServices() {
  return apiRequest<any>("/services");
}

export async function fetchChildServices(parentId: string) {
  return apiRequest<any>(`/services/parent/${parentId}`);
}
