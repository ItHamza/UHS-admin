/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiRequest } from "../api";

export const getBundles = async (body: {
  startDate: string;
  location: { lat: number; lng: number };
  frequency: string;
  servicePeriod: number;
  serviceType: string;
  duration: number;
}) => {
  return apiRequest<any>("/bundles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
};
