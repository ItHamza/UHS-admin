"use server";
import { createDistrict, deleteDistrict, getDistricts, updateDistrict } from "@/lib/service/district";

export default async function DistrictAction(areaId?: string | null) {
  const districts = await getDistricts(areaId);
  return districts.data;
}

export async function DistrictCreateAction(district: any) {
  const districts = await createDistrict(district);
  return districts.data;
}

export async function DistrictUpdateAction(district: any) {
  const districts = await updateDistrict(district);
  return districts.data;
}

export async function districtDeleteAction(id: string) {
  const res = await deleteDistrict(id);
  return res.data;
}
