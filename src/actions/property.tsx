import { getProperties, getPropertyById } from "@/lib/service/property";

export async function PropertyAction(districtId: string | null) {
  const properties = await getProperties(districtId);
  return properties.data;
}

export async function PropertyDetailAction(propertyId: string) {
  const property = await getPropertyById(propertyId);
  return property.data;
}
