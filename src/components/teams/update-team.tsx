"use client"

import React, { useState, useEffect, startTransition } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { Fragment } from "react"
import { X, Users, MapPin, Briefcase, Clock, Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import { CreateTeamMemberAction, UpdateTeamAction } from "@/actions/team"
import { TeamMembersAction } from "@/actions/users"
import AreaAction from "@/actions/area"
import DistrictAction from "@/actions/district"
import { PropertyAction } from "@/actions/property"
import ResidenceAction from "@/actions/residence"
import { fetchServices, fetchChildServices } from "@/lib/service/service"
import TreeDistrictSelector from "./tree-selector"

interface Team {
  id: string
  name: string
  description?: string
  team_type: "male" | "female" | "hybrid"
  team_number?: string
  ratings?: number
  service_count?: number
  lat?: number
  lng?: number
  is_active?: boolean

  // API field names
  work_start_time: string
  work_end_time: string
  break_start_time?: string
  break_end_time?: string
  start_date: string
  off_days: string | string[]

  members?: any[]
  services?: any[]
  areas?: any[]
  districts?: any[]
  properties?: any[]
  residenceTypes?: any[]
  created_at: string
}

interface UpdateTeamModalProps {
  team: Team
  isOpen: boolean
  onClose: () => void
  onUpdate: (updatedTeam: any) => void
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
  area_ids?: string[]
  district_ids: string[]
  property_ids?: string[]
  residence_type_ids?: string[]
}

const TEAM_TYPES = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "hybrid", label: "Hybrid" },
]

const DAYS_OF_WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

const UpdateTeamModal: React.FC<UpdateTeamModalProps> = ({ team, isOpen, onClose, onUpdate }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)

  // Data states
  const [areas, setAreas] = useState<any[]>([])
  const [districts, setDistricts] = useState<any[]>([])
  const [properties, setProperties] = useState<any[]>([])
  const [residenceTypes, setResidenceTypes] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [teamMembers, setTeamMembers] = useState<any[]>([])

  // Helper function to normalize off_days
  const normalizeOffDays = (off_days: any): string[] => {
    if (!off_days) return []
    if (Array.isArray(off_days)) return off_days
    if (typeof off_days === "string") return [off_days]
    return []
  }

  // Form state - Initialize with team data
  const [teamData, setTeamData] = useState<TeamData>({
    name: team.name || "",
    description: team.description || "",
    team_type: team.team_type || "male",
    lat: team.lat,
    lng: team.lng,
    user_ids: team.members?.map((m: any) => m.id) || [],
    service_ids: team.services?.map((s: any) => s.id) || [],
    start_date: team.start_date || "",
    work_start_time: team.work_start_time || "",
    work_end_time: team.work_end_time || "",
    break_start_time: team.break_start_time,
    break_end_time: team.break_end_time,
    off_days: normalizeOffDays(team.off_days),
    area_ids: team.areas?.map((a: any) => a.id) || [],
    district_ids: team.districts?.map((d: any) => d.id) || [],
    property_ids: team.properties?.map((p: any) => p.id) || [],
    residence_type_ids: team.residenceTypes?.map((r: any) => r.id) || [],
  })

  const [showCreateMember, setShowCreateMember] = useState(false)
  const [newMember, setNewMember] = useState({
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
      const subService = service.subServices?.find((ss: any) => ss.id === serviceId)
      if (subService) return subService.name
    }
    return "Unknown Service"
  }

  const getAllServices = () => {
    const allServices: { id: string; name: string; isParent: boolean }[] = []

    services.forEach((service) => {
      allServices.push({ id: service.id, name: service.name, isParent: true })
      service.subServices?.forEach((subService: any) => {
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
    if (currentStep < totalSteps && isStepValid()) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleAddExistingMember = (user: any) => {
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

        setNewMember({ name: "", email: "", phone: "", role: "team_member" })
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

  const handleSubmit = async () => {
    try {
      setSubmitting(true)

      const submitData = {
        id: team.id,
        ...teamData,
        lat: teamData.lat || undefined,
        lng: teamData.lng || undefined,
        area_ids: teamData.area_ids || undefined,
        district_ids: teamData.district_ids.length > 0 ? teamData.district_ids : undefined,
        property_ids: teamData.property_ids || undefined,
        residence_type_ids: teamData.residence_type_ids || undefined,
        break_start_time: teamData.break_start_time || undefined,
        break_end_time: teamData.break_end_time || undefined,
      }

      const updatedTeam = await UpdateTeamAction(submitData)
      onUpdate(updatedTeam)
      toast.success("Team updated successfully!")
      onClose()
    } catch (error: any) {
      console.error("Error updating team:", error)
      toast.error(error.message || "Failed to update team")
    } finally {
      setSubmitting(false)
    }
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6 px-4">
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

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return teamData.name.trim() && teamData.team_type
      case 2:
        return dataLoaded && teamData.user_ids.length > 0
      case 3:
        return dataLoaded && teamData.service_ids.length > 0
      case 4:
        return dataLoaded
      case 5:
        return teamData.start_date && teamData.work_start_time && teamData.work_end_time && teamData.break_start_time && teamData.break_end_time
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
        setDataLoaded(false)

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

        setDataLoaded(true)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load data")
      } finally {
        setLoading(false)
      }
    })
  }, [isOpen])

  // Fetch sub-services
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
      }
    })
  }, [services])

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Briefcase className="mx-auto h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Team Information</h3>
              <p className="text-sm text-gray-600">Update team name and type</p>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Users className="mx-auto h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Team Members</h3>
              <p className="text-sm text-gray-600">Update team members</p>
            </div>

            {!dataLoaded ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading members...</span>
              </div>
            ) : (
              <>
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
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveMember(userId)}
                              className="text-gray-400 hover:text-gray-500 focus:outline-none"
                            >
                              <X className="h-4 w-4" />
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
                      .filter((user) => !teamData.user_ids.includes(user.id))
                      .map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <span className="font-medium">{user.name}</span>
                            <span className="text-sm text-gray-500 ml-2">({user.email})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddExistingMember(user)}
                            className="px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
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
                      className="w-full px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Create New Member
                    </button>
                  ) : (
                    <div className="border rounded-lg p-4 bg-white">
                      <h4 className="text-sm font-medium mb-3">Create New Member</h4>
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={newMember.name}
                          onChange={(e) => setNewMember((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="Name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <input
                          type="email"
                          value={newMember.email}
                          onChange={(e) => setNewMember((prev) => ({ ...prev, email: e.target.value }))}
                          placeholder="Email"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <input
                          type="text"
                          value={newMember.phone}
                          onChange={(e) => setNewMember((prev) => ({ ...prev, phone: e.target.value }))}
                          placeholder="Phone"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleCreateAndAddMember}
                            className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                          >
                            Create & Add
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowCreateMember(false)}
                            className="flex-1 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Briefcase className="mx-auto h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Assign Services</h3>
              <p className="text-sm text-gray-600">Update team services</p>
            </div>

            {!dataLoaded ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading services...</span>
              </div>
            ) : (
              <>
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
                          <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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
                          className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {getServiceName(serviceId)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <MapPin className="mx-auto h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Update Location</h3>
              <p className="text-sm text-gray-600">Update team location assignments</p>
            </div>

            {!dataLoaded ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading locations...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Districts</label>
                  <TreeDistrictSelector
                    areas={areas}
                    districts={districts}
                    selectedDistricts={new Set(teamData.district_ids)}
                    setSelectedDistricts={(districts) =>
                      setTeamData((prev) => ({
                        ...prev,
                        district_ids: Array.from(districts),
                        property_ids: [],
                      }))
                    }
                  />
                </div>
              </div>
            )}
          </div>
        )
      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Clock className="mx-auto h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Update Schedule</h3>
              <p className="text-sm text-gray-600">Update working hours and schedule</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Starting Date</label>
                <input
                  type="date"
                  value={teamData.start_date}
                  onChange={(e) => setTeamData((prev) => ({ ...prev, start_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

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

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Break Time (Optional)</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="time"
                      value={teamData.break_start_time || ""}
                      onChange={(e) =>
                        setTeamData((prev) => ({ ...prev, break_start_time: e.target.value || undefined }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <input
                      type="time"
                      value={teamData.break_end_time || ""}
                      onChange={(e) =>
                        setTeamData((prev) => ({ ...prev, break_end_time: e.target.value || undefined }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

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
                        className="px-2.5 py-0.5 rounded-full text-xs font-medium border border-gray-300 text-gray-700"
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
      default:
        return null
    }
  }

  if (loading) {
    return (
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={onClose}>
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
              <div className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-center">
                  <Loader2 className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                  <span className="ml-2">Loading team data...</span>
                </div>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>
    )
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
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
                    Update Team: {team.name}
                  </Dialog.Title>
                  {renderStepIndicator()}
                </div>

                <div className="px-6 py-6">{renderCurrentStep()}</div>

                <div className="flex justify-between px-6 py-4 border-t bg-gray-50">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className={`px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md ${
                      currentStep === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "text-gray-700 bg-white hover:bg-gray-50"
                    }`}
                  >
                    Previous
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>

                    {currentStep === totalSteps ? (
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!isStepValid() || submitting}
                        className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                          isStepValid() && !submitting
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-blue-400 cursor-not-allowed"
                        }`}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="animate-spin h-4 w-4 mr-2 inline" />
                            Updating...
                          </>
                        ) : (
                          "Update Team"
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={!isStepValid()}
                        className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                          isStepValid() ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-400 cursor-not-allowed"
                        }`}
                      >
                        {!dataLoaded && (currentStep === 2 || currentStep === 3 || currentStep === 4) ? (
                          <>
                            <Loader2 className="animate-spin h-4 w-4 mr-2 inline" />
                            Loading...
                          </>
                        ) : (
                          "Next"
                        )}
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
  )
}

export default UpdateTeamModal;
