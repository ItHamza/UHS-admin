"use server";
import { createResidence, deleteResidence, getResidences, updateResidence } from "@/lib/service/residence";

export default async function ResidenceAction() {
  const residence = await getResidences();
  return residence.data;
}

export async function ResidenceCreateAction(residence: any) {
  const residences = await createResidence(residence);
  return residences.data;
}

export async function ResidenceUpdateAction(residence: any) {
  const residences = await updateResidence(residence);
  return residences.data;
}

export async function ResidenceDeleteAction(id: string) {
  const res = await deleteResidence(id);
  return res.data;
}
