import { apiRequest } from "../api";

export async function getUsers() {
  return apiRequest<any>("/users");
}

export async function createUser(data: any) {
  return apiRequest<any>("/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function updateTeam(data: any) {
  return apiRequest<any>("/users/update-team", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}
