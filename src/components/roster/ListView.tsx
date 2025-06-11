"use client"

import { useState, useMemo } from "react"
import { CalendarIcon, MapPinIcon, ClockIcon, UsersIcon, BuildingOfficeIcon } from "@heroicons/react/24/outline"
import { format } from "date-fns"

interface Booking {
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
}

// Dummy booking data
const DUMMY_BOOKINGS: Booking[] = [
  {
    id: "1",
    team_no: "T001",
    timeFrom: "08:00",
    timeTo: "10:00",
    service: "Regular",
    area: "Doha City",
    subarea: "West Bay",
    tower: "Burj Al Mana",
    apartmentNo: "101",
    apartmentType: "2BHK",
    date: "2024-01-15",
  },
  {
    id: "2",
    team_no: "T001",
    timeFrom: "10:30",
    timeTo: "12:30",
    service: "Deep",
    area: "Doha City",
    subarea: "West Bay",
    tower: "Burj Al Mana",
    apartmentNo: "205",
    apartmentType: "3BHK",
    date: "2024-01-15",
  },
  {
    id: "3",
    team_no: "T002",
    timeFrom: "09:00",
    timeTo: "11:00",
    service: "Regular",
    area: "The Pearl Island",
    subarea: "Porto Arabia",
    tower: "Tower 1",
    apartmentNo: "301",
    apartmentType: "1BHK",
    date: "2024-01-15",
  },
  {
    id: "4",
    team_no: "T001",
    timeFrom: "14:00",
    timeTo: "16:00",
    service: "Special",
    area: "Lusail",
    subarea: "Marina",
    tower: "The Moon",
    apartmentNo: "401",
    apartmentType: "2BHK",
    date: "2024-01-15",
  },
  {
    id: "5",
    team_no: "T002",
    timeFrom: "11:30",
    timeTo: "13:30",
    service: "Regular",
    area: "The Pearl Island",
    subarea: "Porto Arabia",
    tower: "Tower 1",
    apartmentNo: "302",
    apartmentType: "2BHK",
    date: "2024-01-15",
  },
  {
    id: "6",
    team_no: "T003",
    timeFrom: "08:30",
    timeTo: "10:30",
    service: "Deep",
    area: "Doha City",
    subarea: "West Bay",
    tower: "Burj Al Mana",
    apartmentNo: "102",
    apartmentType: "3BHK",
    date: "2024-01-15",
  },
  {
    id: "7",
    team_no: "T002",
    timeFrom: "15:00",
    timeTo: "17:00",
    service: "Regular",
    area: "Lusial",
    subarea: "Fox Hills",
    tower: "Tower D",
    apartmentNo: "501",
    apartmentType: "1BHK",
    date: "2024-01-15",
  },
  {
    id: "8",
    team_no: "T003",
    timeFrom: "11:00",
    timeTo: "13:00",
    service: "Special",
    area: "Doha City",
    subarea: "West Bay",
    tower: "Burj Al Mana",
    apartmentNo: "103",
    apartmentType: "2BHK",
    date: "2024-01-15",
  },
]

const SERVICE_COLORS = {
  Regular: "bg-blue-100 text-blue-800",
  Deep: "bg-purple-100 text-purple-800",
  Special: "bg-orange-100 text-orange-800",
}

const APARTMENT_TYPE_COLORS = {
  "1BHK": "bg-green-100 text-green-800",
  "2BHK": "bg-yellow-100 text-yellow-800",
  "3BHK": "bg-red-100 text-red-800",
}

export default function RosterListView() {
  const [selectedDate, setSelectedDate] = useState("2024-01-15")
  const [selectedTeam, setSelectedTeam] = useState("all")

  // Get unique teams for filter
  const teams = useMemo(() => {
    const uniqueTeams = [...new Set(DUMMY_BOOKINGS.map((booking) => booking.team_no))]
    return uniqueTeams.sort()
  }, [])

  // Filter and sort bookings
  const processedBookings = useMemo(() => {
    const filtered = DUMMY_BOOKINGS.filter((booking) => {
      const dateMatch = booking.date === selectedDate
      const teamMatch = selectedTeam === "all" || booking.team_no === selectedTeam
      return dateMatch && teamMatch
    })

    // Sort by team and then by time
    filtered.sort((a, b) => {
      if (a.team_no !== b.team_no) {
        return a.team_no.localeCompare(b.team_no)
      }
      return a.timeFrom.localeCompare(b.timeFrom)
    })

    // Calculate status for each booking
    return filtered.map((booking, index) => {
      let status = "different"

      if (index > 0) {
        const prevBooking = filtered[index - 1]
        if (
          prevBooking.team_no === booking.team_no &&
          prevBooking.area === booking.area &&
          prevBooking.subarea === booking.subarea &&
          prevBooking.tower === booking.tower
        ) {
          status = "same"
        }
      }

      return { ...booking, status }
    })
  }, [selectedDate, selectedTeam])

  const getStatusBadge = (status: string) => {
    if (status === "same") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Same
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Different
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">List</h1>
              <p className="text-gray-600 mt-2">View all team bookings in list format</p>
            </div>
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">{format(new Date(selectedDate), "EEEE, MMMM d, yyyy")}</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Select Date
              </label>
              <input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="team" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Team
              </label>
              <select
                id="team"
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Teams</option>
                {teams.map((team) => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="hidden md:block">
            {processedBookings.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                <p className="text-gray-600">No bookings scheduled for the selected date and team.</p>
              </div>
            ) : (
              <>
                {/* Table Header */}
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                  <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="col-span-1">Team</div>
                    <div className="col-span-2">Time</div>
                    <div className="col-span-1">Service</div>
                    <div className="col-span-2">Area</div>
                    <div className="col-span-2">Location</div>
                    <div className="col-span-2">Apartment</div>
                    <div className="col-span-1">Type</div>
                    <div className="col-span-1">Status</div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-200">
                  {processedBookings.map((booking, index) => (
                    <div
                      key={booking.id}
                      className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      <div className="grid grid-cols-12 gap-4 items-center">
                        {/* Team */}
                        <div className="col-span-1">
                          <div className="flex items-center">
                            <UsersIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-900">{booking.team_no}</span>
                          </div>
                        </div>

                        {/* Time */}
                        <div className="col-span-2">
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">
                              {booking.timeFrom} - {booking.timeTo}
                            </span>
                          </div>
                        </div>

                        {/* Service */}
                        <div className="col-span-1">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              SERVICE_COLORS[booking.service as keyof typeof SERVICE_COLORS]
                            }`}
                          >
                            {booking.service}
                          </span>
                        </div>

                        {/* Area */}
                        <div className="col-span-2">
                          <div className="flex items-center">
                            <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{booking.area}</div>
                              <div className="text-xs text-gray-500">{booking.subarea}</div>
                            </div>
                          </div>
                        </div>

                        {/* Location */}
                        <div className="col-span-2">
                          <div className="flex items-center">
                            <BuildingOfficeIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{booking.tower}</div>
                              <div className="text-xs text-gray-500">Apt {booking.apartmentNo}</div>
                            </div>
                          </div>
                        </div>

                        {/* Apartment */}
                        <div className="col-span-2">
                          <div className="text-sm text-gray-900">#{booking.apartmentNo}</div>
                        </div>

                        {/* Type */}
                        <div className="col-span-1">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              APARTMENT_TYPE_COLORS[booking.apartmentType as keyof typeof APARTMENT_TYPE_COLORS]
                            }`}
                          >
                            {booking.apartmentType}
                          </span>
                        </div>

                        {/* Status */}
                        <div className="col-span-1">{getStatusBadge(booking.status)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div> {/* close md:block */}
          <div className="md:hidden divide-y divide-gray-200">
            {processedBookings.map((booking) => (
              <div key={booking.id} className="p-4">
                <div className="rounded-lg border p-4 shadow-sm bg-gray-50">
                  <div className="text-sm font-medium text-gray-900 mb-2">
                    <b>Team</b> {booking.team_no} - {booking.timeFrom} to {booking.timeTo}
                  </div>
                  <div className="text-sm text-gray-700 mb-1"><b>Service:</b> {booking.service}</div>
                  <div className="text-sm text-gray-700 mb-1"><b>Area:</b> {booking.area} / {booking.subarea}</div>
                  <div className="text-sm text-gray-700 mb-1"><b>Tower:</b> {booking.tower}, Apt {booking.apartmentNo}</div>
                  <div className="text-sm text-gray-700 mb-1"><b>Type:</b> {booking.apartmentType}</div>
                  <div className="text-sm text-gray-700 mb-1"><b>Status:</b> {getStatusBadge(booking.status)}</div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Summary */}
        {processedBookings.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">{processedBookings.length}</div>
                <div className="text-sm text-blue-600">Total Bookings</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">{teams.length}</div>
                <div className="text-sm text-green-600">Active Teams</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {processedBookings.filter((b) => b.status === "same").length}
                </div>
                <div className="text-sm text-purple-600">Same Location</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-600">
                  {processedBookings.filter((b) => b.status === "different").length}
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
