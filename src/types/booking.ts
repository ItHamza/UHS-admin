export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerType: "residential" | "commercial";
  serviceType: string;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  date: string;
  timeSlot: string;
  duration: number;
  address: string;
  teamMembers: string[];
  price: number;
  notes: string;
  specialRequests: string;
  createdAt: string;
  lastUpdated: string;
}
