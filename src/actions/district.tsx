"use server";
import { getDistricts } from "@/lib/service/district";

export default async function DistrictAction(areaId: string | null) {
  const districts = await getDistricts(areaId);
  return districts.data;
}
