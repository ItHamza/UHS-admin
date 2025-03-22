import { teamAvailabilities } from "@/lib/service/team-availabilities";

export default async function TeamAvailabilityAction(ids: string[]) {
  const teamAvailabilitiesRes = await teamAvailabilities({ ids: ids });

  return teamAvailabilitiesRes.data;
}
