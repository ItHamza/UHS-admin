import { apiRequest } from "../api";

export const getTeams = async () => {
  return apiRequest<any>("/teams");
};

export const getTeamById = async (id: string) => {
  return apiRequest<any>(`/teams/${id}`);
};

export const getAllMembers = async () => {
  return apiRequest<any>(`/teams/members`);
};

export const createTeamDetails = async (data: any) => {
  return apiRequest<any>(`/teams`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

export const updateTeamDetails = async (data: any) => {
  return apiRequest<any>(`/teams`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

export const createTeamMember = async (data: any) => {
  return apiRequest<any>(`/teams/members`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};
