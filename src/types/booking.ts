export interface Booking {
  id: string;
  customerId: string;
  customer: string;
  customerType: "residential" | "commercial";
  frequency: string;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  date: string;
  timeSlot: string;
  duration: number;
  address: string;
  team: string;
  price: number;
  notes: string;
  specialRequests: string;
  createdAt: string;
  lastUpdated: string;
}
