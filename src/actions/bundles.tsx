// actions/BundlesAction.ts
import { getBundles } from "@/lib/service/bundles"; // Adjust the import path as needed

export default async function BundlesAction(body: {
  startDate: string;
  location: { lat: number; lng: number };
  frequency: string;
  servicePeriod: number;
  serviceType: string;
  duration: number;
}) {
  const bundles = await getBundles(body);

  return bundles;
}
