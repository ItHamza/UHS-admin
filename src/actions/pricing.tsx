"use server";
import { createPricing, deletePricing, getPricings, updatePricing } from "@/lib/service/pricing";

export default async function PricingAction() {
  const pricings = await getPricings();
  return pricings.data;
}

export async function PricingCreateAction(pricing: any) {
  const pricings = await createPricing(pricing);
  return pricings.data;
}

export async function PricingUpdateAction(pricing: any) {
  const pricings = await updatePricing(pricing);
  return pricings.data;
}

export async function PricingDeleteAction(id: string) {
  const res = await deletePricing(id);
  return res.data;
}
