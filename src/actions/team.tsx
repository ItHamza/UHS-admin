"use server";
import {
  createTeamDetails,
  createTeamMember,
  deleteTeam,
  getTeams,
  updateTeamDetails,
} from "@/lib/service/teams";

export async function TeamsAction(page: number, limit: number, search: string) {
  const teams = await getTeams(page, limit, search);
  return teams;
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
export async function DeleteTeamAction(id: string) {
  const res = await deleteTeam(id);
  return res.data;
}

