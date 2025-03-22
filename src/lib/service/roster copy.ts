import { apiRequest } from "../api";

export interface RosterFilters {
  start_date?: string;
  end_date?: string;
  team_id?: string;
}

export const getRosters = async (filters?: RosterFilters) => {
  let url = "/roster";

  if (filters && Object.keys(filters).length > 0) {
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  return apiRequest<any>(url);
};
export const getRosterDetails = async (id: string) => {
  return apiRequest<any>(`/team/${id}`);
};
