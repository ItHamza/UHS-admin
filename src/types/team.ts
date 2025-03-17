export interface Team {
  id: string;
  name: string;
  teamLeader: string;
  teamSize: number;
  specialization: string;
  members: TeamMember[];
  schedule: TeamSchedule[];
  equipment: string[];
  vehicle: string;
  rating: number;
  active: boolean;
  createdAt: string; // ISO date string
  lastUpdated: string; // ISO date string
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  phoneNumber: string;
  email: string;
  skills: string[];
  yearsOfExperience: number;
  startDate: string; // ISO date string
  notes: string;
  availability: string;
  image: string; // URL to the member's image
}

interface TeamSchedule {
  id: string;
  date: string; // ISO date string (e.g., "2025-03-21")
  startTime: string; // Time in "HH:mm" format (e.g., "08:00")
  endTime: string; // Time in "HH:mm" format (e.g., "12:00")
  is_blocked: boolean;
  is_available: boolean;
  location: string;
  notes: string;
  bookingId?: string; // Optional booking ID
}
