"use client"

import type React from "react"
import { useState, useEffect, useTransition, Fragment } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { EyeIcon } from "@heroicons/react/24/outline"
import type { Booking } from "@/types/booking"
import BookingFilter from "./BookingFilter"
import BookingAction from "@/actions/booking"
import moment from "moment"
import BookingDetail from "./BookingDetail"

const BookingsList: React.FC = () => {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    startTransition(async () => {
      try {
        const data = await BookingAction()
        console.log("bookingdata", data)
        setBookings(data)
      } catch (error) {
        console.error("Failed to fetch bookings:", error)
      }
    })
  }, [])

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

  const filteredBookings =
    filterStatus === "all"
      ? bookings.filter(
          (booking) => booking.service?.name != "Deep Cleaning" && booking.service?.name != "Residential Cleaning",
        )
      : bookings.filter(
          (booking) =>
            booking.status === filterStatus &&
            booking.service?.name != "Deep Cleaning" &&
            booking.service?.name != "Residential Cleaning",
        )

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Bookings</h2>
            <p className="text-sm text-gray-600 mt-1">Manage and view all your bookings</p>
          </div>
          {!isPending && (
            <BookingFilter
              currentFilter={filterStatus}
              onFilterChange={handleStatusChange}
              bookingCount={filteredBookings.length}
            />
          )}
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
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            disabled
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-500 bg-white cursor-not-allowed"
          >
            Previous
          </button>
          <button
            disabled
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-500 bg-white cursor-not-allowed"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to{" "}
              <span className="font-medium">{filteredBookings.length}</span> of{" "}
              <span className="font-medium">{filteredBookings.length}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                disabled
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 cursor-not-allowed"
              >
                Previous
              </button>
              <button
                disabled
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 cursor-not-allowed"
              >
                Next
              </button>
            </nav>
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
