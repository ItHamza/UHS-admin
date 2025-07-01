"use client"

import type React from "react"
import type { BookingData, FinalBookingData, User, ServiceOption, LocationOption } from "@/types/new-booking"

interface BookingSummaryProps {
  bookingData: BookingData
  finalBookingData: FinalBookingData
  users: User[]
  services: ServiceOption[]
  subServices: ServiceOption[]
  areas: LocationOption[]
  districts: LocationOption[]
  properties: LocationOption[]
  residenceTypes: any[]
  selectedBundleDetail: any
  timeLeft: number
  onConfirm: () => void
  isLoading: boolean
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({
  bookingData,
  finalBookingData,
  users,
  services,
  subServices,
  areas,
  districts,
  properties,
  residenceTypes,
  selectedBundleDetail,
  timeLeft,
  onConfirm,
  isLoading,
}) => {
  const formatTimeDisplay = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const isFrequencyRecurring = bookingData.frequency !== "one_time" && bookingData.frequency !== ""

  return (
    <div className="space-y-5">
      {/* Timer */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
        <p className="font-medium text-yellow-800">Your booking will expire in:</p>
        <p className="text-3xl font-bold text-red-600">{formatTimeDisplay(timeLeft)}</p>
        <p className="text-sm text-yellow-800">Please confirm your booking within the time limit</p>
      </div>

      <h3 className="text-lg font-semibold border-b pb-2">Booking Summary</h3>

      <div className="space-y-3 text-gray-700">
        {/* Customer Information */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Customer Information</h4>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-gray-500">Name:</span> {bookingData.userName}
            </p>
            <p>
              <span className="text-gray-500">Phone:</span> {bookingData.phoneNumber}
            </p>
            <p>
              <span className="text-gray-500">Email:</span> {bookingData.email}
            </p>
          </div>
        </div>

        {/* Service Details */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Service Details</h4>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-gray-500">Service:</span> {services.find((s) => s.id === bookingData.service)?.name}{" "}
              - {subServices.find((s) => s.id === bookingData.subService)?.name}
            </p>
            <p>
              <span className="text-gray-500">Location:</span> {areas.find((a) => a.id === bookingData.area)?.name},{" "}
              {districts.find((a) => a.id === bookingData.district)?.name}
            </p>
            <p>
              <span className="text-gray-500">Property:</span>{" "}
              {properties.find((a) => a.id === bookingData.property)?.name} -{" "}
              {residenceTypes.find((a) => a.id === bookingData.residenceType)?.type}
            </p>
          </div>
        </div>

        {/* Schedule Information */}
        {bookingData.selectedSubServiceName.toLowerCase().includes("regular") && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Schedule</h4>
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-gray-500">Frequency:</span> {bookingData.frequency}
              </p>
              {isFrequencyRecurring && (
                <p>
                  <span className="text-gray-500">Duration:</span> {bookingData.duration}{" "}
                  {bookingData.duration === "1" ? "month" : "months"}
                </p>
              )}
              <p>
                <span className="text-gray-500">Start Date:</span> {bookingData.startDate}
              </p>
              <p>
                <span className="text-gray-500">End Date:</span> {finalBookingData.endDate}
              </p>
              {selectedBundleDetail && (
                <p>
                  <span className="text-gray-500">Bundle:</span> {selectedBundleDetail.dayCombination?.join(", ")}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Specialized Service Items */}
        {bookingData.selectedSpecializedSubCategories.length > 0 && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Selected Items</h4>
            <div className="space-y-2">
              {bookingData.selectedSpecializedSubCategories.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-500 ml-2">Qty: {item.quantity}</span>
                  </div>
                  <span className="font-medium">
                    {item.currency} {(Number(item.price_per_unit) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Details */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Additional Details</h4>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-gray-500">Apartment:</span> {bookingData.apartmentNumber}
            </p>
            <p>
              <span className="text-gray-500">Present during service:</span> {bookingData.userPresent ? "Yes" : "No"}
            </p>
            {bookingData.specialInstructions && (
              <p>
                <span className="text-gray-500">Special Instructions:</span> {bookingData.specialInstructions}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Button */}
      <button
        onClick={onConfirm}
        disabled={isLoading}
        className={`w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium shadow-md flex items-center justify-center ${
          isLoading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          "Confirm Booking"
        )}
      </button>
    </div>
  )
}
