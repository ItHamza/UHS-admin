"use server";
import { getPricings } from "@/lib/service/pricing";

export default async function PricingAction() {
  const pricings = await getPricings();
  return pricings.data;
}
