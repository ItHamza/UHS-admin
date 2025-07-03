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
  total_amount: number;
  userAvailableInApartment?: boolean;
  specialInstructions?: string;
  appartmentNumber?: string;
  serviceId?: string;
  renewal_slots: any[];
  status: string;
  payment_status: string
}) => {
  return apiRequest<any>("/booking/block", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};
