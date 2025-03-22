import { apiRequest } from "../api";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const blockBooking = async (data: {
  userPhone: string;
  no_of_cleaners: number;
  userId: string;
  timeslots: Array<{
    schedule_id: string;
    start_time: string;
    end_time: string;
  }>;
  teamId: string;
  areaId: string;
  districtId: string;
  propertyId: string;
  residenceTypeId: string;
  startDate: string;
  endDate: string;
  frequency: string;
  userAvailableInApartment?: boolean;
  specialInstructions?: string;
  appartmentNumber?: string;
  serviceId?: string;
}) => {
  return apiRequest<any>("/booking/block", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};
