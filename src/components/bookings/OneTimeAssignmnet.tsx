"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { Calendar, Clock, MapPin, User, Phone, Home, CheckCircle, AlertCircle, Users, Info, Ban, X, Timer } from "lucide-react"
import { format, parseISO } from "date-fns"
import { BookingByIdAction } from "@/actions/booking"
import { PropBooking } from "@/types/booking"
import moment from "moment"
import { AssignTeamSlotAction, OneTimeServiceTeamAvailabilityAction } from "@/actions/team-availability"
import toast from "react-hot-toast"
import PricingAction from "@/actions/pricing"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { MagnifyingGlassIcon, XCircleIcon } from "@heroicons/react/24/outline"

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
      } | null
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

// ---- Helpers ----
const formatTime = (time: string) => format(parseISO(`2000-01-01T${time}`), "h:mm a")
const formatDate = (dateStr: string) => format(parseISO(dateStr), "EEE, MMM d")

const getBookingTeamName = (b?: PropBooking | null) =>
  ((b as any)?.team?.name ?? (b as any)?.team_name ?? (b as any)?.team?.title ?? null)

const first = <T,>(arr?: T[]): T | undefined => (Array.isArray(arr) && arr.length > 0 ? arr[0] : undefined)

const getAssignedBlock = (b?: PropBooking | null) => {
  const svc = first<any>((b as any)?.services?.data)
  const ta = first<any>((b as any)?.teamAvailabilities)
  const start_time: string | undefined = svc?.start_time ?? ta?.start_time
  const end_time: string | undefined = svc?.end_time ?? ta?.end_time
  const date: string | undefined = svc?.date ?? ta?.date
  return { date, start_time, end_time }
}

const getBookingServiceTime = (b?: PropBooking | null) => {
  const { start_time, end_time } = getAssignedBlock(b)
  return start_time && end_time ? `${formatTime(start_time)} - ${formatTime(end_time)}` : "Not assigned"
}

const getBookingServiceDate = (b?: PropBooking | null) => {
  const { date } = getAssignedBlock(b)
  return date ? formatDate(date) : "Not assigned"
}

const bookingIsAssigned = (b?: PropBooking | null) => !!(b?.team?.id || (b as any)?.team_id || (b?.team_availability_ids?.length ?? 0) > 0 || (b as any)?.teamAvailabilities?.length)
const bookingIsCancelled = (b?: PropBooking | null) =>
  ["cancelled", "canceled", "void", "rejected"].includes(((b as any)?.status ?? (b as any)?.booking_status ?? "").toLowerCase())

const sum = (arr: number[]) => arr.reduce((a, c) => a + c, 0)

// ---- Component ----
const OneTimeServicesAssignment: React.FC = () => {
  const queryClient = useQueryClient()

  const [selectedBooking, setSelectedBooking] = useState<PropBooking | null>(null)
  const [teamAvailability, setTeamAvailability] = useState<TeamAvailabilityResponse | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null)
  const [loading, setLoading] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list")
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")

  // Cancellation dialog state (UI inputs commented out below for later wiring)
  const [showCancel, setShowCancel] = useState(false)
  const [cancelReason, setCancelReason] = useState("Customer request")
  const [cancelNote, setCancelNote] = useState("")
  const [cancelling, setCancelling] = useState(false)

  // Debounce the visible search input -> query param
  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), 400)
    return () => clearTimeout(id)
  }, [searchInput])

  const service_ids = useMemo(
    () => [
      "78698431-bd16-429a-9278-4390d59497c9",
      "3f99ad31-7f21-4298-b0d6-50101165e7ef",
      "7e7b5232-ca6d-4bfe-890f-f8fcdf1a4939",
    ],
    []
  )

  const { data, isPending, isError, error } = useQuery<{ data: PropBooking[]; pagination: any }>({
    queryKey: ["bookings", page, itemsPerPage, search, service_ids],
    queryFn: () => {
      const params = new URLSearchParams()
      params.append("page", String(page))
      params.append("limit", String(itemsPerPage))
      params.append("search", search)
      service_ids.forEach((id) => params.append("service_id", id))

      return fetch(`/api/booking?${params.toString()}`).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch bookings")
        return res.json()
      })
    },
    staleTime: 20_000,
  })

  const bookings = data?.data || []
  const pagination = data?.pagination || {
    current_page: 1,
    per_page: 10,
    total: 0,
    total_pages: 0,
    has_next_page: false,
    has_previous_page: false,
    next_page: null as number | null,
    previous_page: null as number | null,
    showing_from: 0,
    showing_to: 0,
  }

  const fetchTeamAvailability = async (booking_id: string) => {
    setLoading(true)
    try {
      const booking: PropBooking = await BookingByIdAction(booking_id)

      // Compute duration accurately for Deep Cleaning vs sub-services
      let duration_value = (booking as any).serviceMinutes
      if (booking.service?.name === "Deep Cleaning") {
        const pricingResponse = await PricingAction()
        const service_type = pricingResponse?.find(
          (p: any) => p.frequency === booking.frequency && p.residenceType?.type === booking.residence_type?.type,
        )
        duration_value = service_type?.duration_value ?? duration_value ?? 15
      } else {
        const subServices = booking.bookingItems
          ?.map((item: any) => {
            const quantity = item?.quantity
            const duration = item?.subServiceItem?.time_duration_in_minutes
            return quantity && duration ? [quantity, duration] : null
          })
          .filter(Boolean) as [number, number][]
        const minutes = subServices?.reduce((acc, [q, d]) => acc + q * d, 0)
        duration_value = minutes || duration_value || 15
      }

      const updatedBooking = { ...booking, serviceMinutes: duration_value }
      setSelectedBooking(updatedBooking)

      // Only fetch availability for UNASSIGNED bookings (per requirement)
      if (!bookingIsAssigned(updatedBooking) && !bookingIsCancelled(updatedBooking)) {
        const params = {
          district_id: (updatedBooking as any).district.id,
          start_date: (updatedBooking as any).date,
          duration: duration_value || 15,
        }
        const response = await OneTimeServiceTeamAvailabilityAction(params)
        if (response?.success) {
          setTeamAvailability(response)
        } else {
          toast.error(response?.message || "Team availability not found")
          setTeamAvailability(null)
        }
      } else {
        setTeamAvailability(null)
      }
    } catch (e) {
      console.error("Error fetching team availability:", e)
      toast.error("Couldn't load booking details")
    } finally {
      setLoading(false)
    }
  }

  const handleBookingSelect = (booking: PropBooking) => {
    setSelectedSlot(null)
    setSelectedDate(null)
    fetchTeamAvailability(booking.id)
  }

  const handleSlotSelect = (team: TeamAvailability, date: string, timeSlot: TimeSlot) => {
    setSelectedSlot({ team_id: team.team_id, team_name: team.team_name, date, time_slot: timeSlot })
  }

  const handleAssignment = async () => {
    if (!selectedBooking || !selectedSlot) return
    setAssigning(true)
    try {
      const assignmentData = {
        id: (selectedBooking as any).id,
        team_id: selectedSlot.team_id,
        schedule_id: selectedSlot.time_slot.schedule_id,
        date: selectedSlot.date,
        start_time: selectedSlot.time_slot.start_time,
        end_time: selectedSlot.time_slot.end_time,
      }
      const assignTeamSlot = await AssignTeamSlotAction(assignmentData)
      if (assignTeamSlot?.success) {
        toast.success(assignTeamSlot.message || "Assigned")
        await queryClient.invalidateQueries({ queryKey: ["bookings"] })
        setSelectedSlot(null)
        await fetchTeamAvailability((selectedBooking as any).id)
      } else {
        toast.error(assignTeamSlot?.error || "Assignment failed")
      }
    } catch (error) {
      console.error("Error assigning team:", error)
      toast.error("Error assigning team")
    } finally {
      setAssigning(false)
    }
  }

  // ---- Cancellation flow (API wired; form inputs commented in dialog) ----
  const cancelBooking = async (id: string, reason: string, note?: string) => {
    const res = await fetch(`/api/booking/${id}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason, note }),
    })
    if (!res.ok) throw new Error("Cancellation failed")
    return res.json()
  }

  const handleCancel = async () => {
    if (!selectedBooking) return
    try {
      setCancelling(true)
      await cancelBooking((selectedBooking as any).id, cancelReason, cancelNote)
      toast.success("Booking cancelled")
      setShowCancel(false)
      setCancelNote("")
      await queryClient.invalidateQueries({ queryKey: ["bookings"] })
      await fetchTeamAvailability((selectedBooking as any).id)
    } catch (e) {
      console.error(e)
      toast.error("Couldn't cancel booking")
    } finally {
      setCancelling(false)
    }
  }

  // ---- UI bits ----
  const ShimmerCard = () => (
    <div className="animate-pulse bg-white rounded-lg border border-gray-200 p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 rounded w-24" />
          <div className="h-5 bg-gray-300 rounded w-32" />
        </div>
        <div className="h-6 bg-gray-300 rounded-full w-20" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="h-3 bg-gray-300 rounded w-16" />
          <div className="h-4 bg-gray-300 rounded w-24" />
        </div>
        <div className="space-y-1">
          <div className="h-3 bg-gray-300 rounded w-12" />
          <div className="h-4 bg-gray-300 rounded w-20" />
        </div>
      </div>
    </div>
  )

  const AssignedBadge: React.FC<{ teamName?: string | null }> = ({ teamName }) => (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border border-green-300 bg-green-50 text-green-700">
      <CheckCircle className="w-3 h-3" />
      {teamName ? `Assigned: ${teamName}` : "Assigned"}
    </span>
  )

  const CancelDialog: React.FC<{ open: boolean; onClose: () => void; onConfirm: () => void }> = ({ open, onClose, onConfirm }) => {
    if (!open) return null
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="relative bg-white rounded-xl shadow-lg w-full max-w-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2"><Ban className="w-5 h-5 text-red-600"/> Cancel Booking</h3>
            <button className="p-1 rounded hover:bg-gray-100" onClick={onClose}><X className="w-5 h-5"/></button>
          </div>
          {/*
          <div className="space-y-4 text-sm">
            <div>
              <label className="block text-gray-700 mb-1">Reason</label>
              <select value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} className="w-full border rounded px-2 py-2">
                <option>Customer request</option>
                <option>Duplicate booking</option>
                <option>Pricing/estimate issue</option>
                <option>No show</option>
                <option>Operational constraint</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Note (optional)</label>
              <textarea value={cancelNote} onChange={(e) => setCancelNote(e.target.value)} rows={3} className="w-full border rounded px-2 py-2" placeholder="Add any context for the team" />
            </div>
          </div>
          */}
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded border">Close</button>
            <button onClick={onConfirm} disabled={cancelling} className="px-5 py-2 rounded bg-red-600 text-white disabled:opacity-60">
              {cancelling ? "Cancelling..." : "Confirm Cancel"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ---- Render ----
  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">One-Time Bookings</h2>
                <p className="text-sm text-gray-600 mt-1">Manage service bookings ({bookings.length} results)</p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchInput}
                placeholder="Search by customer name, phone, email, booking ID, service..."
                onChange={(e) => setSearchInput(e.target.value)}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
              {search && (
                <button
                  onClick={() => {
                    setSearchInput("")
                    setSearch("")
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <XCircleIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bookings List */}
          {isPending ? (
            <div className="lg:col-span-1 p-4">
              <div className="space-y-4">{Array.from({ length: 5 })?.map((_, i) => <ShimmerCard key={i} />)}</div>
            </div>
          ) : isError ? (
            <div className="lg:col-span-1 p-6 text-sm text-red-600">{(error as Error)?.message || "Error loading bookings"}</div>
          ) : (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-semibold">Pending & Assigned</h2>
                  <p className="text-sm text-gray-500">{bookings.length} bookings</p>
                </div>
                <div className="divide-y max-h-[36rem] overflow-y-auto">
                  {bookings?.map((booking) => {
                    const isAssigned = bookingIsAssigned(booking)
                    const isSelected = selectedBooking?.id === booking.id
                    const isCancelled = bookingIsCancelled(booking)
                    const teamName = getBookingTeamName(booking)
                    const serviceTime = getBookingServiceTime(booking)

                    return (
                      <button
                        key={(booking as any).id}
                        className={`w-full text-left p-4 hover:bg-gray-50 ${
                          isSelected ? "bg-blue-50 border-l-4 border-blue-500" : ""
                        }`}
                        onClick={() => handleBookingSelect(booking)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-sm">{(booking as any).booking_number}</span>
                          <div className="flex items-center gap-2">
                            {isCancelled && (
                              <span className="text-xs px-2 py-0.5 rounded-full border bg-red-50 text-red-700 border-red-300">Cancelled</span>
                            )}
                            <span className="text-xs text-gray-500">{moment((booking as any).date).format("DD MMM YYYY")}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <User className="w-4 h-4 mr-2 text-gray-400" />
                            <span>{(booking as any).customer}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Home className="w-4 h-4 mr-2 text-gray-400" />
                            <span>{(booking as any).service?.name === "Residential Cleaning" ? "Specialised Cleaning" : (booking as any).service?.name}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                            <span>{(booking as any).property?.name}</span>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            {(booking as any).date && (
                              <div className="flex items-center text-sm text-blue-600">
                                <Calendar className="w-4 h-4 mr-2" />
                                <span>Preferred: {formatDate((booking as any).date)}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex justify-between items-center text-sm text-gray-600">
                            <div className="flex items-center">
                              <Timer className="w-4 h-4 mr-2 text-gray-400" />
                              <span>{serviceTime}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {isAssigned && <AssignedBadge teamName={teamName} />}
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })}

                  {bookings.length === 0 && (
                    <div className="p-6 text-sm text-gray-600">No bookings found.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Right pane */}
          <div className="lg:col-span-2">
            {selectedBooking ? (
              <div className="space-y-6">
                {/* Booking Details */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Booking Details</h3>
                    <div className="flex items-center gap-2">
                      {bookingIsCancelled(selectedBooking) && (
                        <span className="text-xs px-2 py-0.5 rounded-full border bg-red-50 text-red-700 border-red-300">Cancelled</span>
                      )}
                      {bookingIsAssigned(selectedBooking) && (
                        <AssignedBadge teamName={getBookingTeamName(selectedBooking)} />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Customer Information</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{(selectedBooking as any).customer}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{(selectedBooking as any).user?.phone}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Service Details</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center">
                          <Home className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{(selectedBooking as any).service?.name === "Residential Cleaning" ? "Specialised Cleaning" : (selectedBooking as any).service?.name}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{(selectedBooking as any).serviceMinutes} minutes</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Location</h4>
                      <div className="text-sm text-gray-600">
                        <div>
                          {(selectedBooking as any).appartment_number}, {(selectedBooking as any).residence_type?.type}
                        </div>
                        <div>
                          {(selectedBooking as any).property?.name}, {(selectedBooking as any).district?.name}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Requested Date</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{(selectedBooking as any).date}</span>
                        </div>
                      </div>
                    </div>

                    {/* Assigned team summary (read-only) */}
                    {bookingIsAssigned(selectedBooking) && (
                      <div className="md:col-span-2 mt-2">
                        <h4 className="font-medium text-gray-900 mb-2">Assigned Team</h4>
                        <div className="text-sm flex flex-wrap items-center gap-3 bg-green-50 border border-green-200 rounded p-3">
                          <Users className="w-4 h-4 text-green-700" />
                          <span className="font-medium text-green-900">{getBookingTeamName(selectedBooking) ?? "Team"}</span>
                          <Calendar className="w-4 h-4 text-green-700" />
                          <span className="font-medium text-green-900">{getBookingServiceDate(selectedBooking)}</span>
                          <Timer className="w-4 h-4 text-green-700" />
                          <span className="font-medium text-green-900">{getBookingServiceTime(selectedBooking)}</span>
                          <span className="text-green-800/80">(Reassignment disabled)</span>
                        </div>
                      </div>
                    )}

                    {(selectedBooking as any).bookingItems?.length > 0 && (
                      <div className="md:col-span-2 mt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Sub-Services</h4>
                        <div className="space-y-3 text-sm">
                          {(selectedBooking as any).bookingItems.map((item: any, idx: number) => {
                            const name = item?.subServiceItem?.name ?? item?.name ?? `Item ${idx + 1}`
                            const qty = item?.quantity ?? 1
                            const unitMin = item?.subServiceItem?.time_duration_in_minutes ?? item?.time_duration_in_minutes ?? 0
                            const totalMin = qty * (unitMin || 0)
                            return (
                              <div key={idx} className="border border-gray-200 rounded-md p-3 bg-gray-50">
                                <div className="flex justify-between">
                                  <span className="text-gray-800 font-semibold">{name}</span>
                                  <span className="text-gray-600">
                                    Qty: <strong>{qty}</strong>{" "} Duration: <strong>{totalMin} min</strong>
                                  </span>
                                </div>
                                <div className="flex justify-between text-gray-600 mt-1">
                                  <span>Category: {item?.subServiceItem?.category ?? "—"}</span>
                                  <span>Price per unit: <strong>{item?.subServiceItem?.price_per_unit ?? "—"}</strong></span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Cancellation options (button hidden for now) */}
                    {/*
                    {!bookingIsCancelled(selectedBooking) && (
                      <div className="md:col-span-2">
                        <h4 className="font-medium text-gray-900 mb-2">Cancellation</h4>
                        <div className="flex flex-wrap items-center gap-3">
                          <button onClick={() => setShowCancel(true)} className="px-4 py-2 rounded border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 flex items-center gap-2">
                            <Ban className="w-4 h-4"/> Cancel this booking
                          </button>
                          <span className="text-sm text-gray-500">This will notify the team and free the slot if assigned.</span>
                        </div>
                      </div>
                    )}
                    */}
                  </div>
                </div>

                {/* Team Availability (ONLY when unassigned + not cancelled) */}
                {!bookingIsAssigned(selectedBooking) && !bookingIsCancelled(selectedBooking) && (
                  loading ? (
                    <div className="bg-white rounded-lg shadow p-6">
                      <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-1/4" />
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-200 rounded" />
                          <div className="h-3 bg-gray-200 rounded w-5/6" />
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
                              className={`px-3 py-1 text-sm rounded ${viewMode === "list" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"}`}
                            >
                              List
                            </button>
                            <button
                              onClick={() => setViewMode("calendar")}
                              className={`px-3 py-1 text-sm rounded ${viewMode === "calendar" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"}`}
                            >
                              Calendar
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          {teamAvailability?.data?.summary?.teams_with_availability} teams available •{" "}
                          {teamAvailability?.data?.teams?.reduce((acc, team) => acc + team.availability_summary.total_timeslots, 0)}{" "}
                          total slots
                        </div>
                      </div>

                      <div className="p-4">
                        {viewMode === "list" ? (
                          <div className="space-y-6">
                            {teamAvailability?.data?.teams?.map((team) => (
                              <div key={team.team_id} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                    <h4 className="font-semibold text-gray-900">{team.team_name}</h4>
                                    <div className="text-sm text-gray-600">
                                      {team.members_count} members • {team.availability_summary.availability_percentage}% available
                                    </div>
                                  </div>
                                  {teamAvailability.data?.summary?.best_team?.team_id === team.team_id && (
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Recommended</span>
                                  )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {team.daily_availability
                                    .filter((day) => day.available && day.timeslots.length > 0)
                                    ?.map((day) => (
                                      <div key={day.date} className="border rounded p-3">
                                        <div className="font-medium text-sm mb-2">
                                          {formatDate(day.date)}
                                          {(selectedBooking as any).date === day.date && (
                                            <span className="ml-2 text-xs text-blue-600">(Preferred)</span>
                                          )}
                                        </div>
                                        <div className="space-y-1">
                                          {day.timeslots?.map((slot, idx) => (
                                            <button
                                              key={idx}
                                              onClick={() => handleSlotSelect(team, day.date, slot)}
                                              className={`w-full text-left p-2 text-sm rounded border ${
                                                selectedSlot?.time_slot === slot && selectedSlot?.date === day.date
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
                          <div className="space-y-4">
                            <div className="grid grid-cols-7 gap-2">
                              {teamAvailability.data.summary.dates_checked?.map((date) => {
                                const availableSlots = teamAvailability.data.teams.flatMap((team) =>
                                  team.daily_availability
                                    .filter((day) => day.date === date && day.available)
                                    .flatMap((day) => day.timeslots?.map((slot) => ({ team, slot }))),
                                )
                                const isPreferred = (selectedBooking as any).date === date
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
                                  {teamAvailability.data.teams
                                    .flatMap((team) =>
                                      team.daily_availability
                                        .filter((d) => d.date === selectedDate && d.available)
                                        .flatMap((d) => d.timeslots.map((slot) => ({ team, slot }))),
                                    )
                                    .map(({ team, slot }, idx) => (
                                      <button
                                        key={idx}
                                        onClick={() => handleSlotSelect(team, selectedDate, slot)}
                                        className={`p-3 text-left rounded border ${
                                          selectedSlot?.time_slot === slot && selectedSlot?.date === selectedDate
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

                      {/* Assignment Confirmation */}
                      {selectedSlot && (
                        <div className="border-t p-4">
                          <h3 className="text-base font-semibold mb-3 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                            Assignment Summary
                          </h3>
                          <div className="bg-gray-50 rounded p-4 mb-4 text-sm grid grid-cols-1 md:grid-cols-3 gap-4">
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
                              <div className="font-medium">{formatTime(selectedSlot.time_slot.start_time)} - {formatTime(selectedSlot.time_slot.end_time)}</div>
                            </div>
                          </div>
                          <div className="flex justify-end gap-3">
                            <button onClick={() => setSelectedSlot(null)} className="px-4 py-2 text-gray-600 hover:text-gray-800">
                              Cancel
                            </button>
                            <button onClick={handleAssignment} disabled={assigning} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                              {assigning ? "Assigning..." : "Confirm Assignment"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-center text-sm text-gray-600 gap-2">
                        <Info className="w-4 h-4" />
                        <span>No availability returned yet. Pick a booking from the left.</span>
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Booking</h3>
                <p className="text-gray-600">Choose a booking from the list to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-6 gap-4">
          <div>
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium">{pagination.showing_from}</span> to <span className="font-medium">{pagination.showing_to}</span> of <span className="font-medium">{pagination.total}</span> results
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
                {[10, 20, 50, 100]?.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <span>per page</span>
            </div>

            <div className="flex items-center space-x-2 text-sm">
              <label htmlFor="go-to-page" className="text-gray-700">
                Go to page:
              </label>
              <input
                id="go-to-page"
                type="number"
                min={1}
                max={pagination.total_pages}
                className="w-24 px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder={`${page} / ${pagination.total_pages}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const value = Number((e.target as HTMLInputElement).value)
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
                onClick={() => pagination.has_previous_page && setPage(pagination.previous_page as number)}
                disabled={!pagination.has_previous_page}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => pagination.has_next_page && setPage(pagination.next_page as number)}
                disabled={!pagination.has_next_page}
                className="px-3 py-1 text-sm border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel dialog */}
      <CancelDialog open={showCancel} onClose={() => setShowCancel(false)} onConfirm={handleCancel} />
    </>
  )
}

export default OneTimeServicesAssignment
