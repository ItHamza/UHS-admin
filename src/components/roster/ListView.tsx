"use client"

import { useState, useMemo, useEffect, useTransition } from "react"
import {
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  UsersIcon,
  BuildingOfficeIcon,
  FilmIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline"
import { format, addDays } from "date-fns"
import RosterAction from "@/actions/roster"
import { TeamsAction } from "@/actions/team"

interface ScheduleData {
  id: string
  date: string
  start_time: string
  end_time: string
  team_name: string
  rating: number
  status: string
  is_blocked: boolean
  is_available: boolean
  team_id: string
  apartment_number: string | null
  residence_type: { id: string; type: string } | null
  property: { id: string; name: string } | null
  district: { id: string; name: string } | null
  area: { id: string; name: string } | null
  members: any[]
  user: any
}

interface ProcessedBooking {
  id: string
  team_no: string
  timeFrom: string
  timeTo: string
  service: string
  area: string
  subarea: string
  tower: string
  apartmentNo: string
  apartmentType: string
  date: string
  status: string
  members: any[]
  user: any
  rating: number
}

const SERVICE_COLORS = {
  Working: "bg-blue-100 text-blue-800",
  Available: "bg-green-100 text-green-800",
  Booked: "bg-pink-100 text-pink-800",
  Cancelled: "bg-red-100 text-red-800",
  Transporting: "bg-purple-100 text-purple-800",
  Break: "bg-yellow-100 text-yellow-800",
  Blocked: "bg-gray-100 text-gray-800",
  Completed: "bg-slate-100 text-slate-800",
}

const APARTMENT_TYPE_COLORS = {
  Studio: "bg-green-100 text-green-800",
  "1BHK": "bg-green-100 text-green-800",
  "2BHK": "bg-yellow-100 text-yellow-800",
  "3BHK": "bg-orange-100 text-orange-800",
  "4BHK": "bg-red-100 text-red-800",
  "5BHK": "bg-purple-100 text-purple-800",
  Villa: "bg-indigo-100 text-indigo-800",
  Townhouse: "bg-pink-100 text-pink-800",
}

export default function RosterList() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [selectedTeam, setSelectedTeam] = useState("all")
  const [scheduleData, setScheduleData] = useState<ScheduleData[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [isPending, startTransition] = useTransition()
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Fetch teams
  const fetchTeams = async () => {
    try {
      const data = await TeamsAction()
      setTeams(data)
    } catch (error) {
      console.error("Failed to fetch teams:", error)
    }
  }

  // Fetch schedule data
  const fetchSchedules = async (date: string) => {
    startTransition(async () => {
      try {
        const data: ScheduleData[] = await RosterAction({
          start_date: date,
          end_date: date,
        })
        setScheduleData(data)
      } catch (error) {
        console.error("Failed to fetch schedules:", error)
        setScheduleData([])
      }
    })
  }

  useEffect(() => {
    fetchTeams()
  }, [])

  useEffect(() => {
    if (selectedDate) {
      fetchSchedules(selectedDate)
    }
  }, [selectedDate])

  // Transform schedule data to booking format
  const transformedBookings = useMemo(() => {
    return scheduleData.map(
      (schedule): ProcessedBooking => ({
        id: schedule.id,
        team_no: schedule.team_name,
        timeFrom: schedule.start_time,
        timeTo: schedule.end_time,
        service: schedule.status,
        area: schedule.area?.name || "N/A",
        subarea: schedule.district?.name || "N/A",
        tower: schedule.property?.name || "N/A",
        apartmentNo: schedule.apartment_number || "N/A",
        apartmentType: schedule.residence_type?.type || "N/A",
        date: schedule.date,
        status: schedule.status,
        members: schedule.members || [],
        user: schedule.user,
        rating: schedule.rating || 0,
      }),
    )
  }, [scheduleData])

  // Get unique teams for filter
  const availableTeams = useMemo(() => {
    const uniqueTeams = [...new Set(transformedBookings.map((booking) => booking.team_no))]
    return uniqueTeams.sort()
  }, [transformedBookings])

  // Filter and sort bookings with location comparison logic
  const processedBookings = useMemo(() => {
    const filtered = transformedBookings.filter((booking) => {
      const teamMatch = selectedTeam === "all" || booking.team_no === selectedTeam
      const statusMatch = booking.status === 'Booked'
      return teamMatch && statusMatch
    })

    // Sort by team and then by time
    filtered.sort((a, b) => {
      if (a.team_no !== b.team_no) {
        return a.team_no.localeCompare(b.team_no);
      }
      const dateTimeA = new Date(`${a.date} ${a.timeFrom}`);
      const dateTimeB = new Date(`${b.date} ${b.timeFrom}`);

      return dateTimeA.getTime() - dateTimeB.getTime();
    })

    // Calculate location status for each booking
    return filtered.map((booking, index) => {
      let locationStatus = "different"

      if (index > 0) {
        const prevBooking = filtered[index - 1]
        if (
          prevBooking.team_no === booking.team_no &&
          prevBooking.area === booking.area &&
          prevBooking.subarea === booking.subarea &&
          prevBooking.tower === booking.tower
        ) {
          locationStatus = "same"
        }
      }

      return { ...booking, locationStatus }
    })
  }, [transformedBookings, selectedTeam])

  const getStatusBadge = (status: string) => {
    if (status === "same") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Same Location
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Different Location
      </span>
    )
  }

  const getServiceColor = (service: string) => {
    return SERVICE_COLORS[service as keyof typeof SERVICE_COLORS] || "bg-gray-100 text-gray-800"
  }

  const getApartmentTypeColor = (type: string) => {
    // Extract base type (e.g., "2BHK" from "2BHK Apartment")
    const baseType = type.split(" ")[0]
    return (
      APARTMENT_TYPE_COLORS[baseType as keyof typeof APARTMENT_TYPE_COLORS] ||
      APARTMENT_TYPE_COLORS[type as keyof typeof APARTMENT_TYPE_COLORS] ||
      "bg-gray-100 text-gray-800"
    )
  }

  const handlePrevDay = () => {
    const currentDate = new Date(selectedDate)
    const prevDay = addDays(currentDate, -1)
    setSelectedDate(format(prevDay, "yyyy-MM-dd"))
  }

  const handleNextDay = () => {
    const currentDate = new Date(selectedDate)
    const nextDay = addDays(currentDate, 1)
    setSelectedDate(format(nextDay, "yyyy-MM-dd"))
  }

  const handleToday = () => {
    setSelectedDate(format(new Date(), "yyyy-MM-dd"))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Roster List</h1>
              <p className="text-gray-600 mt-2">View all team schedules with location optimization</p>
            </div>
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">{format(new Date(selectedDate), "EEEE, MMMM d, yyyy")}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Date Navigation */}
            <div className="flex items-center space-x-2">
              <button onClick={handlePrevDay} className="p-2 rounded hover:bg-gray-100" disabled={isPending}>
                <ChevronLeftIcon className="h-5 w-5" />
              </button>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isPending}
              />

              <button onClick={handleNextDay} className="p-2 rounded hover:bg-gray-100" disabled={isPending}>
                <ChevronRightIcon className="h-5 w-5" />
              </button>

              <button
                onClick={handleToday}
                className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={isPending}
              >
                Today
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div className="relative">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <FilmIcon className="h-4 w-4" />
                  <span>Filters</span>
                </button>

                {isFilterOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border z-10 p-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Team</label>
                        <select
                          value={selectedTeam}
                          onChange={(e) => setSelectedTeam(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="all">All Teams</option>
                          {availableTeams.map((team) => (
                            <option key={team} value={team}>
                              {team}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="mt-4 w-full px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {isPending ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading schedules...</p>
            </div>
          ) : processedBookings.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No schedules found</h3>
              <p className="text-gray-600">No schedules found for the selected date and filters.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Team
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Area
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Apartment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {processedBookings.map((booking, index) => (
                      <tr
                        key={booking.id}
                        className={`hover:bg-gray-50 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <UsersIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">{booking.team_no}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">
                              {booking.timeFrom} - {booking.timeTo}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getServiceColor(booking.service)}`}
                          >
                            {booking.service}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{booking.area}</div>
                              <div className="text-xs text-gray-500">{booking.subarea}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <BuildingOfficeIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{booking.tower}</div>
                              <div className="text-xs text-gray-500">Apt {booking.apartmentNo}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">#{booking.apartmentNo}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getApartmentTypeColor(booking.apartmentType)}`}
                          >
                            {booking.apartmentType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge((booking as any).locationStatus)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden divide-y divide-gray-200">
                {processedBookings.map((booking) => (
                  <div key={booking.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <UsersIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="font-medium text-gray-900">{booking.team_no}</span>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getServiceColor(booking.service)}`}
                      >
                        {booking.service}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        {booking.timeFrom} - {booking.timeTo}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        {booking.area}, {booking.subarea}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <BuildingOfficeIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        {booking.tower} - Apt {booking.apartmentNo}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getApartmentTypeColor(booking.apartmentType)}`}
                      >
                        {booking.apartmentType}
                      </span>
                      {getStatusBadge((booking as any).locationStatus)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Summary */}
        {processedBookings.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">{processedBookings.length}</div>
                <div className="text-sm text-blue-600">Total Schedules</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">{availableTeams.length}</div>
                <div className="text-sm text-green-600">Active Teams</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {processedBookings.filter((b) => (b as any).locationStatus === "same").length}
                </div>
                <div className="text-sm text-purple-600">Same Location</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-600">
                  {processedBookings.filter((b) => (b as any).locationStatus === "different").length}
                </div>
                <div className="text-sm text-orange-600">Different Location</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
