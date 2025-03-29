/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiRequest } from "../api";

export const cancelBooking = async (bookingId: string) => {
  return apiRequest<any>("/cancel-booking", {
    method: "POST",
    body: JSON.stringify({ bookingId }),
  });
};

export const cancelSingleBooking = async (teamAvailabilityId: string) => {
  return apiRequest<any>("/cancel-booking/single", {
    method: "POST",
    body: JSON.stringify({ teamAvailabilityId }),
  });
};
