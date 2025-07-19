"use client"

import type React from "react"
import { useState, useEffect, useTransition, Fragment, useMemo } from "react"
import { Combobox, Dialog, Disclosure, Listbox, Transition } from "@headlessui/react"
import { EyeIcon, FunnelIcon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline"
import type { Booking } from "@/types/booking"
import BookingFilter from "./BookingFilter"
import BookingAction from "@/actions/booking"
import moment from "moment"
import BookingDetail from "./BookingDetail"
import { ChevronDownIcon, XCircleIcon } from "lucide-react"
import { User } from "@/types/new-booking"
import toast from "react-hot-toast"
import { noFocusStyle } from "@/utils/styles"
import { TeamsAction } from "@/actions/team"
import { useQuery } from "@tanstack/react-query"

const BookingsList: React.FC = () => {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  // const [isPending, startTransition] = useTransition()
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchInput, setSearchInput] = useState(''); // local input
  const [search, setSearch] = useState("");
  
  
   // Enhanced filter states
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    service: "all",
    team: "all",
    frequency: "all",
    dateRange: "all",
    amountRange: "all",
  })
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const service_id = ["a2862891-724c-4d9b-8033-c086a3f8a7d4"];

  const { data, isPending } = useQuery<{ data: Booking[], pagination: any }>({
    queryKey: ['bookings', page, itemsPerPage, search],
    queryFn: () => fetch(`/api/booking?page=${page}&limit=${itemsPerPage}&service_id=${service_id}&search=${search}`).then(res => res.json())
  })

  const bookings = data?.data ?? []
  const pagination = data?.pagination ?? {
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
  }

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking)
    setIsDetailOpen(true)
  }

  const handleCloseDetail = () => {
    setIsDetailOpen(false)
    setSelectedBooking(null)
  }

  const handleStatusChange = (status: string) => {
    setFilterStatus(status)
  }

  // Get unique values for filter options
  const getUniqueValues = (key: string) => {
    const values = bookings
      .map((booking) => {
        switch (key) {
          case "service":
            return booking.service?.name
          case "team":
            return booking.team?.name
          case "frequency":
            return booking.frequency
          case "status":
            return booking.status
          default:
            return null
        }
      })
      .filter((value, index, array) => value && array.indexOf(value) === index)

    return values.sort()
  }

  // Enhanced filtering logic
  const filteredBookings = useMemo(() => {
    return bookings
      .filter((booking) => booking.service?.name !== "Deep Cleaning" && booking.service?.name !== "Residential Cleaning")
      .filter((booking) => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const matchesSearch =
          booking.customer.toLowerCase().includes(searchTerm) ||
          booking.booking_number.toLowerCase().includes(searchTerm) ||
          booking.service?.name?.toLowerCase().includes(searchTerm) ||
          booking.team?.name?.toLowerCase().includes(searchTerm)

        if (!matchesSearch) return false
      }

      // Status filter
      if (filters.status !== "all" && booking.status !== filters.status) {
        return false
      }

      // Service filter
      if (filters.service !== "all" && booking.service?.name !== filters.service) {
        return false
      }

      // Team filter
      if (filters.team !== "all" && booking.team?.name !== filters.team) {
        return false
      }

      // Frequency filter
      if (filters.frequency !== "all" && booking.frequency !== filters.frequency) {
        return false
      }

      // Date range filter
      if (filters.dateRange !== "all") {
        const bookingDate = moment(booking.date)
        const now = moment()

        switch (filters.dateRange) {
          case "today":
            if (!bookingDate.isSame(now, "day")) return false
            break
          case "this_week":
            if (!bookingDate.isSame(now, "week")) return false
            break
          case "this_month":
            if (!bookingDate.isSame(now, "month")) return false
            break
          case "last_30_days":
            if (!bookingDate.isAfter(now.clone().subtract(30, "days"))) return false
            break
        }
      }

      // Amount range filter
      if (filters.amountRange !== "all") {
        const amount = booking.total_amount
        switch (filters.amountRange) {
          case "0-100":
            if (amount < 0 || amount > 100) return false
            break
          case "100-500":
            if (amount < 100 || amount > 500) return false
            break
          case "500-1000":
            if (amount < 500 || amount > 1000) return false
            break
          case "1000+":
            if (amount < 1000) return false
            break
        }
      }

      return true
    })
  }, [bookings, filters]);

  // Filter management functions
  const updateFilter = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearAllFilters = () => {
    setFilters({
      search: "",
      status: "all",
      service: "all",
      team: "all",
      frequency: "all",
      dateRange: "all",
      amountRange: "all",
    })
  }

  const getActiveFilterCount = () => {
    return (
      Object.entries(filters).filter(([key, value]) => key !== "search" && value !== "all").length +
      (filters.search ? 1 : 0)
    )
  }

  const getStatusColor = (status: string) => {
    const statusColors = {
      pending: "bg-amber-100 text-amber-800 border-amber-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
      completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
      in_progress: "bg-blue-100 text-blue-800 border-blue-200",
      active: "bg-green-100 text-green-800 border-green-200",
      scheduled: "bg-purple-100 text-purple-800 border-purple-200",
      upcoming: "bg-indigo-100 text-indigo-800 border-indigo-200",
    }
    return statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const formatTime = (timeString: string) => {
    return moment(timeString, "HH:mm:ss").format("h:mm A")
  }

  const formatDate = (dateString: string) => {
    return moment(dateString).format("MMM DD, YYYY")
  }

  const formatCurrency = (amount: number, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  const ShimmerCard = () => (
    <div className="animate-pulse bg-white rounded-lg border border-gray-200 p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 rounded w-24"></div>
          <div className="h-5 bg-gray-300 rounded w-32"></div>
        </div>
        <div className="h-6 bg-gray-300 rounded-full w-20"></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="h-3 bg-gray-300 rounded w-16"></div>
          <div className="h-4 bg-gray-300 rounded w-24"></div>
        </div>
        <div className="space-y-1">
          <div className="h-3 bg-gray-300 rounded w-12"></div>
          <div className="h-4 bg-gray-300 rounded w-20"></div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Package Bookings</h2>
              <p className="text-sm text-gray-600 mt-1">
                Manage complete booking packages with multiple services ({filteredBookings.length} results)
              </p>
            </div>

            {/* Filter Toggle Button */}
            <div className="flex items-center space-x-3">


              {getActiveFilterCount() > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <XCircleIcon className="h-4 w-4 mr-1" />
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchInput}
              placeholder="Search by customer name, phone, email, booking ID, service..."
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setSearch(searchInput);
                }
              }}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />

            {search && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <XCircleIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        {isPending ? (
          <div className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <ShimmerCard key={i} />
              ))}
            </div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["Booking ID", "Customer", "Service", "Period", "Status", "Team", "Amount", "Actions"].map(
                  (header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">#{booking.booking_number}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-indigo-800">
                            {booking.customer.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{booking.customer}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.service?.name}</div>
                    <div className="text-sm text-gray-500">
                      {booking.frequency.charAt(0).toUpperCase() + booking.frequency.slice(1)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(booking.date)}</div>
                    <div className="text-sm text-gray-500">to {formatDate(booking.end_date)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                        booking.status,
                      )}`}
                    >
                      {booking.status.charAt(0).toUpperCase() + booking.status.replaceAll("_", " ").slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.team?.name || "Unassigned"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(booking.total_amount, booking.currency)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewBooking(booking)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden">
        {isPending ? (
          <div className="p-4 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <ShimmerCard key={i} />
            ))}
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-sm font-medium text-gray-900">#{booking.booking_number}</div>
                    <div className="text-lg font-semibold text-gray-900 mt-1">{booking.customer}</div>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                      booking.status,
                    )}`}
                  >
                    {booking.status.charAt(0).toUpperCase() + booking.status.replaceAll("_", " ").slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Service</div>
                    <div className="text-sm font-medium text-gray-900 mt-1">{booking.service?.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Team</div>
                    <div className="text-sm font-medium text-gray-900 mt-1">{booking.team?.name || "Unassigned"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Period</div>
                    <div className="text-sm font-medium text-gray-900 mt-1">
                      {formatDate(booking.date)} - {formatDate(booking.end_date)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Amount</div>
                    <div className="text-sm font-medium text-gray-900 mt-1">
                      {formatCurrency(booking.total_amount, booking.currency)}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleViewBooking(booking)}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  <EyeIcon className="h-4 w-4 mr-2" />
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

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

      {/* Enhanced Booking Detail Sidebar */}
      <Transition.Root show={isDetailOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleCloseDetail}>
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-500"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500/40 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-500 sm:duration-700"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-500 sm:duration-700"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="pointer-events-auto w-screen max-w-2xl">
                    <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                      {selectedBooking && (
                        <BookingDetail
                          booking={selectedBooking}
                          onClose={handleCloseDetail}
                          formatTime={formatTime}
                          formatDate={formatDate}
                          formatCurrency={formatCurrency}
                          getStatusColor={getStatusColor}
                        />
                      )}
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  )
}

export default BookingsList
