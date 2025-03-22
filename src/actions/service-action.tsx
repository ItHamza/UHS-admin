"use server";

import { fetchChildServices, fetchServices } from "@/lib/service/service";

type ServicesActionProps = {
  parentId?: string;
};
export default async function ServicesAction({
  parentId,
}: ServicesActionProps) {
  const services = parentId
    ? await fetchChildServices(parentId)
    : fetchServices();
  return services;
}
