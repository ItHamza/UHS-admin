export interface Booking {
  id: string;
  customerId: string;
  customer: string;
  customerType: "residential" | "commercial";
  frequency: string;
  status: "pending" | "in_progress" | "cancelled" | "completed";
  date: string;
  timeSlot: string;
  duration: number;
  address: string;
  team: any;
  price: number;
  notes: string;
  specialRequests: string;
  createdAt: string;
  lastUpdated: string;
  [key: string]: any;
}
