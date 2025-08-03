export interface User {
  id: string
  name: string
  phone: string
  email: string
  area?: string
  districtId?: string
  propertyId?: string
  residenceTypeId?: string
  apartment_number?: string
  [key: string]: any
}

export interface BookingData {
  service: string
  subService: string
  area: string
  district: string
  property: string
  residenceType: string
  frequency: string
  duration: string
  startDate: string
  total_amount: number
  bundle: string
  timeSlot: string
  userName: string
  phoneNumber: string
  email: string
  apartmentNumber: string
  userPresent: boolean
  specialInstructions: string
  selectedSpecializedCategory: string
  selectedSpecializedCategoryName: string
  selectedSpecializedSubCategories: SpecializedSubCategory[]
  selectedSpecializedSubCategoryName: string
  selectedSubServiceName: string
  teamId?: string
}

export interface SpecializedSubCategory {
  id: string
  name: string
  quantity: number
  price_per_unit?: number
  currency?: string
  category?: string
  no_of_cleaners?: number
}

export interface FinalBookingData {
  userPhone: string
  no_of_cleaners: number
  cleaning_supplies: boolean
  userId: string
  timeslots: TimeSlot[]
  teamId: string
  areaId: string
  districtId: string
  propertyId: string
  residenceTypeId: string
  total_amount: number
  startDate: string
  endDate: string
  frequency: string
  renewal_slots: TimeSlot[]
  status: string
  payment_status: string
}

export interface TimeSlot {
  schedule_id: string
  start_time: string
  end_time: string
  date: string
}

export interface ServiceOption {
  id: string
  name: string
  parent_id?: string
  photo_url?: string
  description?: string
}

export interface LocationOption {
  id: string
  name: string
  latitude?: number
  longitude?: number
}

export interface Bundle {
  bundleId: string
  dayCombination: string[]
  booking: BookingSlot[]
  renewableSlots: BookingSlot[]
  teamId?: string
}

export interface BookingSlot {
  day: string
  date: string
  teamId: string
  timeSlots: {
    startTime: string
    endTime: string
    scheduleId: string
    date: string
  }[]
}
