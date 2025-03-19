import { apiRequest } from "../api";

export const getBookings = async () => {
  return apiRequest<any>("/booking");
};

export const getBookingById = async (id: string) => {
  return apiRequest<any>(`/booking/${id}`);
};
