"use client"

import React, { useState } from "react";
import {
  X,
  Users,
  MapPin,
  Calendar,
  Clock,
  Star,
  Edit,
  Plus,
  Building,
  Home,
  Briefcase,
  Coffee,
  UserCheck,
  Phone,
  Mail,
  Activity,
} from "lucide-react"
import moment from "moment"

interface TeamsDetailProps {
  team: any
  onClose: () => void
  onEdit?: (team: any) => void
}

const TeamsDetail: React.FC<TeamsDetailProps> = ({ team, onClose, onEdit }) => {
  const [activeTab, setActiveTab] = useState<"overview" | "members" | "location" | "schedule">("overview")

  const formatDate = (dateString: string) => {
    return moment(dateString).format("MMM DD, YYYY")
  }

  const getTeamTypeColor = (type: string) => {
    const colors = {
      male: "bg-blue-100 text-blue-800 border-blue-200",
      female: "bg-pink-100 text-pink-800 border-pink-200",
      hybrid: "bg-purple-100 text-purple-800 border-purple-200",
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const normalizeOffDays = (off_days: any): string[] => {
    if (!off_days) return []
    if (Array.isArray(off_days)) return off_days
    if (typeof off_days === "string") return [off_days]
    return []
  }

  const getTeamStats = () => {
    const offDays = normalizeOffDays(team.off_days)
    const workingDays = 7 - offDays.length

    // Use API response structure
    const totalMembers = team.team_summary?.members_count || team.members?.length || 0
    const totalServices = team.team_summary?.services_count || team.services?.length || 0
    const totalDistricts = team.location_summary?.districts_count || team.districts?.length || 0
    const totalAreas = team.location_summary?.areas_count || team.areas?.length || 0
    const totalProperties = team.location_summary?.properties_count || team.properties?.length || 0
    const totalResidenceTypes = team.location_summary?.residence_types_count || team.residenceTypes?.length || 0

    return {
      workingDays,
      totalMembers,
      totalServices,
      totalDistricts,
      totalAreas,
      totalProperties,
      totalResidenceTypes,
      offDays,
      schedulesCount: team.service_count || 0,
      totalWorkHours: team.schedule_config?.total_work_hours || 0,
    }
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: Briefcase },
    { id: "members", label: "Members", icon: Users },
    { id: "location", label: "Location", icon: MapPin },
    { id: "schedule", label: "Schedule", icon: Calendar },
  ]

  const stats = getTeamStats()

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 rounded-full h-12 w-12 flex items-center justify-center">
            <span className="text-white font-semibold text-lg">{team.name.charAt(0)}</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">{team.name}</h2>
            <div className="flex items-center space-x-2">
              <p className="text-blue-100">#{team.team_number || `TEAM-${team.id.slice(0, 8)}`}</p>
              {!team.is_active && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Inactive</span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Quick Stats */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalMembers}</div>
            <div className="text-xs text-gray-500">Members</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.totalServices}</div>
            <div className="text-xs text-gray-500">Services</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.totalDistricts}</div>
            <div className="text-xs text-gray-500">Districts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.workingDays}</div>
            <div className="text-xs text-gray-500">Work Days/Week</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex gap-3">
          <button
            onClick={() => onEdit?.(team)}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="h-4 w-4" />
            Edit Team
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Team Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Team Type</label>
                  <div className="mt-1">
                    <span
                      className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getTeamTypeColor(team.team_type)}`}
                    >
                      {team.team_type.charAt(0).toUpperCase() + team.team_type.slice(1)}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Rating</label>
                  <div className="mt-1 flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-sm font-medium">{team.ratings || 0}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Start Date</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(team.start_date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(team.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        team.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {team.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Work Hours</label>
                  <p className="mt-1 text-sm text-gray-900">{stats.totalWorkHours}h per day</p>
                </div>
              </div>
              {team.description && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="mt-1 text-sm text-gray-900">{team.description}</p>
                </div>
              )}
              {team.lat && team.lng && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-500">Coordinates</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {team.lat}, {team.lng}
                  </p>
                </div>
              )}
            </div>

            {/* Services */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Assigned Services</h3>
              {team.services && team.services.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {team.services.map((service: any, index: number) => (
                    <div key={index} className="flex items-center p-3 bg-white rounded-lg border">
                      <Briefcase className="h-5 w-5 text-blue-500 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">{service.name}</p>
                        {service.description && <p className="text-sm text-gray-500">{service.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No services assigned</p>
                </div>
              )}
            </div>

            {/* Performance Metrics */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Performance Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{team.ratings || 0}</div>
                  <div className="text-sm text-blue-700">Average Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.workingDays * stats.totalWorkHours}h</div>
                  <div className="text-sm text-green-700">Weekly Hours</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.schedulesCount}</div>
                  <div className="text-sm text-purple-700">Scheduled Bookings</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "members" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Team Members ({stats.totalMembers})</h3>
              {team.members && team.members.length > 0 && (
                <div className="text-sm text-gray-500">
                  Active: {team.members.filter((m: any) => m.status !== "inactive").length}
                </div>
              )}
            </div>
            {team.members && team.members.length > 0 ? (
              <div className="space-y-3">
                {team.members.map((member: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="bg-blue-100 rounded-full h-12 w-12 flex items-center justify-center mr-4">
                      <span className="text-blue-800 font-medium text-lg">{member.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{member.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          {member.email}
                        </div>
                        {member.phone && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {member.phone}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        {member.role || "Team Member"}
                      </span>
                      {member.status === "inactive" && (
                        <div className="mt-1">
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                            Inactive
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">No team members assigned</p>
                <button
                  onClick={() => onEdit?.(team)}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Members
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "location" && (
          <div className="space-y-6">
            {/* Location Summary */}
            {team.location_summary && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-semibold text-center text-blue-900 mb-3">Location Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                  
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{stats.totalDistricts}</div>
                    <div className="text-xs text-green-700">Districts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">{stats.totalResidenceTypes}</div>
                    <div className="text-xs text-orange-700">Residence Types</div>
                  </div>
                </div>
              </div>
            )}


            {/* Districts */}
            {team.districts && team.districts.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Districts ({team.districts.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {team.districts.map((district: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow"
                    >
                      <div className="bg-blue-100 rounded-full h-8 w-8 flex items-center justify-center mr-3">
                        <span className="text-blue-800 text-xs font-medium">D</span>
                      </div>
                      <p className="font-medium text-gray-900">{district.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Properties */}
            {team.properties && team.properties.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Home className="h-5 w-5 mr-2" />
                  Properties ({team.properties.length})
                </h3>
                <div className="space-y-2">
                  {team.properties.map((property: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow"
                    >
                      <Home className="h-4 w-4 text-purple-500 mr-3" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{property.name}</p>
                        {property.address && <p className="text-sm text-gray-500">📍 {property.address}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Residence Types */}
            {team.residenceTypes && team.residenceTypes.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Residence Types ({team.residenceTypes.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {team.residenceTypes.map((residence: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow"
                    >
                      <div className="bg-green-100 rounded-full h-8 w-8 flex items-center justify-center mr-3">
                        <span className="text-green-800 text-xs font-medium">R</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{residence.type}</p>
                        {residence.description && <p className="text-sm text-gray-500">{residence.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!team.areas?.length &&
              !team.districts?.length &&
              !team.properties?.length &&
              !team.residenceTypes?.length && (
                <div className="text-center py-8">
                  <MapPin className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No location information available</p>
                  <button
                    onClick={() => onEdit?.(team)}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Locations
                  </button>
                </div>
              )}
          </div>
        )}

        {activeTab === "schedule" && (
          <div className="space-y-6">
            {/* Schedule Config Summary */}
            {team.schedule_config && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-3">Schedule Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{team.schedule_config.total_work_hours}h</div>
                    <div className="text-xs text-blue-700">Daily Work Hours</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {team.schedule_config.has_break ? "Yes" : "No"}
                    </div>
                    <div className="text-xs text-green-700">Break Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">
                      {team.schedule_config.is_active ? "Active" : "Inactive"}
                    </div>
                    <div className="text-xs text-purple-700">Schedule Status</div>
                  </div>
                </div>
              </div>
            )}

            {/* Working Hours */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Working Hours
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Work Start</label>
                  <p className="mt-1 text-sm font-medium text-gray-900">{team.start_time}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Work End</label>
                  <p className="mt-1 text-sm font-medium text-gray-900">{team.end_time}</p>
                </div>
                {team.break_start_time && team.break_end_time && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Break Start</label>
                      <p className="mt-1 text-sm font-medium text-gray-900">{team.break_start_time}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Break End</label>
                      <p className="mt-1 text-sm font-medium text-gray-900">{team.break_end_time}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Off Days */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Coffee className="h-5 w-5 mr-2" />
                Days Off
              </h3>
              {normalizeOffDays(team.off_days) && normalizeOffDays(team.off_days).length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {normalizeOffDays(team.off_days).map((day: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex px-3 py-1 text-sm font-medium bg-red-100 text-red-800 rounded-full border border-red-200"
                    >
                      {day}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No days off scheduled</p>
              )}
            </div>

            {/* Schedule Summary */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Schedule Summary</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• Working {stats.workingDays} days per week</p>
                <p>
                  • Daily hours: {team.start_time} - {team.end_time}
                </p>
                {team.break_start_time && team.break_end_time && (
                  <p>
                    • Break time: {team.break_start_time} - {team.break_end_time}
                  </p>
                )}
                <p>• Started on: {formatDate(team.start_date)}</p>
                <p>• Team created: {formatDate(team.created_at)}</p>
                <p>• Scheduled bookings: {team.service_count}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TeamsDetail
