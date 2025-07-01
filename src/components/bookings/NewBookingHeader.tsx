"use client"

import type React from "react"
import { useState } from "react"
import { ArrowDownTrayIcon, PlusCircleIcon } from "@heroicons/react/24/outline"
import { BookingDialog } from "./booking/booking-dailog"

const NewBookingsHeader: React.FC = () => {
  const [showBookingDialog, setShowBookingDialog] = useState(false)

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Bookings</h1>
          <p className="text-gray-600">Manage your bookings database and view detailed booking information</p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center transition">
            <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
            Export
          </button>
          <button
            onClick={() => setShowBookingDialog(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transition"
          >
            <PlusCircleIcon className="w-5 h-5 mr-2" />
            New Booking
          </button>
        </div>
      </div>

      <BookingDialog isOpen={showBookingDialog} onClose={() => setShowBookingDialog(false)} />
    </div>
  )
}

export default NewBookingsHeader
