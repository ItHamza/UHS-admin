"use server";
import {
  createTeamDetails,
  createTeamMember,
  getTeams,
  updateTeamDetails,
} from "@/lib/service/teams";

export async function TeamsAction() {
  const teams = await getTeams();
  return teams.data;
}
export async function CreateTeamAction(data: any) {
  const teams = await createTeamDetails(data);
  return teams.data;
}

export async function UpdateTeamAction(data: any) {
  const teams = await updateTeamDetails(data);
  return teams.data;
}

export async function CreateTeamMemberAction(data: any) {
  const teams = await createTeamMember(data);
  return teams.data;
}
