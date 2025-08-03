"use server";
// actions/BundlesAction.ts
import { getBundles } from "@/lib/service/bundles"; // Adjust the import path as needed

export default async function BundlesAction(body: {
  startDate: string;
  location: { lat: number; lng: number; district_id: string };
  frequency: string;
  servicePeriod: number;
  serviceType: string;
  duration: number;
  serviceId: string;
  propertyId: string;
  teamId?: string
}) {
  const bundles = await getBundles(body);

  return bundles.data;
}
