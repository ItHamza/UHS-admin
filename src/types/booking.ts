export interface Booking {
  id: string;
  customerId: string;
  customer: string;
  customerType: "residential" | "commercial";
  frequency: string;
  status: "scheduled" | "active" | "upcoming" | "cancelled" | "completed";
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

export interface User {
  id: string
  user_number: string
  name: string
  email: string
  phone: string
  apartment_number: string
  area: string
  createdAt: string
  district: string
  districtId: string
  is_active: boolean
  is_blocked: boolean
  is_team_leader: boolean
  lat: number
  lng: number
  property: string
  propertyId: string
  residenceType: string
  residenceTypeId: string
  role: string
  team_id: null
  updatedAt: string
  whatsapp_number: string
}

export interface TeamMember {
  id: string
  name: string
  email: string
  phone: string
}

export interface Team {
  Users: TeamMember
  break_end_time: string
  break_start_time: string
  createdAt: string
  description: string
  end_time: string
  id: string
  is_active: true
  lat: number
  lng: number
  name: string
  off_days: string
  ratings: null
  service_count: number
  start_date: string
  start_time: string
  team_number: string
  team_type: string
  updatedAt: string
}

export interface Service {
  cleaning_supply_included: boolean
  createdAt: string
  id: string
  name: string
  no_of_cleaners: number
  parent_id: string
  photo_url: string
  updatedAt: string
}

export interface Area {
  id: string
  name: string
  latitude: number
  longitude: number

}

export interface District {
  id: string
  name: string
  areaId: string
  latitude: number
  longitude: number

}

export interface ResidenceType {
  id: string
  type: string
}

export interface Property {
  id: string
  name: string
  districtId: string
  latitude: number
  longitude: number
}
export interface PropBooking {
  id: string
  appartment_number: string
  area: Area
  area_id: string
  booking_number: string
  cleaning_supplies: boolean
  createdAt: string
  currency: string
  current_team_availability: string
  current_team_availability_id: string
  customer: string
  customer_id: string
  date: string
  district: District
  district_id: string
  duration: string
  end_date: string
  frequency: string
  has_renewed: boolean
  instructions: ""
  is_renewed: boolean
  no_of_cleaners: 2
  paymentStatus: string
  payment_status: string
  previous_date: string
  property: Property
  property_id: string
  recurrence_plan: string
  renew_booking_id: string
  residence_type: ResidenceType
  residence_type_id: string
  service: Service
  serviceMinutes: number
  service_id: string
  services: []
  special_instructions: string
  status: string
  team: Team
  team_availability_ids: string[] 
  team_id: string
  total_amount: string
  updatedAt: string
  user: User
  user_available_in_apartment: boolean
  user_id: string
}
