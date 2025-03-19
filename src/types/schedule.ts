export interface Schedule {
  id: string;
  teamId: string;
  teamName: string;
  date: string;
  startTime: string;
  endTime: string;
  is_blocked: boolean;
  is_available: boolean;
  location: string;
  assignedMembers: string[];
  notes: string;
  createdAt: string;
  lastUpdated: string;
  duration: string;
  status: string;
}
