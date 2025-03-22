/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiRequest } from "../api";

export const getResidences = async () => {
  return apiRequest<any>("/residence");
};

// export const getAreaById = async (id: string) => {
//   return apiRequest<any>(`/area/${id}`);
// };
