"use server";
import { assignTeamSlot, getBookingServices, OneTimeServiceTeamAvailabilities, teamAvailabilities } from "@/lib/service/team-availabilities";

export default async function TeamAvailabilityAction(ids: string[]) {
  const teamAvailabilitiesRes = await teamAvailabilities({ ids: ids });

  return teamAvailabilitiesRes.data;
}

export async function BookingServicesAction() {
  const bookingServices = await getBookingServices();
  return bookingServices.data;
}

export async function OneTimeServiceTeamAvailabilityAction(data: any) {
  const teamAvailabilitiesRes = await OneTimeServiceTeamAvailabilities(data);

  return teamAvailabilitiesRes.data;
}

export async function AssignTeamSlotAction(data: any) {
  const assignTeamSlotRes = await assignTeamSlot(data);

  return assignTeamSlotRes;
}