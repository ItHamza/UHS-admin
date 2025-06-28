interface Service {
  id: string
  name: string
  parent_id: string | null
  photo_url?: string
  no_of_cleaners: number
  cleaning_supply_included: boolean
  createdAt: string
  updatedAt: string
}

interface ResidenceType {
  id: string
  type: string
}

interface PricingRule {
  id: string
  service_id: string
  residence_type_id: string
  frequency: string
  duration_value: number
  duration_unit: string
  unit_amount: string
  currency: string
  total_services: number
  total_amount: string
  createdAt: string
  updatedAt: string
  service: Service
  residenceType: ResidenceType
}

type SpecialPricingCategory = "sofa" | "mattress" | "carpet" | "curtain";

interface SpecialPricingRule{
  id: string
  service_id: string
  name: string
  category: SpecialPricingCategory
  sub_category: string
  photo: string
  price_per_unit: string
  currency: string
  description: string
  is_active: boolean
  time_duration_in_minutes: number
  createdAt: string
  updatedAt: string
  service: Service
}

interface ParentService {
  id: string
  name: string
  subServices: Service[]
}
