"use client"

import { useState, useEffect, Fragment, startTransition } from "react"
import { Dialog, Transition } from "@headlessui/react"
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
import PricingAction from "@/actions/pricing"
import { getPricings } from "@/lib/service/pricing"
import ResidenceAction from "@/actions/residence"
import ServicesAction from "@/actions/service-action"
import { fetchChildServices, fetchServices } from "@/lib/service/service"

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

interface ParentService {
  id: string
  name: string
  subServices: Service[]
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

export default function PricingManagementRedesigned() {
  // State
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([])
  const [parentServices, setParentServices] = useState<ParentService[]>([])
  const [childServices, setChildServices] = useState<Service[]>([])
  const [residenceTypes, setResidenceTypes] = useState<ResidenceType[]>([])
  const [loading, setLoading] = useState(true)

  // Modal states
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false)
  const [editingPricing, setEditingPricing] = useState<PricingRule | null>(null)

  // Form state
  const [pricingForm, setPricingForm] = useState({
    service_id: "",
    residence_type_id: "",
    frequency: "",
    duration_value: 0,
    duration_unit: "min",
    unit_amount: "",
    currency: "QAR",
    total_services: 1,
  })

  // Filters
  const [filters, setFilters] = useState({
    parentServiceId: "",
    residenceTypeId: "",
    frequency: "",
  })

  // Delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)

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
            debugger;
            setLoading(false);
          }
        };

        loadSubServices();
      });
    }, [parentServices]);


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
  const resetForm = () => {
    setPricingForm({
      service_id: "",
      residence_type_id: "",
      frequency: "",
      duration_value: 0,
      duration_unit: "min",
      unit_amount: "",
      currency: "QAR",
      total_services: 1,
    })
    setSubServices([])
    setEditingPricing(null)
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

  // Filter pricing rules
  const filteredPricingRules = pricingRules.filter((rule) => {
    if (filters.parentServiceId) {
      debugger
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

  // CRUD operations
  const handleSubmit = async () => {
    try {
      if (
        !pricingForm.service_id ||
        !pricingForm.residence_type_id ||
        !pricingForm.frequency ||
        !pricingForm.unit_amount
      ) {
        toast.error("All fields are required")
        return
      }

      const totalAmount = calculateTotalAmount()
      const payload = {
        ...pricingForm,
        total_amount: totalAmount,
        unit_amount: Number.parseFloat(pricingForm.unit_amount).toFixed(2),
      }

      let response
      if (editingPricing) {
        response = await fetch(`/api/pricing/${editingPricing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      } else {
        response = await fetch("/api/pricing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      }

      if (response.ok) {
        const result = await response.json()
        if (editingPricing) {
          setPricingRules((prev) => prev.map((rule) => (rule.id === editingPricing.id ? result : rule)))
          toast.success("Pricing updated successfully")
        } else {
          setPricingRules((prev) => [...prev, result])
          toast.success("Pricing added successfully")
        }
        setIsPricingModalOpen(false)
        resetForm()
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to save pricing")
      }
    } catch (error) {
      console.error("Error saving pricing:", error)
      toast.error("Failed to save pricing")
    }
  }

  const handleEdit = (pricing: PricingRule) => {
    setEditingPricing(pricing)
    setPricingForm({
      service_id: pricing.service_id,
      residence_type_id: pricing.residence_type_id,
      frequency: pricing.frequency,
      duration_value: pricing.duration_value,
      duration_unit: pricing.duration_unit,
      unit_amount: pricing.unit_amount,
      currency: pricing.currency,
      total_services: pricing.total_services,
    })

    // Fetch sub-services for the parent service
    const parentService = parentServices?.find((p) => p.subServices?.some((sub) => sub.id === pricing.service_id))
    if (parentService) {
      fetchSubServices(parentService.id)
    }

    setIsPricingModalOpen(true)
  }

  const handleDelete = async (id: string) => {
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
    setDeleteConfirmOpen(false)
    setItemToDelete(null)
  }

  const confirmDelete = () => {
    if (itemToDelete) {
      handleDelete(itemToDelete)
    }
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

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6 mb-6">
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

        {/* Pricing Rules */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="bg-gray-50 px-4 md:px-6 py-4 border-b flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Pricing Rules</h2>
              <p className="text-sm text-gray-600">
                Manage pricing for services across different residence types and frequencies
              </p>
            </div>
            <button
              onClick={() => {
                resetForm()
                setIsPricingModalOpen(true)
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Pricing Rule
            </button>
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
                              onClick={() => {
                                setItemToDelete(rule.id)
                                setDeleteConfirmOpen(true)
                              }}
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
                            onClick={() => {
                              setItemToDelete(rule.id)
                              setDeleteConfirmOpen(true)
                            }}
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
                        value={
                          parentServices?.find((p) => p.subServices?.some((sub) => sub.id === pricingForm.service_id))?.id || ""
                        }
                        onChange={(e) => {
                          const parentId = e.target.value;
                          if (parentId) {
                            fetchSubServices(parentId);
                            setPricingForm((prev) => ({ ...prev, service_id: "" }));
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
                          {calculateTotalAmount()} {pricingForm.currency}
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
