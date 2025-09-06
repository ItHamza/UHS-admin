"use client"

import type React from "react"
import { useState, useEffect, useTransition } from "react"
import { Star, Users, MapPin, Calendar, Search, MoreVertical, Edit, Trash2, Eye } from "lucide-react"
import moment from "moment"
import { TeamsAction, DeleteTeamAction } from "@/actions/team"
import toast from "react-hot-toast"
import TeamsDetail from "./teams-detail"
import UpdateTeam from "./update-team"

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
  // off_days: number[] (e.g., [0,6]); off_days_formatted: string[] (e.g., ["sunday","saturday"]).
  off_days?: number[] | string[]
  off_days_formatted?: string[]

  members?: any[]
  services?: any[]
  areas?: any[]
  districts?: any[]
  properties?: any[]
  residenceTypes?: any[]

  location_summary?: {
    areas_count: number
    districts_count: number
    properties_count: number
    residence_types_count: number
  }

  schedule_config?: {
    is_active: boolean
    start_time: string
    end_time: string
    break_start_time?: string
    break_end_time?: string
    start_date: string
    off_days: string[]
    has_break: boolean
    total_work_hours: number
    off_days_formatted: string[]
  }

  team_summary?: {
    members_count: number
    services_count: number
    schedules_count: number
    available_schedules: number
    latest_schedule_date?: string
    earliest_schedule_date?: string
  }

  created_at: string
  updated_at: string
}

const TeamsList: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([])
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([])
  const [isPending, startTransition] = useTransition()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "male" | "female" | "hybrid">("all")
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid")
  const [sortBy, setSortBy] = useState<"name" | "created_at" | "ratings" | "members">("created_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Modal states
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [teamToUpdate, setTeamToUpdate] = useState<Team | null>(null)
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pagination, setPagination]= useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    total_pages: 0,
    has_next_page: false,
    has_previous_page: false,
    next_page: null,
    previous_page: null,
    showing_from: 0,
    showing_to: 0,
  })

  // Dropdown state
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  // Helper function to normalize team data from API
  const normalizeTeamData = (team: any): Team => {
    return {
      ...team,
      // Map API fields to component expectations
      work_start_time: team.start_time,
      work_end_time: team.end_time,
      // Ensure team_number exists
      team_number: team.team_number || `TEAM-${team.id.slice(0, 8)}`,
      // Use team_summary counts if available
      // service_count: team.team_summary?.services_count || team.services?.length || 0,
      ratings: team.ratings || 0,
    }
  }

  // Helper: produce displayable off days as string[] from mixed inputs
  const getDisplayOffDays = (team: Team): string[] => {
    const DAY_NAMES = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ]

    // Prefer formatted values if provided on the team
    if (Array.isArray(team.off_days_formatted) && team.off_days_formatted.length) {
      return team.off_days_formatted
    }
    // Or from schedule_config
    if (
      Array.isArray(team.schedule_config?.off_days_formatted) &&
      team.schedule_config!.off_days_formatted.length
    ) {
      return team.schedule_config!.off_days_formatted
    }
    // Map numeric indices to names
    if (Array.isArray(team.off_days) && team.off_days.every((d) => typeof d === "number")) {
      return (team.off_days as number[])
        .map((i) => DAY_NAMES[i] ?? "")
        .filter(Boolean)
    }
    // Already strings
    if (Array.isArray(team.off_days) && team.off_days.every((d) => typeof d === "string")) {
      return team.off_days as string[]
    }
    if (typeof (team as any).off_days === "string") {
      return [(team as any).off_days as string]
    }
    return []
  }

  useEffect(() => {
    fetchTeams()
  }, [page, itemsPerPage])

  useEffect(() => {
    filterAndSortTeams()
  }, [teams, searchTerm, filterType, sortBy, sortOrder])

  const fetchTeams = () => {
    startTransition(async () => {
      try {
        const teams = await TeamsAction(page, itemsPerPage, searchTerm)
        debugger
        const normalizedTeams = (teams.data || []).map(normalizeTeamData)
        debugger
        setTeams(normalizedTeams)
        setPagination(teams.pagination)
      } catch (error) {
        console.error("Failed to fetch teams:", error)
        toast.error("Failed to load teams")
      }
    })
  }

  const filterAndSortTeams = () => {
    let filtered = teams

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (team) =>
          team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          team.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          team.team_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          team.members?.some(
            (member) =>
              member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              member.email?.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      )
    }

    // Type filter
    if (filterType !== "all") {
      filtered = filtered.filter((team) => team.team_type === filterType)
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case "created_at":
          aValue = new Date(a.created_at)
          bValue = new Date(b.created_at)
          break
        case "ratings":
          aValue = a.ratings || 0
          bValue = b.ratings || 0
          break
        case "members":
          aValue = a.team_summary?.members_count || a.members?.length || 0
          bValue = b.team_summary?.members_count || b.members?.length || 0
          break
        default:
          return 0
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredTeams(filtered)
  }

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm("Are you sure you want to delete this team? This action cannot be undone.")) return

    try {
      await DeleteTeamAction(teamId)
      setTeams(teams.filter((team) => team.id !== teamId))
      toast.success("Team deleted successfully")
    } catch (error: any) {
      console.error("Error deleting team:", error)
      toast.error(error.message || "Failed to delete team")
    }
  }

  const handleViewTeam = (team: Team) => {
    setSelectedTeam(team)
    setIsDetailOpen(true)
    setOpenDropdown(null)
  }

  const handleUpdateTeam = (team: Team) => {
    setTeamToUpdate(team)
    setIsUpdateModalOpen(true)
    setOpenDropdown(null)
  }

  const getTeamTypeColor = (type: string) => {
    const colors = {
      male: "bg-blue-100 text-blue-800",
      female: "bg-pink-100 text-pink-800",
      hybrid: "bg-purple-100 text-purple-800",
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getTeamTypeIcon = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  const ShimmerCard = () => (
    <div className="animate-pulse bg-white rounded-lg border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-gray-300 rounded w-1/3"></div>
        <div className="h-6 w-6 bg-gray-300 rounded"></div>
      </div>
      <div className="h-3 bg-gray-300 rounded w-2/3"></div>
      <div className="flex items-center space-x-2">
        <div className="h-3 bg-gray-300 rounded w-16"></div>
        <div className="h-3 bg-gray-300 rounded w-12"></div>
      </div>
      <div className="flex justify-between items-center">
        <div className="h-3 bg-gray-300 rounded w-20"></div>
        <div className="h-3 bg-gray-300 rounded w-16"></div>
      </div>
    </div>
  )

  const ShimmerTable = () => (
    <div className="animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex space-x-4 p-4 border-b">
          <div className="w-24 h-6 bg-gray-300 rounded"></div>
          <div className="w-40 h-6 bg-gray-300 rounded"></div>
          <div className="w-40 h-6 bg-gray-300 rounded"></div>
          <div className="w-24 h-6 bg-gray-300 rounded"></div>
          <div className="w-24 h-6 bg-gray-300 rounded"></div>
          <div className="w-24 h-6 bg-gray-300 rounded"></div>
        </div>
      ))}
    </div>
  )

  const TeamCard = ({ team }: { team: Team }) => {
    const offDays = getDisplayOffDays(team)
    const membersCount = team.team_summary?.members_count || team.members?.length || 0
    const servicesCount = team.team_summary?.services_count || team.services?.length || 0
    const districtsCount = team.location_summary?.districts_count || team.districts?.length || 0

    return (
      <div className="bg-white rounded-lg border hover:shadow-md transition-shadow duration-200">
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 truncate">{team.name}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTeamTypeColor(team.team_type)}`}>
                  {getTeamTypeIcon(team.team_type)}
                </span>
                {!team.is_active && (
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Inactive</span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2">#{team.team_number}</p>
              {team.description && <p className="text-sm text-gray-500 line-clamp-2 mb-3">{team.description}</p>}
            </div>
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === team.id ? null : team.id)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <MoreVertical className="h-4 w-4 text-gray-500" />
              </button>
              {openDropdown === team.id && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border z-50">
                  <div className="py-1">
                    <button
                      onClick={() => handleViewTeam(team)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </button>
                    <button
                      onClick={() => handleUpdateTeam(team)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Team
                    </button>
                    <button
                      onClick={() => handleDeleteTeam(team.id)}
                      className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Team
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-1" />
              <span>{membersCount} members</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Star className="h-4 w-4 mr-1 text-yellow-500" />
              <span>{team.ratings || 0}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{districtsCount} districts</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{servicesCount} services</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{team.service_count} bookings</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Created {moment(team.created_at).format("MMM DD, YYYY")}</span>
            <span>
              {team.work_start_time} - {team.work_end_time}
            </span>
          </div>

          {/* Off Days Indicator */}
          {offDays.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {offDays.slice(0, 3).map((day, index) => (
                <span
                  key={index}
                  className="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full"
                >
                  {String(day).slice(0, 3)}
                </span>
              ))}
              {offDays.length > 3 && (
                <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                  +{offDays.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Teams</h2>
            <p className="text-sm text-gray-600">{filteredTeams.length} teams found</p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search teams, members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm w-64"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">All Types</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="hybrid">Hybrid</option>
            </select>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split("-")
                setSortBy(field as any)
                setSortOrder(order as any)
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="created_at-desc">Newest First</option>
              <option value="created_at-asc">Oldest First</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="ratings-desc">Highest Rated</option>
              <option value="members-desc">Most Members</option>
            </select>

            <div className="flex border border-gray-300 rounded-md">
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-2 text-sm ${viewMode === "table" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:text-gray-900"}`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-2 text-sm border-l ${viewMode === "grid" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:text-gray-900"}`}
              >
                Grid
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isPending ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <ShimmerCard key={i} />
              ))}
            </div>
          ) : (
            <ShimmerTable />
          )
        ) : filteredTeams.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No teams found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterType !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by creating a new team"}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Members
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Services
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Off Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bookings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTeams.map((team) => {
                  const offDays = getDisplayOffDays(team)
                  const membersCount = team.team_summary?.members_count || team.members?.length || 0
                  const servicesCount = team.team_summary?.services_count || team.services?.length || 0

                  return (
                    <tr key={team.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{team.name}</div>
                          <div className="text-sm text-gray-500">#{team.team_number}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getTeamTypeColor(team.team_type)}`}
                        >
                          {getTeamTypeIcon(team.team_type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{membersCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Star className="h-4 w-4 mr-1 text-yellow-500" />
                          {team.ratings || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{servicesCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {offDays.slice(0, 2).map((day, index) => (
                            <span
                              key={index}
                              className="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full"
                            >
                              {String(day).slice(0, 3)}
                            </span>
                          ))}
                          {offDays.length > 2 && (
                            <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                              +{offDays.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{team.service_count}</td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            team.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {team.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {moment(team.created_at).format("MMM DD, YYYY")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="relative">
                          <button
                            onClick={() => setOpenDropdown(openDropdown === team.id ? null : team.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          {openDropdown === team.id && (
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border z-50">
                              <div className="py-1">
                                <button
                                  onClick={() => handleViewTeam(team)}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </button>
                                <button
                                  onClick={() => handleUpdateTeam(team)}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Team
                                </button>
                                <button
                                  onClick={() => handleDeleteTeam(team.id)}
                                  className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Team
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        {/* Pagination */}
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 gap-4">
            <div>
            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-medium">{pagination.showing_from}</span> to{" "}
              <span className="font-medium">{pagination.showing_to}</span> of{" "}
              <span className="font-medium">{pagination.total}</span> results
            </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-700 flex items-center gap-2">
                <span>Show</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {[10, 20, 50, 100].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                <span>per page</span>
              </div>
              <div className="inline-flex space-x-1">

              </div>
              <div className="flex items-center space-x-2 text-sm">
                <label htmlFor="go-to-page" className="text-gray-700">Go to page:</label>
                <input
                  id="go-to-page"
                  type="number"
                  min={1}
                  max={pagination.total_pages}
                  className="w-25 px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder={`${page} / ${pagination.total_pages}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const value = Number((e.target as HTMLInputElement).value);
                      if (value >= 1 && value <= pagination.total_pages) {
                        setPage(value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
              </div>
              <div className="inline-flex space-x-2">
                <button
                  onClick={() => setPage(pagination.previous_page!)}
                  disabled={!pagination.has_previous_page}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(pagination.next_page!)}
                  disabled={!pagination.has_next_page}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {openDropdown && <div className="fixed inset-0 z-0" onClick={() => setOpenDropdown(null)} />}

      {/* Modals */}
      {isDetailOpen && selectedTeam && (
        <div className="fixed inset-0 overflow-hidden z-50">
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0 bg-gray-800/40 transition-opacity"
              onClick={() => setIsDetailOpen(false)}
            />
            <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
              <div className="relative w-screen max-w-md">
                <div className="h-full flex flex-col bg-white shadow-xl overflow-y-scroll">
                  <TeamsDetail
                    team={selectedTeam}
                    onClose={() => setIsDetailOpen(false)}
                    onEdit={(team) => {
                      setTeamToUpdate(team)
                      setIsUpdateModalOpen(true)
                      setIsDetailOpen(false)
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isUpdateModalOpen && teamToUpdate && (
        <UpdateTeam
          team={teamToUpdate}
          isOpen={isUpdateModalOpen}
          onClose={() => {
            setIsUpdateModalOpen(false)
            setTeamToUpdate(null)
          }}
          onUpdate={(updatedTeam) => {
            setTeams(teams.map((team) => (team.id === updatedTeam.id ? updatedTeam : team)))
            setIsUpdateModalOpen(false)
            setTeamToUpdate(null)
            fetchTeams() // Refresh the list
          }}
        />
      )}
    </div>
  )
}

export default TeamsList
