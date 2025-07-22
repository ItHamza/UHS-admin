import { apiRequest } from "../api";

export const getTeams = async (page: number, limit: number, search: string) => {
  const params = new URLSearchParams();
  params.append('page', String(page));
  params.append('limit', String(limit));
  params.append('search', String(search));
  return apiRequest<any>(`/teams?${params.toString()}`);
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

export async function deleteTeam(id: string) {
  return apiRequest<any>(`/teams/${id}`, {
    method: "DELETE",
  });
}
