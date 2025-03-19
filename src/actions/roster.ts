import { getBookings } from "@/lib/service/booking";
import { getRosters, RosterFilters } from "@/lib/service/roster";

export default async function RosterAction(filters?: RosterFilters) {
  const roster = await getRosters(filters);
  return roster.schedules;
}
