"use client"

import { useState } from "react"
import { Tab } from "@headlessui/react"
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  HomeIcon,
  WrenchIcon,
} from "@heroicons/react/24/outline"
import toast from "react-hot-toast"

// Types
interface Area {
  id: string
  name: string
}

interface District {
  id: string
  name: string
  areaId: string
}

interface Property {
  id: string
  name: string
  districtId: string
  address: string
}

interface ResidenceType {
  id: string
  name: string
  description: string
}

interface Service {
  id: string
  name: string
  description: string
  subServices: SubService[]
}

interface SubService {
  id: string
  name: string
  serviceId: string
  description: string
}

// Dummy Data
const initialAreas: Area[] = [
  { id: "a1", name: "Doha City" },
  { id: "a2", name: "The Pearl Island" },
  { id: "a3", name: "Lusail" },
]

const initialDistricts: District[] = [
  { id: "d1", name: "West Bay", areaId: "a1" },
  { id: "d2", name: "Katara", areaId: "a1" },
  { id: "d3", name: "Al Sadd", areaId: "a1" },
  { id: "d4", name: "Abraj Quartier", areaId: "a2" },
  { id: "d5", name: "Porto Arabia", areaId: "a2" },
  { id: "d6", name: "Viva Bahriya", areaId: "a2" },
  { id: "d7", name: "Fox Hills", areaId: "a3" },
  { id: "d8", name: "Marina", areaId: "a3" },
  { id: "d9", name: "Lusail Waterfront", areaId: "a3" },
]

const initialProperties: Property[] = [
  { id: "p1", name: "Burj Al Mana", districtId: "d1", address: "123 Main St" },
  { id: "p2", name: "Al Gasssar Resort", districtId: "d2", address: "789 Business Rd" },
  { id: "p3", name: "JMJ Residence", districtId: "d3", address: "456 Park Ave" },
  { id: "p4", name: "Tower 1", districtId: "d4", address: "101 Sunset Blvd" },
  { id: "p5", name: "Tower 12", districtId: "d5", address: "101 Sunset Blvd" },
  { id: "p6", name: "Shark Tower", districtId: "d6", address: "101 Sunset Blvd" },
  { id: "p7", name: "Al Jasra 1", districtId: "d7", address: "101 Sunset Blvd" },
  { id: "p8", name: "Al Jasra 15", districtId: "d8", address: "101 Sunset Blvd" },
  { id: "p9", name: "The Seef", districtId: "d9", address: "101 Sunset Blvd" },
]

const initialResidenceTypes: ResidenceType[] = [
  { id: "rt1", name: "1BHK", description: "One Bedroom Hall Kitchen" },
  { id: "rt2", name: "2BHK", description: "Two Bedroom Hall Kitchen" },
  { id: "rt3", name: "3BHK", description: "Three Bedroom Hall Kitchen" },
  { id: "rt4", name: "Studio", description: "Studio Apartment" },
]

const initialServices: Service[] = [
  {
    id: "s1",
    name: "Residential Cleaning",
    description: "Standard cleaning service",
    subServices: [
      { id: "ss1", name: "Regular Cleaning", serviceId: "s1", description: "Dust removal from surfaces" },
      { id: "ss2", name: "Deep Cleaning", serviceId: "s1", description: "Floor vacuuming" },
      { id: "ss3", name: "Specialized Cleaning", serviceId: "s1", description: "Floor vacuuming" },
    ],
  },
  {
    id: "s2",
    name: "Deep Cleaning",
    description: "Thorough cleaning service",
    subServices: [
      { id: "ss3", name: "Kitchen Deep Clean", serviceId: "s2", description: "Deep cleaning of kitchen" },
      { id: "ss4", name: "Bathroom Deep Clean", serviceId: "s2", description: "Deep cleaning of bathrooms" },
    ],
  },
  {
    id: "s3",
    name: "Special Cleaning",
    description: "Specialized cleaning services",
    subServices: [
      { id: "ss5", name: "Window Cleaning", serviceId: "s3", description: "Cleaning of windows" },
      { id: "ss6", name: "Carpet Cleaning", serviceId: "s3", description: "Deep cleaning of carpets" },
    ],
  },
]

export default function ProjectManagement() {
  // State
  const [areas, setAreas] = useState<Area[]>(initialAreas)
  const [districts, setDistricts] = useState<District[]>(initialDistricts)
  const [properties, setProperties] = useState<Property[]>(initialProperties)
  const [residenceTypes, setResidenceTypes] = useState<ResidenceType[]>(initialResidenceTypes)
  const [services, setServices] = useState<Service[]>(initialServices)

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<string>("")
  const [editingItem, setEditingItem] = useState<any>(null)

  // Form states
  const [formData, setFormData] = useState<any>({})

  // Delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ type: string; id: string } | null>(null)

  // Helper functions
  const resetForm = () => {
    setFormData({})
    setEditingItem(null)
  }

  const getAreaName = (areaId: string) => {
    const area = areas.find((a) => a.id === areaId)
    return area ? area.name : "Unknown Area"
  }

  const getDistrictName = (districtId: string) => {
    const district = districts.find((d) => d.id === districtId)
    return district ? district.name : "Unknown District"
  }

  const openModal = (type: string, item?: any) => {
    setModalType(type)
    setEditingItem(item)
    if (item) {
      setFormData({ ...item })
    } else {
      resetForm()
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    resetForm()
  }

  const handleSubmit = () => {
    switch (modalType) {
      case "area":
        if (!formData.name?.trim()) {
          toast.error("Area name is required")
          return
        }
        if (editingItem) {
          setAreas(areas.map((area) => (area.id === editingItem.id ? { ...area, ...formData } : area)))
          toast.success("Area updated successfully")
        } else {
          const newArea = { id: `a${Date.now()}`, ...formData }
          setAreas([...areas, newArea])
          toast.success("Area added successfully")
        }
        break

      case "district":
        if (!formData.name?.trim() || !formData.areaId) {
          toast.error("District name and area are required")
          return
        }
        if (editingItem) {
          setDistricts(
            districts.map((district) => (district.id === editingItem.id ? { ...district, ...formData } : district)),
          )
          toast.success("District updated successfully")
        } else {
          const newDistrict = { id: `d${Date.now()}`, ...formData }
          setDistricts([...districts, newDistrict])
          toast.success("District added successfully")
        }
        break

      case "property":
        if (!formData.name?.trim() || !formData.districtId || !formData.address?.trim()) {
          toast.error("Property name, district, and address are required")
          return
        }
        if (editingItem) {
          setProperties(
            properties.map((property) => (property.id === editingItem.id ? { ...property, ...formData } : property)),
          )
          toast.success("Property updated successfully")
        } else {
          const newProperty = { id: `p${Date.now()}`, ...formData }
          setProperties([...properties, newProperty])
          toast.success("Property added successfully")
        }
        break

      case "residenceType":
        if (!formData.name?.trim()) {
          toast.error("Residence type name is required")
          return
        }
        if (editingItem) {
          setResidenceTypes(residenceTypes.map((rt) => (rt.id === editingItem.id ? { ...rt, ...formData } : rt)))
          toast.success("Residence type updated successfully")
        } else {
          const newResidenceType = { id: `rt${Date.now()}`, ...formData }
          setResidenceTypes([...residenceTypes, newResidenceType])
          toast.success("Residence type added successfully")
        }
        break

      case "service":
        if (!formData.name?.trim()) {
          toast.error("Service name is required")
          return
        }
        if (editingItem) {
          setServices(
            services.map((service) => (service.id === editingItem.id ? { ...service, ...formData } : service)),
          )
          toast.success("Service updated successfully")
        } else {
          const newService = { id: `s${Date.now()}`, ...formData, subServices: [] }
          setServices([...services, newService])
          toast.success("Service added successfully")
        }
        break

      case "subService":
        if (!formData.name?.trim() || !formData.serviceId) {
          toast.error("Sub-service name and parent service are required")
          return
        }
        if (editingItem) {
          const updatedServices = services.map((service) => {
            if (service.id === formData.serviceId) {
              const updatedSubServices = service.subServices.map((subService) =>
                subService.id === editingItem.id ? { ...subService, ...formData } : subService,
              )
              return { ...service, subServices: updatedSubServices }
            }
            return service
          })
          setServices(updatedServices)
          toast.success("Sub-service updated successfully")
        } else {
          const newSubService = { id: `ss${Date.now()}`, ...formData }
          const updatedServices = services.map((service) =>
            service.id === formData.serviceId
              ? { ...service, subServices: [...service.subServices, newSubService] }
              : service,
          )
          setServices(updatedServices)
          toast.success("Sub-service added successfully")
        }
        break
    }
    closeModal()
  }

  const handleDelete = (type: string, id: string) => {
    setItemToDelete({ type, id })
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = () => {
    if (!itemToDelete) return

    const { type, id } = itemToDelete

    switch (type) {
      case "area":
        const hasDistricts = districts.some((district) => district.areaId === id)
        if (hasDistricts) {
          toast.error("Cannot delete area with associated districts")
          setDeleteConfirmOpen(false)
          setItemToDelete(null)
          return
        }
        setAreas(areas.filter((area) => area.id !== id))
        toast.success("Area deleted successfully")
        break
      case "district":
        const hasProperties = properties.some((property) => property.districtId === id)
        if (hasProperties) {
          toast.error("Cannot delete district with associated properties")
          setDeleteConfirmOpen(false)
          setItemToDelete(null)
          return
        }
        setDistricts(districts.filter((district) => district.id !== id))
        toast.success("District deleted successfully")
        break
      case "property":
        setProperties(properties.filter((property) => property.id !== id))
        toast.success("Property deleted successfully")
        break
      case "residenceType":
        setResidenceTypes(residenceTypes.filter((rt) => rt.id !== id))
        toast.success("Residence type deleted successfully")
        break
      case "service":
        setServices(services.filter((service) => service.id !== id))
        toast.success("Service deleted successfully")
        break
      case "subService":
        const [serviceId, subServiceId] = id.split(":")
        const updatedServices = services.map((service) =>
          service.id === serviceId
            ? { ...service, subServices: service.subServices.filter((ss) => ss.id !== subServiceId) }
            : service,
        )
        setServices(updatedServices)
        toast.success("Sub-service deleted successfully")
        break
    }

    setDeleteConfirmOpen(false)
    setItemToDelete(null)
  }

  const renderModal = () => {
    const getTitle = () => {
      const action = editingItem ? "Edit" : "Add"
      switch (modalType) {
        case "area":
          return `${action} Area`
        case "district":
          return `${action} District`
        case "property":
          return `${action} Property`
        case "residenceType":
          return `${action} Residence Type`
        case "service":
          return `${action} Service`
        case "subService":
          return `${action} Sub-Service`
        default:
          return ""
      }
    }

    const renderFormFields = () => {
      switch (modalType) {
        case "area":
          return (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Area Name</label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter area name"
              />
            </div>
          )

        case "district":
          return (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District Name</label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter district name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                <select
                  name="area"
                  value={formData.areaId || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      areaId: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select an area</option>
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>  
              </div>
            </>
          )

        case "property":
          return (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Name</label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter property name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                <select
                  name="district"
                  value={formData.districtId || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      districtId: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a district</option>
                  {districts.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name} ({getAreaName(district.areaId)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address || ""}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter property address"
                />
              </div>
            </>
          )

        case "residenceType":
          return (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Residence Type Name</label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter residence type name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter description"
                  rows={3}
                />
              </div>
            </>
          )

        case "service":
          return (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter service name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter description"
                  rows={3}
                />
              </div>
            </>
          )

        case "subService":
          return (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Service Name</label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter sub-service name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Service</label>
                <select
                  name="service"
                  value={formData.serviceId || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      serviceId: e.target.value,
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a service</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter description"
                  rows={3}
                />
              </div>
            </>
          )

        default:
          return null
      }
    }

    return (
      <>
        {isModalOpen && (
          <div className="fixed inset-0 z-10 flex items-center justify-center p-4 bg-gray-500/40">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                {getTitle()}
              </h3>

              <div className="space-y-4">{renderFormFields()}</div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {editingItem ? "Update" : "Add"}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
          <p className="text-gray-600 mt-2">Manage areas, districts, properties, residence types, and services</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <Tab.Group>
            <Tab.List className="flex bg-gray-100 border-b">
              {[
                { name: "Areas", icon: MapPinIcon },
                { name: "Districts", icon: MapPinIcon },
                { name: "Properties", icon: BuildingOfficeIcon },
                { name: "Residence Types", icon: HomeIcon },
                { name: "Services", icon: WrenchIcon },
              ].map((tab) => (
                <Tab
                  key={tab.name}
                  className={({ selected }) =>
                    `py-3 px-6 text-sm font-medium focus:outline-none ${
                      selected
                        ? "text-blue-700 border-b-2 border-blue-700 bg-white"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`
                  }
                >
                  <div className="flex items-center">
                    <tab.icon className="h-5 w-5 mr-2" />
                    {tab.name}
                  </div>
                </Tab>
              ))}
            </Tab.List>

            <Tab.Panels>
              {/* Areas Panel */}
              <Tab.Panel>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Areas</h2>
                    <button
                      onClick={() => openModal("area")}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Area
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Districts
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {areas.map((area) => (
                          <tr key={area.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{area.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {districts.filter((d) => d.areaId === area.id).length} districts
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => openModal("area", area)}
                                className="text-blue-600 hover:text-blue-900 mr-4"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete("area", area.id)}
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
                </div>
              </Tab.Panel>

              {/* Districts Panel */}
              <Tab.Panel>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Districts</h2>
                    <button
                      onClick={() => openModal("district")}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add District
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Area
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Properties
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {districts.map((district) => (
                          <tr key={district.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{district.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{getAreaName(district.areaId)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {properties.filter((p) => p.districtId === district.id).length} properties
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => openModal("district", district)}
                                className="text-blue-600 hover:text-blue-900 mr-4"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete("district", district.id)}
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
                </div>
              </Tab.Panel>

              {/* Properties Panel */}
              <Tab.Panel>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Properties</h2>
                    <button
                      onClick={() => openModal("property")}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Property
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            District
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Area
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Address
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {properties.map((property) => {
                          const district = districts.find((d) => d.id === property.districtId)
                          const areaId = district ? district.areaId : ""
                          return (
                            <tr key={property.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{property.name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{getDistrictName(property.districtId)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{getAreaName(areaId)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{property.address}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => openModal("property", property)}
                                  className="text-blue-600 hover:text-blue-900 mr-4"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete("property", property.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Tab.Panel>

              {/* Residence Types Panel */}
              <Tab.Panel>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Residence Types</h2>
                    <button
                      onClick={() => openModal("residenceType")}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Residence Type
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {residenceTypes.map((rt) => (
                          <tr key={rt.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{rt.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{rt.description}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => openModal("residenceType", rt)}
                                className="text-blue-600 hover:text-blue-900 mr-4"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete("residenceType", rt.id)}
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
                </div>
              </Tab.Panel>

              {/* Services Panel */}
              <Tab.Panel>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Services</h2>
                    <button
                      onClick={() => openModal("service")}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Service
                    </button>
                  </div>

                  <div className="space-y-6">
                    {services.map((service) => (
                      <div key={service.id} className="bg-white border rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">{service.name}</h3>
                            <p className="text-sm text-gray-500">{service.description}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openModal("subService", { serviceId: service.id })}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <PlusIcon className="h-3 w-3 mr-1" />
                              Add Sub-Service
                            </button>
                            <button
                              onClick={() => openModal("service", service)}
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <PencilIcon className="h-3 w-3 mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete("service", service.id)}
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-red-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <TrashIcon className="h-3 w-3 mr-1" />
                              Delete
                            </button>
                          </div>
                        </div>

                        {service.subServices.length > 0 && (
                          <div className="px-6 py-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Sub-Services</h4>
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Description
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Actions
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {service.subServices.map((subService) => (
                                    <tr key={subService.id} className="hover:bg-gray-50">
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{subService.name}</div>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{subService.description}</div>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                          onClick={() => openModal("subService", subService)}
                                          className="text-blue-600 hover:text-blue-900 mr-4"
                                        >
                                          <PencilIcon className="h-4 w-4" />
                                        </button>
                                        <button
                                          onClick={() => handleDelete("subService", `${service.id}:${subService.id}`)}
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
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>

      {/* Modal */}
      {renderModal()}

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
