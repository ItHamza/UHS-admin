import { apiRequest } from "../api";

export const getBookings = async () => {
  return apiRequest<any>("/booking");
};

export const getBookingById = async (id: string) => {
  return apiRequest<any>(`/booking/${id}`);
};


export async function renewBooking(id: string, data: any) {
  return apiRequest<any>(`/booking/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}