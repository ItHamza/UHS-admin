import { apiRequest } from "../api";

export const getCustomers = async () => {
  return apiRequest<any>("/customer");
};

export const getCustomerById = async (id: string) => {
  return apiRequest<any>(`/customer/${id}`);
};
