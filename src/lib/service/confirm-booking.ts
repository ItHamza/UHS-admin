import { apiRequest } from "../api";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const confirmBooking = async (data: {
  userPhone: string;
  userAvailableInApartment?: boolean;
  specialInstructions?: string;
  appartmentNumber?: string;
  bookingId?: string;
}) => {
  return apiRequest<any>("/booking/confirm", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};
