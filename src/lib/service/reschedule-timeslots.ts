import { apiRequest } from "../api";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const getRescheduleTimeslots = async (data: {
  teamId: string;
  date: string;
  minutes: number;
  propertyId: string;
  residenceTypeId: string;
  apartmentNumber: string;
  usePropertyLogic: boolean;
}) => {
  return apiRequest<any>("/reschedule/timeslots", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};
