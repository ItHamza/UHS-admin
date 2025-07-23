import { apiRequest } from "../api";

export const getBookings = async (page: number, limit: number, service_id: string[], search: string) => {
  const params = new URLSearchParams();
  params.append('page', String(page));
  params.append('limit', String(limit));
  params.append('search', String(search));

  service_id.forEach(id => {
    params.append('service_id', id);
  });

  return apiRequest<any>(`/booking?${params.toString()}`);
};

export const getBookingById = async (id: string) => {
  return apiRequest<any>(`/booking/${id}`);
};


export async function renewBooking(id: string, data: any) {
  return apiRequest<any>(`/booking/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function updatePaymentStatus(id: string, data: any) {
  return apiRequest<any>(`/booking/payment/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}


export const specialiseBooking = async (data: {
  date: string
  end_date: string
  recurrence_plan: string;
  service_id: string
  area_id: string
  district_id: string
  property_id: string
  residence_type_id: string
  special_instructions: string
  user_available_in_apartment: boolean,
  total_amount: number,
  currency: string
  
  user_id: string
  booking_items: Array<{
    sub_service_item_id: string;
    quantity: boolean;
    special_notes: string;
  }>;
  cleaning_supply_included: boolean,

  appartment_number: string,
  no_of_cleaners: number,
}) => {
  return apiRequest<any>("/booking/specialised", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

export const deepBooking = async (data: {
  end_date: string, // Default to same day if not provided
  recurrence_plan: string, // "one_time",
  team_id: string, // body.team_id || null,
  payment_status: string, // "unpaid",
  status: string, // "pending",
  user_id: string,
  service_id: string,  
  area_id: string, 
  district_id: string,
  property_id: string,
  residence_type_id: string,
  total_amount: number, // parseFloat(body.total_amount.toString()),
  currency: string,
  no_of_cleaners: number,
  cleaning_supplies: boolean,
  special_instructions: string,
  user_available_in_apartment: boolean,
  appartment_number: string, 
  team_availability_ids: string, // [], // Empty for deep cleaning/specialized services
  current_team_availability_id: string, // null, // Not needed for these services
  is_renewed: boolean, // false,
  has_renewed: boolean, // false,
}) => {
  return apiRequest<any>("/booking/deep", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};
