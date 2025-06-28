"use client"

import type React from "react"
import { useState, useEffect, startTransition } from "react"
import { Calendar, Clock, MapPin, User, Phone, Home, CheckCircle, AlertCircle } from "lucide-react"
import { format, parseISO } from "date-fns"
import BookingAction from "@/actions/booking"
import { PropBooking } from "@/types/booking";
import moment from "moment"
import { AssignTeamSlotAction, OneTimeServiceTeamAvailabilityAction } from "@/actions/team-availability"
import toast from "react-hot-toast"
import PricingAction, { SpecialPricingAction } from "@/actions/pricing"

// Types based on your API response
interface TimeSlot {
  start_time: string
  end_time: string
  duration_minutes: number
  schedule_id: string
}

interface DailyAvailability {
  date: string
  day: string
  available: boolean
  reason: string
  timeslots: TimeSlot[]
}

interface TeamAvailability {
  team_id: string
  team_name: string
  team_type: string
  members_count: number
  work_hours: {
    start_time: string
    end_time: string
    break_start_time: string
    break_end_time: string
  }
  availability_summary: {
    available_days: number
    total_days: number
    availability_percentage: number
    total_timeslots: number
  }
  daily_availability: DailyAvailability[]
}

interface TeamAvailabilityResponse {
  success: boolean
  message: string
  data: {
    summary: {
      district_id: string
      duration_requested: number
      dates_checked: string[]
      total_teams_found: number
      teams_with_availability: number
      best_team: {
        team_id: string
        team_name: string
        available_days: number
        total_timeslots: number
      }
    }
    teams: TeamAvailability[]
  }
}

interface SelectedSlot {
  team_id: string
  team_name: string
  date: string
  time_slot: TimeSlot
}

const OneTimeServicesAssignment: React.FC = () => {
  const [bookings, setBookings] = useState<PropBooking[]>([])
  const [selectedBooking, setSelectedBooking] = useState<PropBooking | null>(null)
  const [teamAvailability, setTeamAvailability] = useState<TeamAvailabilityResponse | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null)
  const [loading, setLoading] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list")
  const [selectedDate, setSelectedDate] = useState<string | null>(null)


  useEffect(() => {
    startTransition(async () => {
      try {
        const data = await BookingAction();
        const filteredBooking = data.filter((b: any) => b.service.name === "Deep Cleaning" || b.service.name === "Residential Cleaning")
        setBookings(filteredBooking);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
      }
    });
  }, [])

  const fetchTeamAvailability = async (booking: PropBooking) => {
    setLoading(true)
    try {
      var duration_value = booking.serviceMinutes
      if (booking.service.name === "Deep Cleaning") {
        const pricingResponse = await PricingAction()
        const service_type = pricingResponse.find((p: PricingRule) =>
                              p.frequency === booking.frequency &&
                              p.residenceType.type === booking.residence_type.type
                            );
        duration_value = service_type.duration_value
      } else {
        const subServices = booking.bookingItems
                .map(item => {
                  const quantity = item.quantity;
                  const duration = item.subServiceItem?.time_duration_in_minutes;
                  return quantity && duration ? [quantity, duration] : null;
                })
                .filter(Boolean) as [number, number][];
        duration_value = subServices.reduce((sum, [quantity, duration]) => sum + quantity * duration, 0);
      }
      
      
      const updatedBoooking = {...booking, serviceMinutes: duration_value}
      setSelectedBooking(updatedBoooking)
      const data = {
        district_id: booking.district_id,
        start_date: booking.date,
        duration: duration_value
      }
      const response = await OneTimeServiceTeamAvailabilityAction(data)
      setTeamAvailability(response)
    } catch (error) {
      console.error("Error fetching team availability:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleBookingSelect = (booking: PropBooking) => {
    setSelectedSlot(null)
    setSelectedDate(null)
    fetchTeamAvailability(booking)
  }

  const handleSlotSelect = (team: TeamAvailability, date: string, timeSlot: TimeSlot) => {
    setSelectedSlot({
      team_id: team.team_id,
      team_name: team.team_name,
      date,
      time_slot: timeSlot,
    })
  }

  const handleAssignment = async () => {
    if (!selectedBooking || !selectedSlot) return

    setAssigning(true)
    try {
      const assignmentData = {
        id: selectedBooking.id,
        team_id: selectedSlot.team_id,
        schedule_id: selectedSlot.time_slot.schedule_id,
        date: selectedSlot.date,
        start_time: selectedSlot.time_slot.start_time,
        end_time: selectedSlot.time_slot.end_time,
      }

      console.log("Assignment data:", assignmentData)
      const assignTeamSlot = await AssignTeamSlotAction(assignmentData)
      if (assignTeamSlot.success) {
        toast.success(assignTeamSlot.message)
      }
      else {
        toast.error(assignTeamSlot.error)
      }

      // Update booking status
      // setBookings((prev) => prev.map((b) => (b.id === selectedBooking.id ? { ...b, status: "assigned" } : b)))

      // Reset selection
      setSelectedBooking(null)
      setTeamAvailability(null)
      setSelectedSlot(null)
    } catch (error) {
      console.error("Error assigning team:", error)
    } finally {
      setAssigning(false)
    }
  }

  const getAvailableDates = () => {
    if (!teamAvailability) return []

    return teamAvailability.data.teams.flatMap((team) =>
      team.daily_availability.filter((day) => day.available && day.timeslots.length > 0).map((day) => day.date),
    )
  }

  const getTimeSlotsForDate = (date: string) => {
    if (!teamAvailability) return []

    return teamAvailability.data.teams.flatMap((team) =>
      team.daily_availability
        .filter((day) => day.date === date && day.available)
        .flatMap((day) =>
          day.timeslots.map((slot) => ({
            team,
            slot,
          })),
        ),
    )
  }

  const formatTime = (time: string) => {
    return format(parseISO(`2000-01-01T${time}`), "h:mm a")
  }

  const formatDate = (dateStr: string) => {
    return format(parseISO(dateStr), "EEE, MMM d")
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">One-Time Services Assignment</h1>
          <p className="text-gray-600">Assign teams and time slots to pending one-time service bookings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bookings List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Pending Assignments</h2>
                <p className="text-sm text-gray-500">
                  {bookings.length} bookings
                </p>
              </div>
              <div className="divide-y max-h-150 overflow-y-auto">
                {bookings.map((booking) => {
                  const isAssigned = !!booking.team_id;
                  const isSelected = selectedBooking?.id === booking.id;

                  return (
                    <div
                      key={booking.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 ${
                        isSelected ? "bg-blue-50 border-l-4 border-blue-500" : ""
                      } ${isAssigned ? "opacity-60 pointer-events-none" : ""}`} // disable interaction
                      onClick={() => {
                        if (!isAssigned) handleBookingSelect(booking);
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-sm">{booking.booking_number}</span>
                        <span className="text-xs text-gray-500">
                          {moment(booking.createdAt).format("DD MMM YYYY")}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <User className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{booking.customer}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Home className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{booking.service.name === 'Residential Cleaning' ? 'Specialised Cleaning' : booking.service.name }</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{booking.property.name}</span>
                        </div>
                        <div className="flex justify-between items-start mb-2">
                          {booking.date && (
                            <div className="flex items-center text-sm text-blue-600">
                              <Calendar className="w-4 h-4 mr-2" />
                              <span>Preferred: {formatDate(booking.date)}</span>
                            </div>
                          )}
                          {isAssigned && (
                            <div className="text-xs text-red-500 font-semibold">
                              Assigned
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

              </div>
            </div>
          </div>

          {/* Assignment Panel */}
          <div className="lg:col-span-2">
            {selectedBooking ? (
              <div className="space-y-6">
                {/* Booking Details */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Booking Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Customer Information</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{selectedBooking.customer}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{selectedBooking.customer}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Service Details</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center">
                          <Home className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{selectedBooking.service.name}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{selectedBooking.serviceMinutes} minutes</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Location</h4>
                      <div className="text-sm text-gray-600">
                        <div>
                          {selectedBooking.appartment_number}, {selectedBooking.residence_type.type}
                        </div>
                        <div>
                          {selectedBooking.property.name}, {selectedBooking.district.name}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Requested Date</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center">
                          <Home className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{selectedBooking.date}</span>
                        </div>
                      </div>
                    </div>
                    {selectedBooking.special_instructions && (
                      <div className="md:col-span-2">
                        <h4 className="font-medium text-gray-900 mb-2">Special Instructions</h4>
                        <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded">
                          {selectedBooking.special_instructions}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Team Availability */}
                {loading ? (
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                      </div>
                    </div>
                  </div>
                ) : teamAvailability ? (
                  <div className="bg-white rounded-lg shadow">
                    <div className="p-4 border-b">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Available Teams & Slots</h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setViewMode("list")}
                            className={`px-3 py-1 text-sm rounded ${
                              viewMode === "list" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            List
                          </button>
                          <button
                            onClick={() => setViewMode("calendar")}
                            className={`px-3 py-1 text-sm rounded ${
                              viewMode === "calendar" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            Calendar
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        {teamAvailability.data.summary.teams_with_availability} teams available •{" "}
                        {teamAvailability.data.teams.reduce(
                          (acc, team) => acc + team.availability_summary.total_timeslots,
                          0,
                        )}{" "}
                        total slots
                      </div>
                    </div>

                    <div className="p-4">
                      {viewMode === "list" ? (
                        // List View
                        <div className="space-y-6">
                          {teamAvailability.data.teams.map((team) => (
                            <div key={team.team_id} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h4 className="font-semibold text-gray-900">{team.team_name}</h4>
                                  <div className="text-sm text-gray-600">
                                    {team.members_count} members • {team.availability_summary.availability_percentage}%
                                    available
                                  </div>
                                </div>
                                {teamAvailability.data?.summary?.best_team?.team_id === team.team_id && (
                                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                    Recommended
                                  </span>
                                )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {team.daily_availability
                                  .filter((day) => day.available && day.timeslots.length > 0)
                                  .map((day) => (
                                    <div key={day.date} className="border rounded p-3">
                                      <div className="font-medium text-sm mb-2">
                                        {formatDate(day.date)}
                                        {selectedBooking.date === day.date && (
                                          <span className="ml-2 text-xs text-blue-600">(Preferred)</span>
                                        )}
                                      </div>
                                      <div className="space-y-1">
                                        {day.timeslots.map((slot, idx) => (
                                          <button
                                            key={idx}
                                            onClick={() => handleSlotSelect(team, day.date, slot)}
                                            className={`w-full text-left p-2 text-sm rounded border ${
                                              selectedSlot?.time_slot === slot
                                                ? "bg-blue-100 border-blue-300"
                                                : "hover:bg-gray-50 border-gray-200"
                                            }`}
                                          >
                                            <div className="flex items-center justify-between">
                                              <span>
                                                {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                              </span>
                                              <Clock className="w-3 h-3 text-gray-400" />
                                            </div>
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        // Calendar View
                        <div className="space-y-4">
                          <div className="grid grid-cols-7 gap-2">
                            {teamAvailability.data.summary.dates_checked.map((date) => {
                              const availableSlots = getTimeSlotsForDate(date)
                              const isPreferred = selectedBooking.date === date
                              const isSelected = selectedDate === date

                              return (
                                <button
                                  key={date}
                                  onClick={() => setSelectedDate(isSelected ? null : date)}
                                  className={`p-3 text-center rounded border ${
                                    availableSlots.length === 0
                                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                      : isSelected
                                        ? "bg-blue-100 border-blue-300"
                                        : isPreferred
                                          ? "bg-green-50 border-green-300 hover:bg-green-100"
                                          : "hover:bg-gray-50 border-gray-200"
                                  }`}
                                  disabled={availableSlots.length === 0}
                                >
                                  <div className="text-xs font-medium">{format(parseISO(date), "EEE")}</div>
                                  <div className="text-sm">{format(parseISO(date), "d")}</div>
                                  <div className="text-xs text-gray-500">{availableSlots.length} slots</div>
                                  {isPreferred && <div className="text-xs text-green-600 font-medium">Preferred</div>}
                                </button>
                              )
                            })}
                          </div>

                          {selectedDate && (
                            <div className="border-t pt-4">
                              <h4 className="font-medium mb-3">Available slots for {formatDate(selectedDate)}</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {getTimeSlotsForDate(selectedDate).map(({ team, slot }, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => handleSlotSelect(team, selectedDate, slot)}
                                    className={`p-3 text-left rounded border ${
                                      selectedSlot?.time_slot === slot &&
                                      selectedSlot?.date === selectedDate
                                        ? "bg-blue-100 border-blue-300"
                                        : "hover:bg-gray-50 border-gray-200"
                                    }`}
                                  >
                                    <div className="font-medium text-sm">{team.team_name}</div>
                                    <div className="text-sm text-gray-600">
                                      {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}

                {/* Assignment Confirmation */}
                {selectedSlot && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                      Assignment Summary
                    </h3>
                    <div className="bg-gray-50 rounded p-4 mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Team:</span>
                          <div className="font-medium">{selectedSlot.team_name}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Date:</span>
                          <div className="font-medium">{formatDate(selectedSlot.date)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Time:</span>
                          <div className="font-medium">
                            {formatTime(selectedSlot.time_slot.start_time)} -{" "}
                            {formatTime(selectedSlot.time_slot.end_time)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setSelectedSlot(null)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAssignment}
                        disabled={assigning}
                        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center"
                      >
                        {assigning ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Assigning...
                          </>
                        ) : (
                          "Confirm Assignment"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Booking</h3>
                <p className="text-gray-600">Choose a booking from the list to view available teams and time slots</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OneTimeServicesAssignment
