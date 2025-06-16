import { apiRequest } from "../api";

export const getPricings = async () => {
  return apiRequest<any>("/pricing");
};
