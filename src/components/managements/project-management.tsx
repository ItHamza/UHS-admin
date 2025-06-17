"use client"

import { startTransition, useEffect, useState } from "react"
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
import AreaAction, { AreaDeleteAction, AreaCreateAction, AreaUpdateAction } from "@/actions/area"
import DistrictAction, { DistrictCreateAction, DistrictUpdateAction, districtDeleteAction } from "@/actions/district"
import { PropertyAction, PropertyCreateAction, PropertyUpdateAction, PropertyDeleteAction } from "@/actions/property"
import ResidenceAction, { ResidenceCreateAction, ResidenceUpdateAction, ResidenceDeleteAction } from "@/actions/residence"
import { fetchChildServices, fetchServices } from "@/lib/service/service"
import ServicesAction, { ServiceCreateAction, ServiceDeleteAction, ServiceUpdateAction } from "@/actions/service-action"

// Types
interface Area {
  id: string
  name: string
  latitude: string
  longitude: string
}

interface District {
  id: string
  name: string
  areaId: string
  latitude: string
  longitude: string
}

interface Property {
  id: string
  name: string
  districtId: string
  latitude: string
  longitude: string
}

interface ResidenceType {
  id: string
  type: string
  description: string
}

interface Service {
  id: string
  name: string
  parent_id: string | null
  photo_url?: string
  no_of_cleaners: number
  cleaning_supply_included: boolean
  subServices: SubService[]
}

interface SubService {
  id: string
  name: string
  parent_id: string | null
  photo_url?: string
  no_of_cleaners: number
  cleaning_supply_included: boolean
  createdAt: string
  updatedAt: string
}

const TABS = [
  { name: "Areas", icon: MapPinIcon },
  { name: "Districts", icon: MapPinIcon },
  { name: "Properties", icon: BuildingOfficeIcon },
  { name: "Residence Types", icon: HomeIcon },
  { name: "Services", icon: WrenchIcon },
]

export default function ProjectManagement() {
  // State
  const [areas, setAreas] = useState<Area[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [residenceTypes, setResidenceTypes] = useState<ResidenceType[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

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

  const handleSubmit = async () => {
    switch (modalType) {
      case "area":
        if (
          !formData.name?.trim() ||
          !formData?.latitude?.toString()?.trim() ||
          !formData.longitude?.toString()?.trim()
        ) {
          toast.error("Area name, longitude and latitude are required")
          return
        }
        if (editingItem) {
          try {
            setLoading(true)
            const responseArea = await AreaUpdateAction(formData)
            setAreas(areas.map((area) => (area.id === editingItem.id ? { ...area, ...formData } : area)))
            toast.success("Area updated successfully")
          } catch (error: any) {
            console.error("Error updating area:", error)
            toast.error(error.message)
          } finally {
            setLoading(false)
          }
        } else {
          try {
            setLoading(true)
            const responseArea = await AreaCreateAction(formData)
            setAreas([...areas, responseArea])
            toast.success("Area added successfully")
          } catch (error: any) {
            console.error("Error creating area:", error)
            toast.error(error.message)
          } finally {
            setLoading(false)
          }
        }
        break

      case "district":
        if (!formData.name?.trim() || !formData.areaId || !formData?.latitude?.toString()?.trim() ||
          !formData.longitude?.toString()?.trim()) {
          toast.error("District name, latitude, longitude and area are required")
          return
        }
        if (editingItem) {
          try {
            setLoading(true)
            const responseDistrict = await DistrictUpdateAction(formData)
            setDistricts(
              districts.map((district) => (district.id === editingItem.id ? { ...district, ...formData } : district)),
            )
            toast.success("District updated successfully")
          } catch (error: any) {
            console.error("Error updating district:", error)
            toast.error(error.message)
          } finally {
            setLoading(false)
          }
        } else {
          try {
            setLoading(true)
            const responseDistrict = await DistrictCreateAction(formData)
            setDistricts([...districts, responseDistrict])
            toast.success("District added successfully")
          } catch (error: any) {
            console.error("Error creating district:", error)
            toast.error(error.message)
          } finally {
            setLoading(false)
          }
        }
        break

      case "property":
        if (!formData.name?.trim() || !formData.districtId || !formData?.latitude?.toString()?.trim() ||
          !formData.longitude?.toString()?.trim()) {
          toast.error("Property name, district, latitude and longitude are required")
          return
        }
        if (editingItem) {
          try {
            setLoading(true)
            const responseProperty = await PropertyUpdateAction(formData)
            setProperties(
              properties.map((property) => (property.id === editingItem.id ? { ...property, ...formData } : property)),
            )
            toast.success("Property updated successfully")
          } catch (error: any) {
            console.error("Error updating property:", error)
            toast.error(error.message)
          } finally {
            setLoading(false)
          }
        } else {
          try {
            setLoading(true)
            const responseProperty = await PropertyCreateAction(formData)
            setProperties([...properties, responseProperty])
            toast.success("Property added successfully")
          } catch (error: any) {
            console.error("Error creating property:", error)
            toast.error(error.message)
          } finally {
            setLoading(false)
          }
        }
        break

      case "residenceType":
        if (!formData.type?.trim()) {
          toast.error("Residence type name is required")
          return
        }
        if (editingItem) {
          try {
            setLoading(true)
            const responseResidence = await ResidenceUpdateAction(formData)
            setResidenceTypes(residenceTypes.map((rt) => (rt.id === editingItem.id ? { ...rt, ...formData } : rt)))
            toast.success("Residence type updated successfully")
          } catch (error: any) {
            console.error("Error updating residence type:", error)
            toast.error(error.message)
          } finally {
            setLoading(false)
          }
        } else {
          try {
            setLoading(true)
            const responseResidence = await ResidenceCreateAction(formData)
            setResidenceTypes([...residenceTypes, responseResidence])
            toast.success("Residence type added successfully")
          } catch (error: any) {
            console.error("Error creating residence type:", error)
            toast.error(error.message)
          } finally {
            setLoading(false)
          }
        }
        break

      case "service":
        if (!formData.name?.trim() || !formData.photo_url?.trim()) {
          toast.error("Service name and photo Url are required")
          return
        }
        if (editingItem) {
          try {
            setLoading(true)
            const responseService = await ServiceUpdateAction(formData)
            setServices(services.map((rt) => (rt.id === editingItem.id ? { ...rt, ...formData } : rt)))
            toast.success("Service updated successfully")
          } catch (error: any) {
            console.error("Error updating service type:", error)
            toast.error(error.message)
          } finally {
            setLoading(false)
          }
        } else {
          try {
            setLoading(true)
            const responseService = await ServiceCreateAction(formData)
            const serviceWithSubServices = { ...responseService.data, subServices: undefined };
            setServices([...services, serviceWithSubServices])
            toast.success("Service added successfully")
          } catch (error: any) {
            console.error("Error creating service:", error)
            toast.error(error.message)
          } finally {
            setLoading(false)
          }
        }
        break

      case "subService":
        if (!formData.name?.trim() || !formData.parent_id) {
          toast.error("Sub-service name and parent service are required")
          return
        }
        if (editingItem) {
          try {
            setLoading(true)
            const responseService = await ServiceUpdateAction(formData)
            const updatedServices = services.map((service) => {
            if (service.id === formData.parent_id) {
              const updatedSubServices = service.subServices.map((subService) =>
                subService.id === editingItem.id ? { ...subService, ...formData } : subService,
              )
              return { ...service, subServices: updatedSubServices }
            }
            return service
          })
            setServices(updatedServices)
            toast.success("Sub-service updated successfully")
          } catch (error: any) {
            console.error("Error updating Sub-service type:", error)
            toast.error(error.message)
          } finally {
            setLoading(false)
          }
        } else {
          try {
            setLoading(true)
            const responseService = await ServiceCreateAction(formData)

            const updatedServices = services.map((service) =>
              service.id === formData.parent_id
              ? { ...service, subServices: [...service.subServices, responseService.data] }
              : service,
            )
            setServices(updatedServices)
          
            toast.success("Sub-service added successfully")
          } catch (error: any) {
            console.error("Error creating Sub-service:", error)
            toast.error(error.message)
          } finally {
            setLoading(false)
          }
        }
        break
    }
    closeModal()
  }

  const handleDelete = (type: string, id: string) => {
    setItemToDelete({ type, id })
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
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
        try {
          setLoading(true)
          const deleteArea = await AreaDeleteAction(id)
          setAreas(areas.filter((area) => area.id !== id))
          toast.success("Area deleted successfully")
        } catch (error: any) {
          console.error("Error deleting area:", error)
          toast.error(error.message)
        } finally {
          setLoading(false)
        }
        break
      case "district":
        const hasProperties = properties.some((property) => property.districtId === id)
        if (hasProperties) {
          toast.error("Cannot delete district with associated properties")
          setDeleteConfirmOpen(false)
          setItemToDelete(null)
          return
        }
        try {
          setLoading(true)
          const deleteDistrict = await districtDeleteAction(id)
          setDistricts(districts.filter((district) => district.id !== id))
          toast.success("District deleted successfully")
        } catch (error: any) {
          console.error("Error deleting district:", error)
          toast.error(error.message)
        } finally {
          setLoading(false)
        }
        break
      case "property":
        try {
          setLoading(true)
          const deleteProperty = await PropertyDeleteAction(id)
          setProperties(properties.filter((property) => property.id !== id))
          toast.success("Property deleted successfully")
        } catch (error: any) {
          console.error("Error deleting property:", error)
          toast.error(error.message)
        } finally {
          setLoading(false)
        }
        break
      case "residenceType":
        try {
          setLoading(true)
          const deleteResidence = await ResidenceDeleteAction(id)
          setResidenceTypes(residenceTypes.filter((rt) => rt.id !== id))
          toast.success("Residence type deleted successfully")
        } catch (error: any) {
          console.error("Error deleting residence type:", error)
          toast.error(error.message)
        } finally {
          setLoading(false)
        }
        break
      case "service":
        try {
          setLoading(true)
          const deleteService = await ServiceDeleteAction(id)
          setServices(services.filter((service) => service.id !== id))
          toast.success("Service deleted successfully")
        } catch (error: any) {
          console.error("Error deleting service:", error)
          toast.error(error.message)
        } finally {
          setLoading(false)
        }
        break
      case "subService":
        const [parent_id, subServiceId] = id.split(":")
        try {
          setLoading(true)
          const deleteService = await ServiceDeleteAction(subServiceId)
          setServices(services.filter((service) => service.id !== id))
          const updatedServices = services.map((service) =>
            service.id === parent_id
              ? { ...service, subServices: service.subServices.filter((ss) => ss.id !== subServiceId) }
              : service,
            )
          setServices(updatedServices)
          toast.success("Sub-service deleted successfully")
        } catch (error: any) {
          console.error("Error deleting service:", error)
          toast.error(error.message)
        } finally {
          setLoading(false)
        }
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
            <>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area Latitude</label>
                <input
                  type="text"
                  value={formData.latitude || ""}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter area latitude"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area Longitude</label>
                <input
                  type="text"
                  value={formData.longitude || ""}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter area longitude"
                />
              </div>
            </>
          )

        case "district":
          return (
            <>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">District Latitude</label>
                <input
                  type="text"
                  value={formData.latitude || ""}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter district latitude"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District Longitude</label>
                <input
                  type="text"
                  value={formData.longitude || ""}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter district longitude"
                />
              </div>
            </>
          )

        case "property":
          return (
            <>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Latitude</label>
                <input
                  type="text"
                  value={formData.latitude || ""}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter property latitude"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Longitude</label>
                <input
                  type="text"
                  value={formData.longitude || ""}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter property longitude"
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
                  value={formData.type || ""}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Photo Url</label>
                <input
                  type="text"
                  value={formData.photo_url || ""}
                  onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter Photo Url"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of cleaners</label>
                <input
                  type="number"
                  value={formData.no_of_cleaners || 0}
                  onChange={(e) => setFormData({ ...formData, no_of_cleaners: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="2"
                  min="0" max="10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cleaning Supplies Included</label>
                <input
                  type='checkbox'
                  name='cleaning_supply_included'
                  checked={formData.cleaning_supply_included || false}
                  onChange={(e) => setFormData({ ...formData, cleaning_supply_included: e.target.value })}
                  className='rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2'
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
                  value={formData.parent_id || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      parent_id: e.target.value,
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Photo Url</label>
                <input
                  type="text"
                  value={formData.photo_url || ""}
                  onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter Photo Url"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of cleaners</label>
                <input
                  type="number"
                  value={formData.no_of_cleaners || 0}
                  onChange={(e) => setFormData({ ...formData, no_of_cleaners: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="2"
                  min="0" max="10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cleaning Supplies Included</label>
                <input
                  type='checkbox'
                  name='cleaning_supply_included'
                  checked={formData.cleaning_supply_included || false}
                  onChange={(e) => setFormData({ ...formData, cleaning_supply_included: e.target.value })}
                  className='rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2'
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
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">{getTitle()}</h3>

              <div className="space-y-4">{renderFormFields()}</div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={loading}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? "Processing..." : editingItem ? "Update" : "Add"}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  useEffect(() => {
    startTransition(async () => {
      try {
        setLoading(true)

        const area = await AreaAction()
        setAreas(area)

        const district = await DistrictAction()
        setDistricts(district)

        const property = await PropertyAction()
        setProperties(property)

        const residenceResponse = await ResidenceAction()
        setResidenceTypes(residenceResponse)

        const servicesResponse = await fetchServices()
        const servicseWithSubServices = servicesResponse.data.map((service: any) => ({
          ...service,
          subServices: undefined,
        }));
        setServices(servicseWithSubServices || [])
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load data")
      } finally {
        setLoading(false)
      }
    })
  }, [])

  useEffect(() => {
    if (!services.length || services.every((p) => p.subServices !== undefined)) return;

    startTransition(() => {
      const loadSubServices = async () => {
        try {
          const updated = await Promise.all(
            services.map(async (parent) => {
              if (parent.subServices !== undefined) return parent;

              const response = await fetchChildServices(parent.id)
              return {
                ...parent,
                subServices: response.data || [],
              }
            }),
          )
          setServices(updated)
        } catch (error) {
          console.error("Error fetching sub-services:", error)
          toast.error("Failed to load sub-services")
        }
      }

      loadSubServices()
    })
  }, [services])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
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
                                <div className="text-sm text-gray-500">{property.longitude}</div>
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
                              <div className="text-sm font-medium text-gray-900">{rt.type}</div>
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
                          </div>
                          <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                            <button
                              onClick={() => openModal("subService")}
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

                        {service.subServices?.length > 0 && (
                          <div className="px-6 py-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Sub-Services</h4>
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Name
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
            <h3 className="text-lg font-medium leading-6 text-gray-900">Confirm Delete</h3>

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
