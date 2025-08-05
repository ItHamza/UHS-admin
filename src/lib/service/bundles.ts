/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiRequest } from "../api";

export const getBundles = async (body: {
  startDate: string;
  location: { lat: number; lng: number; district_id: string };
  frequency: string;
  servicePeriod: number;
  serviceType: string;
  duration: number;
  serviceId: string;
  propertyId?: string;
  teamId?: string
}) => {
  return apiRequest<any>("/bundles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
};
