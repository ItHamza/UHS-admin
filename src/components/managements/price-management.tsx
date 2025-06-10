"use client"

import { useState } from "react"
import { PlusIcon, PencilIcon, TrashIcon, TagIcon } from "@heroicons/react/24/outline"
import toast from "react-hot-toast"

// Types
interface Service {
  id: string
  name: string
}

interface ResidenceType {
  id: string
  name: string
}

interface Frequency {
  id: string
  name: string
  description: string
}

interface PricingRule {
  id: string
  serviceId: string
  residenceTypeId: string
  frequencyId: string
  price: number
  discountPercentage: number
  finalPrice: number
}

interface Package {
  id: string
  name: string
  description: string
  services: string[]
  frequencyId: string
  residenceTypeId: string
  originalPrice: number
  discountPercentage: number
  finalPrice: number
}

// Dummy Data
const services: Service[] = [
  { id: "s1", name: "Regular Cleaning" },
  { id: "s2", name: "Deep Cleaning" },
  { id: "s3", name: "Special Cleaning" },
  { id: "s4", name: "Window Cleaning" },
  { id: "s5", name: "Carpet Cleaning" },
]

const residenceTypes: ResidenceType[] = [
  { id: "rt1", name: "1BHK" },
  { id: "rt2", name: "2BHK" },
  { id: "rt3", name: "3BHK" },
  { id: "rt4", name: "Studio" },
]

const frequencies: Frequency[] = [
  { id: "f1", name: "One Time", description: "Single service booking" },
  { id: "f2", name: "Weekly", description: "Once per week" },
  { id: "f3", name: "Bi-Weekly", description: "Every two weeks" },
  { id: "f4", name: "Monthly", description: "Once per month" },
  { id: "f5", name: "Quarterly", description: "Every three months" },
]

const initialPricingRules: PricingRule[] = [
  {
    id: "pr1",
    serviceId: "s1",
    residenceTypeId: "rt1",
    frequencyId: "f1",
    price: 50,
    discountPercentage: 0,
    finalPrice: 50,
  },
  {
    id: "pr2",
    serviceId: "s1",
    residenceTypeId: "rt1",
    frequencyId: "f2",
    price: 50,
    discountPercentage: 10,
    finalPrice: 45,
  },
  {
    id: "pr3",
    serviceId: "s1",
    residenceTypeId: "rt1",
    frequencyId: "f3",
    price: 50,
    discountPercentage: 5,
    finalPrice: 47.5,
  },
  {
    id: "pr4",
    serviceId: "s1",
    residenceTypeId: "rt2",
    frequencyId: "f1",
    price: 75,
    discountPercentage: 0,
    finalPrice: 75,
  },
  {
    id: "pr5",
    serviceId: "s1",
    residenceTypeId: "rt2",
    frequencyId: "f2",
    price: 75,
    discountPercentage: 15,
    finalPrice: 63.75,
  },
  {
    id: "pr6",
    serviceId: "s2",
    residenceTypeId: "rt1",
    frequencyId: "f1",
    price: 100,
    discountPercentage: 0,
    finalPrice: 100,
  },
  {
    id: "pr7",
    serviceId: "s2",
    residenceTypeId: "rt1",
    frequencyId: "f2",
    price: 100,
    discountPercentage: 20,
    finalPrice: 80,
  },
]

const initialPackages: Package[] = [
  {
    id: "pkg1",
    name: "Complete Home Package",
    description: "Regular + Deep cleaning combo",
    services: ["s1", "s2"],
    frequencyId: "f2",
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
    frequencyId: "f3",
    residenceTypeId: "rt3",
    originalPrice: 300,
    discountPercentage: 30,
    finalPrice: 210,
  },
]

export default function PricingManagement() {
  // State
  const [pricingRules, setPricingRules] = useState<PricingRule[]>(initialPricingRules)
  const [packages, setPackages] = useState<Package[]>(initialPackages)

  // Modal states
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false)
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false)
  const [editingPricing, setEditingPricing] = useState<PricingRule | null>(null)
  const [editingPackage, setEditingPackage] = useState<Package | null>(null)

  // Form states
  const [pricingForm, setPricingForm] = useState({
    serviceId: "",
    residenceTypeId: "",
    frequencyId: "",
    price: 0,
    discountPercentage: 0,
  })

  const [packageForm, setPackageForm] = useState({
    name: "",
    description: "",
    services: [] as string[],
    frequencyId: "",
    residenceTypeId: "",
    originalPrice: 0,
    discountPercentage: 0,
  })

  // Delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ type: string; id: string } | null>(null)

  // Helper functions
  const resetForms = () => {
    setPricingForm({
      serviceId: "",
      residenceTypeId: "",
      frequencyId: "",
      price: 0,
      discountPercentage: 0,
    })
    setPackageForm({
      name: "",
      description: "",
      services: [],
      frequencyId: "",
      residenceTypeId: "",
      originalPrice: 0,
      discountPercentage: 0,
    })
    setEditingPricing(null)
    setEditingPackage(null)
  }

  const getServiceName = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId)
    return service ? service.name : "Unknown Service"
  }

  const getResidenceTypeName = (residenceTypeId: string) => {
    const residenceType = residenceTypes.find((rt) => rt.id === residenceTypeId)
    return residenceType ? residenceType.name : "Unknown Type"
  }

  const getFrequencyName = (frequencyId: string) => {
    const frequency = frequencies.find((f) => f.id === frequencyId)
    return frequency ? frequency.name : "Unknown Frequency"
  }

  const calculateFinalPrice = (price: number, discountPercentage: number) => {
    return price - (price * discountPercentage) / 100
  }

  // Pricing CRUD operations
  const handleAddPricing = () => {
    if (!pricingForm.serviceId || !pricingForm.residenceTypeId || !pricingForm.frequencyId || pricingForm.price <= 0) {
      toast.error("All fields are required and price must be greater than 0")
      return
    }

    // Check for duplicate
    const exists = pricingRules.some(
      (rule) =>
        rule.serviceId === pricingForm.serviceId &&
        rule.residenceTypeId === pricingForm.residenceTypeId &&
        rule.frequencyId === pricingForm.frequencyId &&
        (!editingPricing || rule.id !== editingPricing.id),
    )

    if (exists) {
      toast.error("Pricing rule already exists for this combination")
      return
    }

    const finalPrice = calculateFinalPrice(pricingForm.price, pricingForm.discountPercentage)

    if (editingPricing) {
      setPricingRules(
        pricingRules.map((rule) =>
          rule.id === editingPricing.id
            ? {
                ...rule,
                ...pricingForm,
                finalPrice,
              }
            : rule,
        ),
      )
      toast.success("Pricing rule updated successfully")
    } else {
      const newPricingRule = {
        id: `pr${Date.now()}`,
        ...pricingForm,
        finalPrice,
      }
      setPricingRules([...pricingRules, newPricingRule])
      toast.success("Pricing rule added successfully")
    }
    setIsPricingModalOpen(false)
    resetForms()
  }

  const handleEditPricing = (pricing: PricingRule) => {
    setEditingPricing(pricing)
    setPricingForm({
      serviceId: pricing.serviceId,
      residenceTypeId: pricing.residenceTypeId,
      frequencyId: pricing.frequencyId,
      price: pricing.price,
      discountPercentage: pricing.discountPercentage,
    })
    setIsPricingModalOpen(true)
  }

  const handleDeletePricing = (pricingId: string) => {
    setItemToDelete({ type: "pricing", id: pricingId })
    setDeleteConfirmOpen(true)
  }

  // Package CRUD operations
  const handleAddPackage = () => {
    if (
      !packageForm.name.trim() ||
      packageForm.services.length === 0 ||
      !packageForm.frequencyId ||
      !packageForm.residenceTypeId ||
      packageForm.originalPrice <= 0
    ) {
      toast.error("All fields are required")
      return
    }

    const finalPrice = calculateFinalPrice(packageForm.originalPrice, packageForm.discountPercentage)

    if (editingPackage) {
      setPackages(
        packages.map((pkg) =>
          pkg.id === editingPackage.id
            ? {
                ...pkg,
                ...packageForm,
                finalPrice,
              }
            : pkg,
        ),
      )
      toast.success("Package updated successfully")
    } else {
      const newPackage = {
        id: `pkg${Date.now()}`,
        ...packageForm,
        finalPrice,
      }
      setPackages([...packages, newPackage])
      toast.success("Package added successfully")
    }
    setIsPackageModalOpen(false)
    resetForms()
  }

  const handleEditPackage = (pkg: Package) => {
    setEditingPackage(pkg)
    setPackageForm({
      name: pkg.name,
      description: pkg.description,
      services: pkg.services,
      frequencyId: pkg.frequencyId,
      residenceTypeId: pkg.residenceTypeId,
      originalPrice: pkg.originalPrice,
      discountPercentage: pkg.discountPercentage,
    })
    setIsPackageModalOpen(true)
  }

  const handleDeletePackage = (packageId: string) => {
    setItemToDelete({ type: "package", id: packageId })
    setDeleteConfirmOpen(true)
  }

  const handleServiceToggle = (serviceId: string) => {
    setPackageForm((prev) => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter((s) => s !== serviceId)
        : [...prev.services, serviceId],
    }))
  }

  // Handle delete confirmation
  const confirmDelete = () => {
    if (!itemToDelete) return

    const { type, id } = itemToDelete

    if (type === "pricing") {
      setPricingRules(pricingRules.filter((rule) => rule.id !== id))
      toast.success("Pricing rule deleted successfully")
    } else if (type === "package") {
      setPackages(packages.filter((pkg) => pkg.id !== id))
      toast.success("Package deleted successfully")
    }

    setDeleteConfirmOpen(false)
    setItemToDelete(null)
  }

  // Get pricing matrix for display
  const getPricingMatrix = () => {
    const matrix: { [key: string]: { [key: string]: PricingRule | null } } = {}

    services.forEach((service) => {
      matrix[service.id] = {}
      residenceTypes.forEach((residenceType) => {
        frequencies.forEach((frequency) => {
          const key = `${residenceType.id}-${frequency.id}`
          const rule = pricingRules.find(
            (r) =>
              r.serviceId === service.id && r.residenceTypeId === residenceType.id && r.frequencyId === frequency.id,
          )
          matrix[service.id][key] = rule || null
        })
      })
    })

    return matrix
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pricing Management</h1>
          <p className="text-gray-600 mt-2">Manage service pricing and package deals</p>
        </div>

        {/* Pricing Rules Section */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden mb-8">
          <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Service Pricing</h2>
              <p className="text-sm text-gray-600">Set prices based on service type, residence type, and frequency</p>
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

          <div className="p-6">
            {/* Pricing Matrix */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    {residenceTypes.map((residenceType) =>
                      frequencies.map((frequency) => (
                        <th
                          key={`${residenceType.id}-${frequency.id}`}
                          className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          <div>{residenceType.name}</div>
                          <div className="text-xs text-gray-400">{frequency.name}</div>
                        </th>
                      )),
                    )}
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {services.map((service) => {
                    const serviceRules = pricingRules.filter((rule) => rule.serviceId === service.id)
                    return (
                      <tr key={service.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{service.name}</div>
                        </td>
                        {residenceTypes.map((residenceType) =>
                          frequencies.map((frequency) => {
                            const rule = serviceRules.find(
                              (r) => r.residenceTypeId === residenceType.id && r.frequencyId === frequency.id,
                            )
                            return (
                              <td key={`${residenceType.id}-${frequency.id}`} className="px-3 py-4 text-center">
                                {rule ? (
                                  <div className="space-y-1">
                                    <div className="text-sm font-medium text-gray-900">${rule.finalPrice}</div>
                                    {rule.discountPercentage > 0 && (
                                      <div className="text-xs text-gray-500">
                                        <span className="line-through">${rule.price}</span>
                                        <span className="text-green-600 ml-1">-{rule.discountPercentage}%</span>
                                      </div>
                                    )}
                                    <div className="flex justify-center space-x-1">
                                      <button
                                        onClick={() => handleEditPricing(rule)}
                                        className="text-blue-600 hover:text-blue-900"
                                      >
                                        <PencilIcon className="h-3 w-3" />
                                      </button>
                                      <button
                                        onClick={() => handleDeletePricing(rule.id)}
                                        className="text-red-600 hover:text-red-900"
                                      >
                                        <TrashIcon className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-xs">Not set</span>
                                )}
                              </td>
                            )
                          }),
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => {
                              resetForms()
                              setPricingForm((prev) => ({ ...prev, serviceId: service.id }))
                              setIsPricingModalOpen(true)
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Add Pricing
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Packages Section */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Service Packages</h2>
              <p className="text-sm text-gray-600">Create bundled service packages with special pricing</p>
            </div>
            <button
              onClick={() => {
                resetForms()
                setIsPackageModalOpen(true)
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                        <button onClick={() => handleDeletePackage(pkg.id)} className="text-red-600 hover:text-red-900">
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
                          <div className="text-sm text-gray-900">{getFrequencyName(pkg.frequencyId)}</div>
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
      </div>

      {/* Pricing Modal */}
      {isPricingModalOpen && (
        <div className="relative z-10">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-gray-500/40"
            onClick={() => setIsPricingModalOpen(false)}
          />

          {/* Modal container */}
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  {editingPricing ? "Edit Pricing Rule" : "Add Pricing Rule"}
                </h3>

                <div className="space-y-4">
                  {/* Service Select */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Service
                    </label>
                    <select
                      value={pricingForm.serviceId}
                      onChange={(e) =>
                        setPricingForm({ ...pricingForm, serviceId: e.target.value })
                      }
                      className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a service</option>
                      {services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Residence Type Select */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Residence Type
                    </label>
                    <select
                      value={pricingForm.residenceTypeId}
                      onChange={(e) =>
                        setPricingForm({ ...pricingForm, residenceTypeId: e.target.value })
                      }
                      className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select residence type</option>
                      {residenceTypes.map((rt) => (
                        <option key={rt.id} value={rt.id}>
                          {rt.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Frequency Select */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frequency
                    </label>
                    <select
                      value={pricingForm.frequencyId}
                      onChange={(e) =>
                        setPricingForm({ ...pricingForm, frequencyId: e.target.value })
                      }
                      className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select frequency</option>
                      {frequencies.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price and Discount Inputs */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Base Price ($)
                      </label>
                      <input
                        type="number"
                        value={pricingForm.price}
                        onChange={(e) =>
                          setPricingForm({
                            ...pricingForm,
                            price: Number.parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Discount (%)
                      </label>
                      <input
                        type="number"
                        value={pricingForm.discountPercentage}
                        onChange={(e) =>
                          setPricingForm({
                            ...pricingForm,
                            discountPercentage: Number.parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>
                  </div>

                  {/* Final Price Preview */}
                  {pricingForm.price > 0 && (
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="text-sm text-gray-600">Final Price Preview:</div>
                      <div className="text-lg font-semibold text-gray-900">
                        ${calculateFinalPrice(pricingForm.price, pricingForm.discountPercentage).toFixed(2)}
                      </div>
                      {pricingForm.discountPercentage > 0 && (
                        <div className="text-sm text-gray-500">
                          You save: $
                          {((pricingForm.price * pricingForm.discountPercentage) / 100).toFixed(2)}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Buttons */}
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
                    onClick={handleAddPricing}
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {editingPricing ? "Update" : "Add"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Package Modal */}
      {isPackageModalOpen && (
        <div className="fixed inset-0 z-10 flex items-center justify-center p-4 bg-gray-500/40">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl text-left">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              {editingPackage ? "Edit Package" : "Add Package"}
            </h3>

            <div className="space-y-4">
              {/* Package Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
                <input
                  type="text"
                  value={packageForm.name}
                  onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter package name"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={packageForm.description}
                  onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter package description"
                  rows={3}
                />
              </div>

              {/* Services Included */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Services Included</label>
                <div className="space-y-2">
                  {services.map((service) => (
                    <div key={service.id} className="flex items-center">
                      <input
                        id={service.id}
                        type="checkbox"
                        checked={packageForm.services.includes(service.id)}
                        onChange={() => handleServiceToggle(service.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={service.id} className="ml-2 text-sm text-gray-700">
                        {service.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Residence Type and Frequency */}
              <div className="grid grid-cols-2 gap-3">
                {/* Residence Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Residence Type</label>
                  <select
                    value={packageForm.residenceTypeId}
                    onChange={(e) => setPackageForm({ ...packageForm, residenceTypeId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select type</option>
                    {residenceTypes.map((rt) => (
                      <option key={rt.id} value={rt.id}>
                        {rt.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Frequency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                  <select
                    value={packageForm.frequencyId}
                    onChange={(e) => setPackageForm({ ...packageForm, frequencyId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select frequency</option>
                    {frequencies.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price & Discount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Original Price ($)</label>
                  <input
                    type="number"
                    value={packageForm.originalPrice}
                    onChange={(e) =>
                      setPackageForm({ ...packageForm, originalPrice: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Package Discount (%)</label>
                  <input
                    type="number"
                    value={packageForm.discountPercentage}
                    onChange={(e) =>
                      setPackageForm({ ...packageForm, discountPercentage: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
              </div>

              {/* Price Preview */}
              {packageForm.originalPrice > 0 && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="text-sm text-gray-600">Package Price Preview:</div>
                  <div className="text-lg font-semibold text-gray-900">
                    ${calculateFinalPrice(packageForm.originalPrice, packageForm.discountPercentage).toFixed(2)}
                  </div>
                  {packageForm.discountPercentage > 0 && (
                    <div className="text-sm text-gray-500">
                      Total savings: $
                      {((packageForm.originalPrice * packageForm.discountPercentage) / 100).toFixed(2)}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsPackageModalOpen(false)}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddPackage}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {editingPackage ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-10 flex items-center justify-center p-4 bg-gray-500/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Confirm Delete
            </h3>

            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Are you sure you want to delete this item? This action cannot be undone.
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
          </div>
        </div>
      )}

    </div>
  )
}
