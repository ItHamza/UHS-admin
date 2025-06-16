"use server";
import { createArea, deleteArea, getAreas, updateArea } from "@/lib/service/area";

export default async function AreaAction() {
  const areas = await getAreas();
  return areas.data;
}

export async function AreaCreateAction(area: any) {
  const areas = await createArea(area);
  return areas.data;
}

export async function AreaUpdateAction(area: any) {
  const areas = await updateArea(area);
  return areas.data;
}

export async function AreaDeleteAction(id: string) {
  const res = await deleteArea(id);
  return res.data;
}
