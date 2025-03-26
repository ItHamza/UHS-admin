"use server";
import { getTeams } from "@/lib/service/teams";

export default async function TeamsAction() {
  const teams = await getTeams();
  return teams.data;
}
