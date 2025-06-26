"use client"

import { useState, useEffect, Fragment, startTransition } from "react"
import { Dialog, Tab, Transition } from "@headlessui/react"
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronUpDownIcon,
  CheckIcon,
  TagIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UsersIcon,
  HomeIcon,
} from "@heroicons/react/24/outline"
import toast from "react-hot-toast"
import PricingAction, { PricingCreateAction, PricingUpdateAction, SpecialPricingAction, SpecialPricingCreateAction, SpecialPricingDeleteAction, SpecialPricingUpdateAction } from "@/actions/pricing"
import { getPricings } from "@/lib/service/pricing"
import ResidenceAction from "@/actions/residence"
import ServicesAction from "@/actions/service-action"
import { fetchChildServices, fetchServices } from "@/lib/service/service"
import { Award, House, MapPinIcon, Sofa } from "lucide-react"

// Types based on your API response
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
  createdAt: string
  updatedAt: string
  service: Service
}

interface ParentService {
  id: string
  name: string
  subServices: Service[]
}

interface Package {
  id: string
  name: string
  description: string
  services: string[]
  frequency: string
  residenceTypeId: string
  originalPrice: number
  discountPercentage: number
  finalPrice: number
}

// Fixed frequency values since you don't have a frequency table
const FREQUENCIES = [
  { value: "one_time", label: "One Time", description: "Single service booking" },
  { value: "once_a_week", label: "Once a Week", description: "Once per week" },
  { value: "twice_a_week", label: "Twice a week", description: "Every two weeks" },
  { value: "three_times_a_week", label: "Three times a week", description: "Every two weeks" },
  { value: "four_times_a_week", label: "Four times a week", description: "Every two weeks" },
  { value: "five_times_a_week", label: "Five times a week", description: "Every two weeks" },
  { value: "six_times_a_week", label: "Six times a week", description: "Every two weeks" },
]

const DURATION_UNITS = [
  { value: "min", label: "Minutes" },
  { value: "hour", label: "Hours" },
]

const CURRENCIES = [
  { value: "QAR", label: "QAR" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
]

const CATEGORIES = [
  { value: "sofa", label: "Sofa" },
  { value: "mattress", label: "Mattress" },
  { value: "carpet", label: "Carpet" },
  { value: "curtain", label: "Curtain" },
]

const TABS = [
  { name: "Services Pricing Rule", icon: House },
  { name: "Specialize Services Pricing Rule", icon: Sofa },
  { name: "Special Packages", icon: Award },
]

const initialPackages: Package[] = [
  {
    id: "pkg1",
    name: "Complete Home Package",
    description: "Regular + Deep cleaning combo",
    services: ["s1", "s2"],
    frequency: "f2",
    residenceTypeId: "rt2",
    originalPrice: 175,
    discountPercentage: 25,
    finalPrice: 131.25,
  },
  {
    id: "pkg2",
    name: "Premium Package",
    description: "All services included",
    services: ["s1", "s2", "s3"],
    frequency: "f3",
    residenceTypeId: "rt3",
    originalPrice: 300,
    discountPercentage: 30,
    finalPrice: 210,
  },
]

export default function PricingManagementRedesigned() {
  // State
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([])
  const [specialPricingRules, setSpecialPricingRules] = useState<SpecialPricingRule[]>([])
  const [parentServices, setParentServices] = useState<ParentService[]>([])
  const [childServices, setChildServices] = useState<Service[]>([])
  const [specialServices, setSpecialServices] = useState<Service[]>([])
  const [residenceTypes, setResidenceTypes] = useState<ResidenceType[]>([])
  const [packages, setPackages] = useState<Package[]>(initialPackages)
  const [loading, setLoading] = useState(true)

  // Modal states
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false)
  const [isSpecialPricingModalOpen, setIsSpecialPricingModalOpen] = useState(false)
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false)
  const [editingPricing, setEditingPricing] = useState<PricingRule | null>(null)
  const [editingSpecialPricing, setEditingSpecialPricing] = useState<SpecialPricingRule | null>(null)
  const [editingPackage, setEditingPackage] = useState<Package | null>(null)
  

  // Form state
  const [pricingForm, setPricingForm] = useState({
    id: "",
    parent_id: "",
    service_id: "",
    residence_type_id: "",
    frequency: "",
    duration_value: 0,
    duration_unit: "min",
    unit_amount: "",
    currency: "QAR",
    total_services: 1,
    total_amount: ""
  })

  const [specialPricingForm, setSpecialPricingForm] = useState({
    id: "",
    service_id: "",
    name: "",
    category: "sofa",
    sub_category: "",
    price_per_unit: "",
    currency: "QAR",
    description: "",
    parent_id: "",
    // photo: "",
  })

  const [packageForm, setPackageForm] = useState({
    name: "",
    description: "",
    services: [] as string[],
    frequency: "",
    residenceTypeId: "",
    originalPrice: 0,
    discountPercentage: 0,
  })

  // Filters
  const [filters, setFilters] = useState({
    parentServiceId: "",
    residenceTypeId: "",
    frequency: "",
  })

  // Delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete]  = useState<{ type: string; id: string } | null>(null)

  // Fetch data on component mount
  useEffect(() => {
    startTransition(async () => {
      try {
        setLoading(true)

        // Fetch pricing rules
        const pricingResponse = await PricingAction();
        setPricingRules(pricingResponse || [])
        
        // Fetch parent services
        const servicesResponse = await fetchServices()
        // const servicesData = await servicesResponse.json()
        
        setParentServices(servicesResponse.data || [])
        
        // Fetch residence types
        const residenceResponse = await ResidenceAction()
        // const residenceData = await residenceResponse.json()
        setResidenceTypes(residenceResponse || [])

        // Fetch Special Pricing
        const specialPricingResponse = await SpecialPricingAction()
        setSpecialPricingRules(specialPricingResponse)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load data")
      } finally {
        setLoading(false)
      }
    });
    }, []);

    useEffect(() => {
      if (!parentServices.length || parentServices.every(p => p.subServices?.length)) return;

      startTransition(() => {
        const loadSubServices = async () => {
          try {
            const updated = await Promise.all(
              parentServices.map(async (parent) => {
                const response = await fetchChildServices(parent.id);
                return {
                  ...parent,
                  subServices: response.data || [],
                };
              })
            );
            setParentServices(updated);
            const allChildServices = updated.flatMap(service => service.subServices || []);
            setChildServices(allChildServices);
          } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load data");
          } finally {
            setLoading(false);
          }
        };

        loadSubServices();
      });
    }, [parentServices]);

    useEffect(() => {
      if (!childServices.length || specialServices.length > 0) return;

      startTransition(() => {
        const loadSubServices = async () => {
          try {
            const updated = await Promise.all(
              childServices.map(async (parent) => {
                const response = await fetchChildServices(parent.id);
                return {
                  ...parent,
                  subServices: response.data || [],
                };
              })
            );
            setChildServices(updated);
            const allSpecialServices = updated.flatMap(service => service.subServices || []);
            setSpecialServices(allSpecialServices);
          } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load data");
          } finally {
            setLoading(false);
          }
        };

        loadSubServices();
      });
    }, [childServices]);

    useEffect(() => {
      const total = calculateTotalAmount();

      if (pricingForm.total_amount !== total) {
        setPricingForm((prev) => ({
          ...prev,
          total_amount: total,
        }));
      }
    }, [pricingForm.unit_amount, pricingForm.total_services]);


  const fetchInitialData = async () => {
    try {
      setLoading(true)

      // Fetch pricing rules
      const pricingResponse = await getPricings();
      setPricingRules(pricingResponse || [])

      // Fetch parent services
      const servicesResponse = await fetchServices()
      const servicesData = await servicesResponse.json()
      setParentServices(servicesData || [])

      // Fetch residence types
      const residenceResponse = await ResidenceAction()
      const residenceData = await residenceResponse.json()
      setResidenceTypes(residenceData || [])
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  // Get sub-services for selected parent service
  const [subServices, setSubServices] = useState<Service[]>([])
  const [loadingSubServices, setLoadingSubServices] = useState(false)

  const fetchSubServices = async (parentServiceId: string) => {
    try {
      setLoadingSubServices(true)
      const response = await fetchChildServices(parentServiceId)
      setSubServices(response.data || [])
    } catch (error) {
      console.error("Error fetching sub-services:", error)
      toast.error("Failed to load sub-services")
    } finally {
      setLoadingSubServices(false)
    }
  }

  // Helper functions
  const resetForms = () => {
    setPricingForm({
      id: "",
      parent_id: "",
      service_id: "",
      residence_type_id: "",
      frequency: "",
      duration_value: 0,
      duration_unit: "min",
      unit_amount: "",
      currency: "QAR",
      total_services: 1,
      total_amount: ''
    })
    setSpecialPricingForm({
      id: "",
      service_id: specialPricingRules[0].service_id,
      name: "",
      category: "sofa",
      sub_category: "",
      price_per_unit: "",
      currency: "QAR",
      description: "",
      parent_id: ""
    })
    setPackageForm({
      name: "",
      description: "",
      services: [],
      frequency: "",
      residenceTypeId: "",
      originalPrice: 0,
      discountPercentage: 0,
    })
    setSubServices([])
    setEditingPricing(null)
    setEditingSpecialPricing(null)

  }

  const getServiceName = (serviceId: string) => {
    const service = childServices.find((s) => s.id === serviceId)
    return service ? service.name : "Unknown Service"
  }

  const getResidenceTypeName = (residenceTypeId: string) => {
    const residenceType = residenceTypes.find((rt) => rt.id === residenceTypeId)
    return residenceType ? residenceType.type : "Unknown Type"
  }

  const getFrequencyName = (value: string) => {
    const frequency = FREQUENCIES.find((f) => f.value === value)
    return frequency ? frequency.label : "Unknown Frequency"
  }

  const calculateTotalAmount = () => {
    const unitAmount = Number.parseFloat(pricingForm.unit_amount) || 0
    return (unitAmount * pricingForm.total_services).toFixed(2)
  }

  const getFrequencyLabel = (frequency: string) => {
    const freq = FREQUENCIES?.find((f) => f.value === frequency)
    return freq ? freq.label : frequency
  }

  const getParentServiceName = (serviceId: string) => {
    for (const parent of parentServices) {
      const subService = parent.subServices?.find((sub) => sub.id === serviceId)
      if (subService) {
        return parent?.name || "Unknown"
      }
    }
    return "Unknown"
  }

  const getChildServiceName = (serviceId: string) => {
    for (const child of childServices) {
      if (child.id === serviceId) {
        return child?.name || "Unknown"
      }
    }
    return "Unknown"
  }

  const getSpecialServiceName = (serviceId: string) => {
    for (const special of specialServices) {
      if (special.id === serviceId) {
        return special?.name || "Unknown"
      }
    }
    return "Unknown"
  }

  // Filter pricing rules
  const filteredPricingRules = pricingRules.filter((rule) => {
    if (filters.parentServiceId) {
      // const parentService = parentServices?.find((p) => p.id === filters.parentServiceId)
      if (filters.parentServiceId !== rule.service_id) {
        return false
      }
    }
    if (filters.residenceTypeId && rule.residence_type_id !== filters.residenceTypeId) {
      return false
    }
    if (filters.frequency && rule.frequency !== filters.frequency) {
      return false
    }
    return true
  })

  const handleSubmit = async () => {
    if (
      !pricingForm.service_id ||
      !pricingForm.residence_type_id ||
      !pricingForm.frequency ||
      !pricingForm.duration_value ||
      !pricingForm.duration_unit ||
      !pricingForm.unit_amount ||
      !pricingForm.currency ||
      !pricingForm.total_services ||
      !pricingForm.total_amount
    ) {
      toast.error("All fields are required")
      return
    }

    if (editingPricing) {
      try {
        setLoading(true)
        const responsePricing = await PricingUpdateAction(pricingForm)
        setPricingRules(pricingRules.map((pr) => (pr.id === editingPricing.id ? { ...pr, ...pricingForm } : pr)))

        toast.success("Pricing updated successfully")
        setIsPricingModalOpen(false)
        resetForms()
      } catch (error: any) {
        console.error("Error updating pricing:", error)
        toast.error(error.message || "Failed to update pricing")
      } finally {
        setLoading(false)
      }
    } else {
      try {
        setLoading(true)
        const responsePricing = await PricingCreateAction(pricingForm)
        setPricingRules(prev => [...prev, responsePricing.data])
        toast.success("Pricing added successfully")
        setIsPricingModalOpen(false)
        resetForms()
      } catch (error: any) {
        console.error("Error creating pricing:", error)
        toast.error(error.message || "Failed to create pricing")
      } finally {
        setLoading(false)
      }
    }
  }

  const handleSpecializeSubmit = async () => {
    if (
      !specialPricingForm.service_id ||
      !specialPricingForm.name ||
      !specialPricingForm.category ||
      !specialPricingForm.sub_category ||
      !specialPricingForm.price_per_unit
    ) {
      toast.error("All fields are required")
      return
    }

    if (editingSpecialPricing) {
      try {
        setLoading(true)
        const responsePricing = await SpecialPricingUpdateAction(specialPricingForm)
        setSpecialPricingRules(
          specialPricingRules.map((pr) =>
            pr.id === editingSpecialPricing.id
              ? {
                  ...pr,
                  ...specialPricingForm,
                  category: specialPricingForm.category as SpecialPricingCategory, // if still needed
                }
              : pr
          )
        );

        toast.success("Specialize Pricing updated successfully")
        setIsPricingModalOpen(false)
        resetForms()
      } catch (error: any) {
        console.error("Error updating specialize pricing:", error)
        toast.error(error.message || "Failed to update specialize pricing")
      } finally {
        setLoading(false)
      }
    } else {
      try {
        setLoading(true)
        const responseSpecialPricing = await SpecialPricingCreateAction(specialPricingForm)
        setSpecialPricingRules(prev => [...prev, responseSpecialPricing.data])
        toast.success("Special Pricing added successfully")
        setIsPricingModalOpen(false)
        resetForms()
      } catch (error: any) {
        console.error("Error creating special pricing:", error)
        toast.error(error.message || "Failed to create special pricing")
      } finally {
        setLoading(false)
      }
    }
  setEditingSpecialPricing(null)
  setIsSpecialPricingModalOpen(false)
  }


  const handleEdit = (pricing: PricingRule) => {
    setEditingPricing(pricing)
    setPricingForm({
      id: pricing.id,
      parent_id: pricing.service.parent_id ?? "",
      service_id: pricing.service_id,
      residence_type_id: pricing.residence_type_id,
      frequency: pricing.frequency,
      duration_value: pricing.duration_value,
      duration_unit: pricing.duration_unit,
      unit_amount: pricing.unit_amount,
      currency: pricing.currency,
      total_services: pricing.total_services,
      total_amount: pricing.total_amount
    })

    // Fetch sub-services for the parent service
    const parentService = parentServices?.find((p) => p.subServices?.some((sub) => sub.id === pricing.service_id))
    if (parentService) {
      fetchSubServices(parentService.id)
    }

    setIsPricingModalOpen(true)
  }

  const handleSpecialEdit = (pricing: SpecialPricingRule) => {
    setEditingSpecialPricing(pricing)
    setSpecialPricingForm({
      id: pricing.id,
      service_id: pricing.service.id,
      name: pricing.name,
      category: pricing.category as SpecialPricingCategory,
      sub_category: pricing.sub_category,
      price_per_unit: pricing.price_per_unit,
      currency: "QAR",
      description: pricing.description,
      parent_id: pricing.service?.parent_id ?? ""
    })

    // Fetch sub-services for the parent service
    const parentService = parentServices?.find((p) => p.subServices?.some((sub) => sub.id === pricing.service.parent_id))
    const subService = parentService?.subServices?.find(
      (sub) => sub.id === pricing.service.parent_id
    );
    if (subService) {
      fetchSubServices(subService.id)
    }

    setIsSpecialPricingModalOpen(true)
  }

  const handleEditPackage = (pkg: Package) => {
    setEditingPackage(pkg)
    setPackageForm({
      name: pkg.name,
      description: pkg.description,
      services: pkg.services,
      frequency: pkg.frequency,
      residenceTypeId: pkg.residenceTypeId,
      originalPrice: pkg.originalPrice,
      discountPercentage: pkg.discountPercentage,
    })
    setIsPackageModalOpen(true)
  }

  const confirmDelete  = async () => {
    if (!itemToDelete) return

    const { type, id } = itemToDelete
    switch (type) {
      case "pricing":
        try {
          const response = await fetch(`/api/pricing/${id}`, {
            method: "DELETE",
          })

          if (response.ok) {
            setPricingRules((prev) => prev.filter((rule) => rule.id !== id))
            toast.success("Pricing deleted successfully")
          } else {
            toast.error("Failed to delete pricing")
          }
        } catch (error) {
          console.error("Error deleting pricing:", error)
          toast.error("Failed to delete pricing")
        }
        break
      case "specializePricing":
        try {
          const response = await SpecialPricingDeleteAction(id)
          debugger
          if (response.success) {
            setSpecialPricingRules((prev) => prev.filter((rule) => rule.id !== id))
            toast.success("Specialize Pricing deleted successfully")
          } else {
            toast.error("Failed to delete specialize pricing")
          }
        } catch (error) {
          console.error("Error deleting specialize pricing:", error)
          toast.error("Failed to delete specialize pricing")
        }
        break
      case "packagePricing":
        try {
          const response = await fetch(`/api/pricing/${id}`, {
            method: "DELETE",
          })

          if (response.ok) {
            setPackages((prev) => prev.filter((rule) => rule.id !== id))
            toast.success("Package deleted successfully")
          } else {
            toast.error("Failed to delete package")
          }
        } catch (error) {
          console.error("Error deleting package:", error)
          toast.error("Failed to delete package")
        }
        break
    }
    setDeleteConfirmOpen(false)
    setItemToDelete(null)
  }

  const handleDelete = (type: string, id: string) => {
    setItemToDelete({ type, id })
    setDeleteConfirmOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pricing data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Pricing Management</h1>
          <p className="text-gray-600 mt-2">Manage service pricing for different residence types and frequencies</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <Tab.Group>
            <Tab.List className="grid grid-cols-2 gap-2 mb-4 bg-gray-100 sm:flex sm:border-b sm:gap-0">
              {TABS.map((tab) => (
                <Tab
                  key={tab.name}
                  className={({ selected }) =>
                    `text-sm focus:outline-none flex items-center space-x-2 ${
                      selected
                        ? "text-blue-700 bg-blue-100 sm:bg-white sm:border-b-2 sm:border-blue-700 bg-white"
                        : "text-gray-700 sm:text-gray-500 sm:hover:text-gray-700 sm:hover:bg-gray-50"
                    } 
                    p-4 sm:px-6 sm:py-3 border sm:border-none rounded-lg sm:rounded-none`
                  }
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.name}
                </Tab>
              ))}
            </Tab.List>

            <Tab.Panels>
              {/* Service Pricing Panel */}
              <Tab.Panel>
                {/* Filters */}
                

                {/* Pricing Rules */}
                <div className="bg-white rounded-lg overflow-hidden">
                  <div className="px-4 md:px-6 py-4 border-b flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Pricing Rules</h2>
                      <p className="text-sm text-gray-600">
                        Manage pricing for services across different residence types and frequencies
                      </p>
                    </div>
                    
                    <button
                      onClick={() => {
                        resetForms()
                        setIsPricingModalOpen(true)
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Pricing Rule
                    </button>
                  </div>

                  {/* Filters */}
                  <div className="bg-white rounded-lg p-4 md:p-6 mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Parent Service</label>
                        <select
                          value={filters.parentServiceId || ""}
                          onChange={(e) => setFilters((prev) => ({ ...prev, parentServiceId: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition"
                        >
                          <option value="">All Services</option>
                          {childServices.map((service) => (
                            <option key={service.id} value={service.id}>
                              {service.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Residence Type</label>
                        <select
                          value={filters.residenceTypeId || ""}
                          onChange={(e) => setFilters((prev) => ({ ...prev, residenceTypeId: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition"
                        >
                          <option value="">All Types</option>
                          {residenceTypes.map((type) => (
                            <option key={type.id} value={type.id}>
                              {type.type}
                            </option>
                          ))}
                        </select>

                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                        <select
                          value={filters.frequency || ""}
                          onChange={(e) => setFilters((prev) => ({ ...prev, frequency: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition"
                        >
                          <option value="">All Frequencies</option>
                          {FREQUENCIES.map((freq) => (
                            <option key={freq.value} value={freq.value}>
                              {freq.label}
                            </option>
                          ))}
                        </select>

                      </div>
                    </div>
                  </div>

                  <div className="p-4 md:p-6">
                    {filteredPricingRules.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <TagIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No pricing rules found</h3>
                        <p className="text-gray-600">Create your first pricing rule to get started.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Desktop Table View */}
                        <div className="hidden lg:block overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Service
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Residence Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Frequency
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Duration
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Pricing
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Details
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {filteredPricingRules.map((rule) => (
                                <tr key={rule.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">{rule.service?.name}</div>
                                      <div className="text-xs text-gray-500">{getParentServiceName(rule.service_id)}</div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <HomeIcon className="h-4 w-4 text-gray-400 mr-2" />
                                      <span className="text-sm text-gray-900">{rule.residenceType?.type}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      {getFrequencyLabel(rule.frequency)}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                                      <span className="text-sm text-gray-900">
                                        {rule.duration_value} {rule.duration_unit}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">
                                        {rule.total_amount} {rule.currency}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {rule.unit_amount} {rule.currency} per service
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="space-y-1">
                                      <div className="flex items-center text-xs text-gray-500">
                                        <UsersIcon className="h-3 w-3 mr-1" />
                                        {rule.service?.no_of_cleaners} cleaners
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {rule.service?.cleaning_supply_included ? "Supplies included" : "No supplies"}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleEdit(rule)} className="text-blue-600 hover:text-blue-900 mr-4">
                                      <PencilIcon className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDelete("pricing", rule.id)}
                                      className="text-red-600 hover:text-red-900"
                                    >
                                      <TrashIcon className="h-4 w-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="lg:hidden space-y-4">
                          {filteredPricingRules.map((rule) => (
                            <div key={rule.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h3 className="text-sm font-medium text-gray-900">{rule.service?.name ?? "third name"}</h3>
                                  <p className="text-xs text-gray-500">{getParentServiceName(rule.service_id)}</p>
                                </div>
                                <div className="flex space-x-2">
                                  <button onClick={() => handleEdit(rule)} className="text-blue-600 hover:text-blue-900">
                                    <PencilIcon className="h-4 w-4" />
                                  </button>
                                  <button
                                   onClick={() => handleDelete("pricing", rule.id)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <div className="flex items-center text-gray-500 mb-1">
                                    <HomeIcon className="h-3 w-3 mr-1" />
                                    Residence
                                  </div>
                                  <div className="text-gray-900">{rule.residenceType?.type}</div>
                                </div>
                                <div>
                                  <div className="text-gray-500 mb-1">Frequency</div>
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {getFrequencyLabel(rule.frequency)}
                                  </span>
                                </div>
                                <div>
                                  <div className="flex items-center text-gray-500 mb-1">
                                    <ClockIcon className="h-3 w-3 mr-1" />
                                    Duration
                                  </div>
                                  <div className="text-gray-900">
                                    {rule.duration_value} {rule.duration_unit}
                                  </div>
                                </div>
                                <div>
                                  <div className="flex items-center text-gray-500 mb-1">
                                    <CurrencyDollarIcon className="h-3 w-3 mr-1" />
                                    Price
                                  </div>
                                  <div className="text-gray-900 font-medium">
                                    {rule.total_amount} {rule.currency}
                                  </div>
                                </div>
                              </div>

                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="flex justify-between text-xs text-gray-500">
                                  <span className="flex items-center">
                                    <UsersIcon className="h-3 w-3 mr-1" />
                                    {rule.service?.no_of_cleaners} cleaners
                                  </span>
                                  <span>{rule.service?.cleaning_supply_included ? "Supplies included" : "No supplies"}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Tab.Panel>

              {/* Specialize Service Pricing Panel */}
              <Tab.Panel>
                {/* Specialize Service Pricing Rules */}
                <div className="bg-white rounded-lg overflow-hidden">
                  <div className="px-4 md:px-6 py-4 border-b flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Specialize Pricing Rules</h2>
                      <p className="text-sm text-gray-600">
                        Manage pricing for specialize services
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        resetForms()
                        setIsSpecialPricingModalOpen(true)
                        fetchSubServices(specialPricingRules[0].service.parent_id ?? specialPricingRules[0].service_id)
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Specialize Pricing Rule
                    </button>
                  </div>

                  <div className="p-4 md:p-6">
                    {specialPricingRules.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <TagIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No pricing rules found</h3>
                        <p className="text-gray-600">Create your first pricing rule to get started.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Desktop Table View */}
                        <div className="hidden lg:block overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Service
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Service Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Pricing
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Details
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {specialPricingRules.map((rule) => (
                                <tr key={rule.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">{getChildServiceName(rule.service.parent_id ?? "")}</div>
                                      <div className="text-xs text-gray-500">{getSpecialServiceName(rule.service.id)}</div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <HomeIcon className="h-4 w-4 text-gray-400 mr-2" />
                                      <span className="text-sm text-gray-900">{rule.name}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">
                                        {rule.price_per_unit} {'QAR'}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="space-y-1">
                                      <div className="flex items-center text-xs text-gray-500">
                                        <UsersIcon className="h-3 w-3 mr-1" />
                                        {rule.service.no_of_cleaners} cleaners
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {rule.service.cleaning_supply_included ? "Supplies included" : "No supplies"}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {rule.is_active ? 'Active': 'Deleted'}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleSpecialEdit(rule)} className="text-blue-600 hover:text-blue-900 mr-4">
                                      <PencilIcon className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDelete("specializePricing", rule.id)}
                                      className="text-red-600 hover:text-red-900"
                                    >
                                      <TrashIcon className="h-4 w-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="lg:hidden space-y-4">
                          {specialPricingRules.map((rule) => (
                            <div key={rule.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h3 className="text-sm font-medium text-gray-900">{getChildServiceName(rule.service.parent_id ?? "")}</h3>
                                  <p className="text-xs text-gray-500">{getSpecialServiceName(rule.service_id)}</p>
                                </div>
                                <div className="flex space-x-2">
                                  <button onClick={() => handleSpecialEdit(rule)} className="text-blue-600 hover:text-blue-900">
                                    <PencilIcon className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete("specializePricing", rule.id)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <div className="flex items-center text-gray-500 mb-1">
                                    <HomeIcon className="h-3 w-3 mr-1" />
                                    Name
                                  </div>
                                  <div className="text-gray-900">{rule.name}</div>
                                </div>
                                <div>
                                  <div className="flex items-center text-gray-500 mb-1">
                                    <CurrencyDollarIcon className="h-3 w-3 mr-1" />
                                    Price
                                  </div>
                                  <div className="text-gray-900 font-medium">
                                    {rule.price_per_unit} {rule.currency}
                                  </div>
                                </div>
                              </div>

                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="flex justify-between text-xs text-gray-500">
                                  <span className="flex items-center">
                                    <UsersIcon className="h-3 w-3 mr-1" />
                                    {rule.service?.no_of_cleaners} cleaners
                                  </span>
                                  <span>{rule.service?.cleaning_supply_included ? "Supplies included" : "No supplies"}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Tab.Panel>

              {/* Special Packages */}
              <Tab.Panel>
                {/* Special Packages */}
                <div className="bg-white rounded-lg overflow-hidden">
                  <div className="px-6 py-4 border-b flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Service Packages</h2>
                      <p className="text-sm text-gray-600">Create bundled service packages with special pricing</p>
                    </div>
                    <button
                      onClick={() => {
                        resetForms()
                        setIsPackageModalOpen(true)
                      }}
                      className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Package
                    </button>
                  </div>

                  <div className="p-6">
                    {packages.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <TagIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No packages found</h3>
                        <p className="text-gray-600">Create your first service package to get started.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {packages.map((pkg) => (
                          <div key={pkg.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">{pkg.name}</h3>
                                <p className="text-sm text-gray-500">{pkg.description}</p>
                              </div>
                              <div className="flex space-x-1">
                                <button onClick={() => handleEditPackage(pkg)} className="text-blue-600 hover:text-blue-900">
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button onClick={() => handleDelete("packagePricing", pkg.id)} className="text-red-600 hover:text-red-900">
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Services</label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {pkg.services.map((serviceId) => (
                                    <span
                                      key={serviceId}
                                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                    >
                                      {getServiceName(serviceId)}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Residence Type
                                  </label>
                                  <div className="text-sm text-gray-900">{getResidenceTypeName(pkg.residenceTypeId)}</div>
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Frequency
                                  </label>
                                  <div className="text-sm text-gray-900">{getFrequencyName(pkg.frequency)}</div>
                                </div>
                              </div>

                              <div className="border-t pt-3">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="text-2xl font-bold text-gray-900">${pkg.finalPrice}</div>
                                    {pkg.discountPercentage > 0 && (
                                      <div className="text-sm text-gray-500">
                                        <span className="line-through">${pkg.originalPrice}</span>
                                        <span className="text-green-600 ml-2">Save {pkg.discountPercentage}%</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <div className="text-xs text-gray-500">Total Savings</div>
                                    <div className="text-sm font-medium text-green-600">
                                      ${(pkg.originalPrice - pkg.finalPrice).toFixed(2)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>

      {/* Pricing Modal */}
      <Transition appear show={isPricingModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsPricingModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500/40 bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                    {editingPricing ? "Edit Pricing Rule" : "Add Pricing Rule"}
                  </Dialog.Title>

                  <div className="space-y-4">
                    {/* Parent Service Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Parent Service</label>
                      <select
                        value={pricingForm.parent_id}
                        onChange={(e) => {
                          const parentId = e.target.value;
                          if (parentId) {
                            fetchSubServices(parentId);
                            setPricingForm((prev) => ({ ...prev, parent_id: parentId, service_id: "" }));
                          }
                        }}
                        className="w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition"
                      >
                        <option value="">Select parent service</option>
                        {parentServices.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.name}
                          </option>
                        ))}
                      </select>

                    </div>

                    {/* Sub Service Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sub Service</label>
                      <select
                        value={pricingForm.service_id}
                        onChange={(e) => setPricingForm((prev) => ({ ...prev, service_id: e.target.value }))}
                        disabled={subServices.length === 0}
                        className="w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition disabled:bg-gray-100"
                      >
                        <option value="">
                          {loadingSubServices
                            ? "Loading..."
                            : subServices.length === 0
                            ? "Select parent service first"
                            : "Select sub service"}
                        </option>
                        {subServices.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.name}
                          </option>
                        ))}
                      </select>

                    </div>

                    {/* Residence Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Residence Type</label>
                      <select
                        value={pricingForm.residence_type_id || ""}
                        onChange={(e) => setPricingForm((prev) => ({ ...prev, residence_type_id: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition"
                      >
                        <option value="">Select residence type</option>
                        {residenceTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.type}
                          </option>
                        ))}
                      </select>

                    </div>

                    {/* Frequency */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                      <select
                        value={pricingForm.frequency}
                        onChange={(e) => setPricingForm((prev) => ({ ...prev, frequency: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition"
                      >
                        <option value="">Select frequency</option>
                        {FREQUENCIES.map((freq) => (
                          <option key={freq.value} value={freq.value}>
                            {freq.label}
                          </option>
                        ))}
                      </select>

                    </div>

                    {/* Duration */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration Value</label>
                        <input
                          type="number"
                          value={pricingForm.duration_value}
                          onChange={(e) =>
                            setPricingForm((prev) => ({
                              ...prev,
                              duration_value: Number.parseInt(e.target.value) || 0,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="270"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration Unit</label>
                        <select
                          value={pricingForm.duration_unit}
                          onChange={(e) => setPricingForm((prev) => ({ ...prev, duration_unit: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition"
                        >
                          <option value="">Select unit</option>
                          {DURATION_UNITS.map((unit) => (
                            <option key={unit.value} value={unit.value}>
                              {unit.label}
                            </option>
                          ))}
                        </select>

                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Unit Amount</label>
                        <input
                          type="number"
                          value={pricingForm.unit_amount}
                          onChange={(e) => setPricingForm((prev) => ({ ...prev, unit_amount: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="449.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                        <select
                          value={pricingForm.currency}
                          onChange={(e) => setPricingForm((prev) => ({ ...prev, currency: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition"
                        >
                          <option value="">Select currency</option>
                          {CURRENCIES.map((currency) => (
                            <option key={currency.value} value={currency.value}>
                              {currency.label}
                            </option>
                          ))}
                        </select>

                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Services</label>
                        <input
                          type="number"
                          value={pricingForm.total_services}
                          onChange={(e) =>
                            setPricingForm((prev) => ({
                              ...prev,
                              total_services: Number.parseInt(e.target.value) || 1,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="1"
                          min="1"
                        />
                      </div>
                    </div>

                    {/* Total Amount Preview */}
                    {pricingForm.unit_amount && (
                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="text-sm text-gray-600">Total Amount Preview:</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {pricingForm.total_amount} {pricingForm.currency}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsPricingModalOpen(false)}
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {editingPricing ? "Update" : "Add"}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Specialize Pricing Modal */}
      <Transition appear show={isSpecialPricingModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsSpecialPricingModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500/40 bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                    {editingSpecialPricing ? "Edit Specialize Services Pricing Rule" : "Add Specialize Services Pricing Rule"}
                  </Dialog.Title>

                  <div className="space-y-4">
                    {/* Sub Service Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sub Service</label>
                      <select
                        value={specialPricingForm.service_id}
                        onChange={(e) => setSpecialPricingForm((prev) => ({ ...prev, service_id: e.target.value }))}
                        disabled={subServices.length === 0}
                        className="w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition"
                      >
                        <option value="">
                          {loadingSubServices
                            ? "Loading..."
                            : "Select sub service"}
                        </option>
                        {subServices.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.name}
                          </option>
                        ))}
                      </select>

                    </div>

                    {/* Category and Sub Category */}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                          value={specialPricingForm.category || "sofa"}
                          onChange={(e) => setSpecialPricingForm((prev) => ({ ...prev, category: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition"
                        >
                          <option value="">Select Category</option>
                          {CATEGORIES.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>

                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sub Category</label>
                        <input
                          type="text"
                          value={specialPricingForm.sub_category}
                          onChange={(e) =>
                            setSpecialPricingForm((prev) => ({
                              ...prev,
                              sub_category: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="270"
                          min="0"
                        />
                      </div>
                    </div>

                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={specialPricingForm.name}
                        onChange={(e) =>
                          setSpecialPricingForm((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="270"
                        min="0"
                      />
                    </div>

                    {/* Pricing */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Unit Amount</label>
                        <input
                          type="number"
                          value={specialPricingForm.price_per_unit}
                          onChange={(e) => setSpecialPricingForm((prev) => ({ ...prev, price_per_unit: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="449.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                        <select
                          value={specialPricingForm.currency}
                          onChange={(e) => setSpecialPricingForm((prev) => ({ ...prev, currency: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition"
                        >
                          <option value="">Select currency</option>
                          {CURRENCIES.map((currency) => (
                            <option key={currency.value} value={currency.value}>
                              {currency.label}
                            </option>
                          ))}
                        </select>

                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsSpecialPricingModalOpen(false)}
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSpecializeSubmit}
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {editingSpecialPricing ? "Update" : "Add"}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Delete Confirmation Modal */}
      <Transition appear show={deleteConfirmOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setDeleteConfirmOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500/40 bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Confirm Delete
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this pricing rule? This action cannot be undone.
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmOpen(false)}
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={confirmDelete}
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}
