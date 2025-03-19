import { apiRequest } from "../api";

export const getTeams = async () => {
  return apiRequest<any>("/teams");
};

export const getTeamById = async (id: string) => {
  return apiRequest<any>(`/teams/${id}`);
};
