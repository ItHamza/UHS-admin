"use client"

import React, { useState, Fragment, useEffect, startTransition } from "react"
import { Dialog, Transition } from "@headlessui/react"
import toast from "react-hot-toast"
import { PlusIcon, XMarkIcon, UsersIcon, CalendarIcon, MapPinIcon, CogIcon } from "@heroicons/react/24/outline"
import "react-datepicker/dist/react-datepicker.css"
import AreaAction from "@/actions/area"
import DistrictAction from "@/actions/district"
import { PropertyAction } from "@/actions/property"
import ResidenceAction from "@/actions/residence"
import { fetchServices, fetchChildServices } from "@/lib/service/service"
import { CreateTeamAction, CreateTeamMemberAction } from "@/actions/team"
import { TeamMembersAction } from "@/actions/users"
import { PlusCircleIcon } from "lucide-react"

interface TeamMember {
  id: string
  name: string
  email: string
  phone: string
  role: string
  isExisting: boolean
}

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
}

interface Property {
  id: string
  name: string
  districtId: string
  address: string
}

interface ResidenceType {
  id: string
  type: string
  description: string
}

interface Service {
  id: string
  name: string
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

interface User {
  id: string
  name: string
  email: string
  phone?: string
  role?: string
}

interface TeamData {
  name: string
  description?: string
  team_type: "male" | "female" | "hybrid"
  lat?: number
  lng?: number
  user_ids: string[]
  service_ids: string[]
  start_date: string
  work_start_time: string
  work_end_time: string
  break_start_time?: string
  break_end_time?: string
  off_days: string[]
  area_id?: string
  district_id?: string
  property_id?: string
  residence_type_id?: string
}

const TEAM_TYPES = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "hybrid", label: "Hybrid" },
]

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export default function TeamCreationModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [areas, setAreas] = useState<Area[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [residenceTypes, setResidenceTypes] = useState<ResidenceType[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [teamMembers, setTeamMembers] = useState<User[]>([])

  const [teamData, setTeamData] = useState<TeamData>({
    name: "",
    description: "",
    team_type: "male",
    lat: undefined,
    lng: undefined,
    user_ids: [],
    service_ids: [],
    start_date: "",
    work_start_time: "",
    work_end_time: "",
    break_start_time: "",
    break_end_time: "",
    off_days: [],
    area_id: "",
    district_id: "",
    property_id: "",
    residence_type_id: "",
  })

  const [showCreateMember, setShowCreateMember] = useState(false)
  const [newMember, setNewMember] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    role: "team_member",
  })

  // Helper functions
  const getServiceName = (serviceId: string) => {
    const parentService = services.find((s) => s.id === serviceId)
    if (parentService) return parentService.name

    for (const service of services) {
      const subService = service.subServices?.find((ss) => ss.id === serviceId)
      if (subService) return subService.name
    }
    return "Unknown Service"
  }

  // Filter functions
  const getFilteredDistricts = () => {
    return teamData.area_id ? districts.filter((d) => d.areaId === teamData.area_id) : []
  }

  const getFilteredProperties = () => {
    return teamData.district_id ? properties.filter((p) => p.districtId === teamData.district_id) : []
  }

  const getAllServices = () => {
    const allServices: { id: string; name: string; isParent: boolean }[] = []

    services.forEach((service) => {
      // Add parent service
      allServices.push({ id: service.id, name: service.name, isParent: true })

      // Add sub-services
      service.subServices?.forEach((subService) => {
        allServices.push({
          id: subService.id,
          name: `${service.name} - ${subService.name}`,
          isParent: false,
        })
      })
    })

    return allServices
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleAddExistingMember = (user: User) => {
    if (!teamData.user_ids.includes(user.id)) {
      setTeamData((prev) => ({
        ...prev,
        user_ids: [...prev.user_ids, user.id],
      }))
      toast.success(`${user.name} added to team`)
    } else {
      toast.error(`${user.name} is already in the team`)
    }
  }

  const handleCreateAndAddMember = async () => {
    if (newMember.name && newMember.email) {
      try {
        const newMemberRes = await CreateTeamMemberAction(newMember)
        setTeamMembers([...teamMembers, newMemberRes])
        setTeamData((prev) => ({
          ...prev,
          user_ids: [...prev.user_ids, newMemberRes.id],
        }))

        setNewMember({ id: "", name: "", email: "", phone: "", role: "team_member" })
        setShowCreateMember(false)
        toast.success(`${newMemberRes.name} created and added to team`)
      } catch (error: any) {
        console.error("Error creating user:", error)
        toast.error(error.message || "Failed to create user")
      }
    }
  }

  const handleRemoveMember = (userId: string) => {
    const user = teamMembers.find((u) => u.id === userId)
    setTeamData((prev) => ({
      ...prev,
      user_ids: prev.user_ids.filter((id) => id !== userId),
    }))
    if (user) {
      toast.success(`${user.name} removed from team`)
    }
  }

  const handleServiceToggle = (serviceId: string) => {
    setTeamData((prev) => ({
      ...prev,
      service_ids: prev.service_ids.includes(serviceId)
        ? prev.service_ids.filter((id) => id !== serviceId)
        : [...prev.service_ids, serviceId],
    }))
  }

  const handleDayOffToggle = (day: string) => {
    setTeamData((prev) => ({
      ...prev,
      off_days: prev.off_days.includes(day) ? prev.off_days.filter((d) => d !== day) : [...prev.off_days, day],
    }))
  }

  const resetModal = () => {
    setCurrentStep(1)
    setTeamData({
      name: "",
      description: "",
      team_type: "male",
      lat: undefined,
      lng: undefined,
      user_ids: [],
      service_ids: [],
      start_date: "",
      work_start_time: "",
      work_end_time: "",
      break_start_time: "",
      break_end_time: "",
      off_days: [],
      area_id: "",
      district_id: "",
      property_id: "",
      residence_type_id: "",
    })
    setShowCreateMember(false)
    setNewMember({ id: "", name: "", email: "", phone: "", role: "team_member" })
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)

      // Prepare data for API
      const submitData = {
        ...teamData,
        start_date: teamData.start_date,
        lat: teamData.lat || undefined,
        lng: teamData.lng || undefined,
        area_id: teamData.area_id || undefined,
        district_id: teamData.district_id || undefined,
        property_id: teamData.property_id || undefined,
        residence_type_id: teamData.residence_type_id || undefined,
        break_start_time: teamData.break_start_time || undefined,
        break_end_time: teamData.break_end_time || undefined,
      }

      const responseTeam = await CreateTeamAction(submitData)
      // setTeams([...teams, responseTeam]) // add team somewhere here
      toast.success("Team created successfully!")
      setIsOpen(false)
      resetModal()
    } catch (error: any) {
      console.error("Error creating team:", error)
      toast.error(error.message || "Failed to create team")
    } finally {
      setSubmitting(false)
    }
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8 px-4">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <React.Fragment key={index}>
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium border-2
              ${
                index + 1 === currentStep
                  ? "bg-white text-blue-700 border-white"
                  : index + 1 < currentStep
                    ? "bg-green-400 text-white border-white"
                    : "bg-blue-500 text-white border-white border-opacity-50"
              }`}
          >
            {index + 1 < currentStep ? "✓" : index + 1}
          </div>
          {index < totalSteps - 1 && (
            <div
              className={`h-1 flex-1 mx-1 ${index + 1 < currentStep ? "bg-green-400" : "bg-blue-500 bg-opacity-50"}`}
            ></div>
          )}
        </React.Fragment>
      ))}
    </div>
  )

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <UsersIcon className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Team Information</h3>
        <p className="text-sm text-gray-600">Set up your team name and type</p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-1">
            Team Name
          </label>
          <input
            id="teamName"
            type="text"
            value={teamData.name}
            onChange={(e) => setTeamData((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Enter team name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="teamDescription" className="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional)
          </label>
          <textarea
            id="teamDescription"
            value={teamData.description || ""}
            onChange={(e) => setTeamData((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Enter team description"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="teamType" className="block text-sm font-medium text-gray-700 mb-1">
            Team Type
          </label>
          <select
            id="teamType"
            value={teamData.team_type}
            onChange={(e) =>
              setTeamData((prev) => ({ ...prev, team_type: e.target.value as "male" | "female" | "hybrid" }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {TEAM_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
              Latitude (Optional)
            </label>
            <input
              id="latitude"
              type="number"
              step="any"
              value={teamData.lat || ""}
              onChange={(e) =>
                setTeamData((prev) => ({
                  ...prev,
                  lat: e.target.value ? Number.parseFloat(e.target.value) : undefined,
                }))
              }
              placeholder="Enter latitude"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
              Longitude (Optional)
            </label>
            <input
              id="longitude"
              type="number"
              step="any"
              value={teamData.lng || ""}
              onChange={(e) =>
                setTeamData((prev) => ({
                  ...prev,
                  lng: e.target.value ? Number.parseFloat(e.target.value) : undefined,
                }))
              }
              placeholder="Enter longitude"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <UsersIcon className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Team Members</h3>
        <p className="text-sm text-gray-600">Add existing members or create new ones</p>
      </div>

      {/* Selected Members */}
      {teamData.user_ids.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Selected Members ({teamData.user_ids.length})
          </label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {teamData.user_ids.map((userId) => {
              const user = teamMembers.find((u) => u.id === userId)
              if (!user) return null
              return (
                <div key={userId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">{user.name}</span>
                    <span className="text-sm text-gray-500 ml-2">({user.email})</span>
                    {user.id.startsWith("temp_") && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ml-2">
                        New
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(userId)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Add Existing Members */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Add Existing Members</label>
        <div className="grid gap-2 max-h-40 overflow-y-auto">
          {teamMembers
            .filter((user) => !teamData.user_ids.includes(user.id) && !user.id.startsWith("temp_"))
            .map((user) => (
              <div key={user.id} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <span className="font-medium">{user.name}</span>
                  <span className="text-sm text-gray-500 ml-2">({user.email})</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddExistingMember(user)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* Create New Member */}
      <div className="space-y-2">
        {!showCreateMember ? (
          <button
            type="button"
            onClick={() => setShowCreateMember(true)}
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create New Member
          </button>
        ) : (
          <div className="border rounded-lg p-4 bg-white">
            <h4 className="text-sm font-medium mb-3">Create New Member</h4>
            <div className="space-y-3">
              <div>
                <label htmlFor="newMemberName" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  id="newMemberName"
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="newMemberEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="newMemberEmail"
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="newMemberPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  id="newMemberPhone"
                  type="text"
                  value={newMember.phone}
                  onChange={(e) => setNewMember((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCreateAndAddMember}
                  className="flex-1 inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create & Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateMember(false)}
                  className="flex-1 inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CogIcon className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Assign Services</h3>
        <p className="text-sm text-gray-600">Select the services this team will provide</p>
      </div>

      <div className="space-y-3 max-h-60 overflow-y-auto">
        {getAllServices().map((service) => (
          <div key={service.id} className="flex items-center space-x-2">
            <input
              id={service.id}
              type="checkbox"
              checked={teamData.service_ids.includes(service.id)}
              onChange={() => handleServiceToggle(service.id)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor={service.id} className="text-sm font-medium text-gray-700">
              {service.name}
              {service.isParent && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Parent Service
                </span>
              )}
            </label>
          </div>
        ))}
      </div>

      {teamData.service_ids.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Selected Services:</label>
          <div className="flex flex-wrap gap-2">
            {teamData.service_ids.map((serviceId) => (
              <span
                key={serviceId}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {getServiceName(serviceId)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <MapPinIcon className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Assign Location</h3>
        <p className="text-sm text-gray-600">Set the area, district, property, and residence type for this team</p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">
            Area (Optional)
          </label>
          <select
            id="area"
            value={teamData.area_id || ""}
            onChange={(e) =>
              setTeamData((prev) => ({
                ...prev,
                area_id: e.target.value || undefined,
                district_id: "", // Reset dependent fields
                property_id: "",
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
            District (Optional)
          </label>
          <select
            id="district"
            value={teamData.district_id || ""}
            onChange={(e) =>
              setTeamData((prev) => ({
                ...prev,
                district_id: e.target.value || undefined,
                property_id: "", // Reset dependent field
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={!teamData.area_id}
          >
            <option value="">Select a district</option>
            {getFilteredDistricts().map((district) => (
              <option key={district.id} value={district.id}>
                {district.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="property" className="block text-sm font-medium text-gray-700 mb-1">
            Property (Optional)
          </label>
          <select
            id="property"
            value={teamData.property_id || ""}
            onChange={(e) => setTeamData((prev) => ({ ...prev, property_id: e.target.value || undefined }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={!teamData.district_id}
          >
            <option value="">Select a property</option>
            {getFilteredProperties().map((property) => (
              <option key={property.id} value={property.id}>
                {property.name} - {property.address}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="residenceType" className="block text-sm font-medium text-gray-700 mb-1">
            Residence Type (Optional)
          </label>
          <select
            id="residenceType"
            value={teamData.residence_type_id || ""}
            onChange={(e) => setTeamData((prev) => ({ ...prev, residence_type_id: e.target.value || undefined }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a residence type</option>
            {residenceTypes.map((residenceType) => (
              <option key={residenceType.id} value={residenceType.id}>
                {residenceType.type}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CalendarIcon className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Schedule & Working Hours</h3>
        <p className="text-sm text-gray-600">Set up the team's working schedule</p>
      </div>

      <div className="space-y-6">
        {/* Starting Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Starting Date</label>
          <input
            type="date"
            value={teamData.start_date}
            onChange={(e) => setTeamData((prev) => ({ ...prev, start_date: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Working Hours */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Working Hours</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="workStart" className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                id="workStart"
                type="time"
                value={teamData.work_start_time}
                onChange={(e) => setTeamData((prev) => ({ ...prev, work_start_time: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="workEnd" className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                id="workEnd"
                type="time"
                value={teamData.work_end_time}
                onChange={(e) => setTeamData((prev) => ({ ...prev, work_end_time: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Break Time */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Break Time (Optional)</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="breakStart" className="block text-sm font-medium text-gray-700 mb-1">
                Start
              </label>
              <input
                id="breakStart"
                type="time"
                value={teamData.break_start_time || ""}
                onChange={(e) => setTeamData((prev) => ({ ...prev, break_start_time: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="breakEnd" className="block text-sm font-medium text-gray-700 mb-1">
                End
              </label>
              <input
                id="breakEnd"
                type="time"
                value={teamData.break_end_time || ""}
                onChange={(e) => setTeamData((prev) => ({ ...prev, break_end_time: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Days Off */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Days Off</label>
          <div className="grid grid-cols-2 gap-2">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day} className="flex items-center space-x-2">
                <input
                  id={day}
                  type="checkbox"
                  checked={teamData.off_days.includes(day)}
                  onChange={() => handleDayOffToggle(day)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={day} className="text-sm text-gray-700">
                  {day}
                </label>
              </div>
            ))}
          </div>
          {teamData.off_days.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {teamData.off_days.map((day) => (
                <span
                  key={day}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-gray-300 text-gray-700"
                >
                  {day}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1()
      case 2:
        return renderStep2()
      case 3:
        return renderStep3()
      case 4:
        return renderStep4()
      case 5:
        return renderStep5()
      default:
        return renderStep1()
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return teamData.name.trim() && teamData.team_type
      case 2:
        return teamData.user_ids.length > 0
      case 3:
        return teamData.service_ids.length > 0
      case 4:
        return true // All location fields are optional
      case 5:
        return teamData.start_date && teamData.work_start_time && teamData.work_end_time
      default:
        return false
    }
  }

  // Data fetching
  useEffect(() => {
    if (!isOpen) return

    startTransition(async () => {
      try {
        setLoading(true)

        // Fetch all required data
        const [areaData, districtData, propertyData, residenceData, servicesData, usersData] = await Promise.all([
          AreaAction(),
          DistrictAction(),
          PropertyAction(),
          ResidenceAction(),
          fetchServices(),
          TeamMembersAction(),
        ])

        setAreas(areaData || [])
        setDistricts(districtData || [])
        setProperties(propertyData || [])
        setResidenceTypes(residenceData || [])
        setServices(servicesData.data || [])
        setTeamMembers(usersData || [])
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load data")
      } finally {
        setLoading(false)
      }
    })
  }, [isOpen])

  // Fetch sub-services when services are loaded
  useEffect(() => {
    if (!services.length || services.every((s) => s.subServices?.length)) return

    startTransition(async () => {
      try {
        const updated = await Promise.all(
          services.map(async (parent) => {
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
    })
  }, [services])

  if (loading) {
    return (
      <>
        <button
          type="button"
          disabled
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-400 cursor-not-allowed"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Loading...
        </button>
      </>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <PlusCircleIcon className='w-5 h-5 mr-2' />
        New Team
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
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
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                  <div className="bg-blue-600 px-6 pt-6 pb-4 text-white">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-white mb-4">
                      Create New Team
                    </Dialog.Title>
                    {renderStepIndicator()}
                  </div>

                  <div className="px-6 py-6">{renderCurrentStep()}</div>

                  <div className="flex justify-between px-6 py-4 border-t bg-gray-50">
                    <button
                      type="button"
                      onClick={handlePrevious}
                      disabled={currentStep === 1}
                      className={`inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md ${
                        currentStep === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      }`}
                    >
                      Previous
                    </button>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpen(false)
                          resetModal()
                        }}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Cancel
                      </button>

                      {currentStep === totalSteps ? (
                        <button
                          type="button"
                          onClick={handleSubmit}
                          disabled={!isStepValid() || submitting}
                          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                            isStepValid() && !submitting
                              ? "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              : "bg-blue-400 cursor-not-allowed"
                          }`}
                        >
                          {submitting ? "Creating..." : "Create Team"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleNext}
                          disabled={!isStepValid()}
                          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                            isStepValid()
                              ? "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              : "bg-blue-400 cursor-not-allowed"
                          }`}
                        >
                          Next
                        </button>
                      )}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
