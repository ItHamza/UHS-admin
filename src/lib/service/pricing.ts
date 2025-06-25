import { apiRequest } from "../api";

export const getPricings = async () => {
  return apiRequest<any>("/pricing");
};

export async function createPricing(data: any) {
  return apiRequest<any>("/pricing", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function updatePricing(data: any) {
  const { id, ...rest } = data;
  return apiRequest<any>(`/pricing/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(rest),
  });
}


export async function deletePricing(id: string) {
  return apiRequest<any>(`/pricing/${id}`, {
    method: "DELETE",
  });
}

export async function fetchSpecialServicePricing() {
  return apiRequest<any>("/services/categories");
}

export async function createSpecialPricing(data: any) {
  return apiRequest<any>("/services/categories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function updateSpecialPricing(data: any) {
  const { id, ...rest } = data;
  return apiRequest<any>(`/services/categories/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(rest),
  });
}


export async function deleteSpecialPricing(id: string) {
  return apiRequest<any>(`/services/categories/${id}`, {
    method: "DELETE",
  });
}