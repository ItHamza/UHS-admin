"use server";
import { createPricing, createSpecialPricing, deletePricing, deleteSpecialPricing, fetchSpecialServicePricing, getPricings, updatePricing, updateSpecialPricing } from "@/lib/service/pricing";

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

export async function SpecialPricingAction() {
  const specpricings = await fetchSpecialServicePricing();
  return specpricings.data;
}


export async function SpecialPricingCreateAction(pricing: any) {
  const specpricings = await createSpecialPricing(pricing);
  return specpricings.data;
}

export async function SpecialPricingUpdateAction(pricing: any) {
  const specpricings = await updateSpecialPricing(pricing);
  return specpricings.data;
}

export async function SpecialPricingDeleteAction(id: string) {
  const res = await deleteSpecialPricing(id);
  return res;
}
