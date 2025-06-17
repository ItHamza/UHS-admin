"use server";

import { createService, deleteService, fetchChildServices, fetchServices, updateService } from "@/lib/service/service";

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

export async function ServiceCreateAction(service: any) {
  const services = await createService(service);
  return services.data;
}

export async function ServiceUpdateAction(service: any) {
  const services = await updateService(service);
  return services.data;
}

export async function ServiceDeleteAction(id: string) {
  const res = await deleteService(id);
  return res.data;
}
