"use server";
import { createProperty, deleteProperty, getProperties, getPropertyById, updateProperty } from "@/lib/service/property";

export async function PropertyAction(districtId?: string | null) {
  const properties = await getProperties(districtId);
  return properties.data;
}

export async function PropertyDetailAction(propertyId: string) {
  const property = await getPropertyById(propertyId);
  return property.data;
}

export async function PropertyCreateAction(property: any) {
  const propertys = await createProperty(property);
  return propertys.data;
}

export async function PropertyUpdateAction(property: any) {
  const propertys = await updateProperty(property);
  return propertys.data;
}

export async function PropertyDeleteAction(id: string) {
  const res = await deleteProperty(id);
  return res.data;
}
