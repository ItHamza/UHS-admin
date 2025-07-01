"use client"

import type React from "react"
import { Check, Clock, Calendar } from "lucide-react"
import type { BookingData } from "@/types/new-booking"

interface TimeSlotSelectionProps {
  bookingData: BookingData
  setBookingData: React.Dispatch<React.SetStateAction<BookingData>>
  selectedBundleDetail: any
  selectedTimeSlots: any[]
  setSelectedTimeSlots: (slots: any[]) => void
  renewalSlots: any[]
  setRenewalSlots: (slots: any[]) => void
  onTimeSlotSelect: (day: string, index: number) => void
  frequencyNumberMapping: Record<string, number>
}

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(":")
  const hour = Number.parseInt(hours)
  const ampm = hour >= 12 ? "PM" : "AM"
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

export const TimeSlotSelection: React.FC<TimeSlotSelectionProps> = ({
  bookingData,
  setBookingData,
  selectedBundleDetail,
  selectedTimeSlots,
  setSelectedTimeSlots,
  renewalSlots,
  setRenewalSlots,
  onTimeSlotSelect,
  frequencyNumberMapping,
}) => {
  const getSliceEndIndex = () => {
    return frequencyNumberMapping[bookingData.frequency] || 1
  }

  const renderTimeSlotSection = (day: string, dayLabel: string, index: number) => {
    const bookingDay = selectedBundleDetail?.booking?.find((b: any) => b.day === day)

    if (!bookingDay || !bookingDay.timeSlots || bookingDay.timeSlots.length === 0) {
      return (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6" key={index}>
          <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-800">{dayLabel}*</h3>
          <p className="text-gray-500">No time slots available for {dayLabel}</p>
        </div>
      )
    }

    return (
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6" key={index}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">
            {dayLabel}* ({bookingDay.timeSlots.length} slots)
          </h3>
          {selectedTimeSlots.some(
            (slot) => new Date(slot.date).toDateString() === new Date(bookingDay.date).toDateString(),
          ) ? (
            <div className="flex items-center text-green-600">
              <Check className="w-4 h-4 mr-1" />
              <span className="text-xs font-medium">Selected</span>
            </div>
          ) : (
            <div className="text-xs text-orange-500 font-medium">Please select</div>
          )}
        </div>
        <p className="text-xs text-gray-500 mb-4">Select one time slot for {dayLabel}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {bookingDay.timeSlots.map((slot: any, idx: number) => {
            const isSelected = selectedTimeSlots.some(
              (selected: any) =>
                selected.start_time === `${slot.startTime}:00` &&
                selected.end_time === `${slot.endTime}:00` &&
                selected.date === slot.date,
            )

            return (
              <button
                key={idx}
                className={`p-3 border rounded-xl text-center transition-all duration-200 shadow-sm hover:shadow-md min-h-[60px] ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => onTimeSlotSelect(day, idx)}
              >
                <div className="font-medium text-sm text-gray-700">
                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                  <div className="text-xs text-gray-500 mt-1">{slot.date}</div>
                </div>

                {isSelected && (
                  <div className="flex justify-center mt-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  if (!selectedBundleDetail) {
    return (
      <div className="text-center py-8">
        <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Bundle Selected</h3>
        <p className="text-gray-600">Please go back and select a cleaning package first.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Select Time Slots</h3>
          <p className="text-sm text-gray-600">Choose one time slot for each day of service</p>
        </div>
        <div className="bg-blue-50 px-3 py-2 rounded-lg">
          <span className="text-sm font-medium text-blue-800">
            {selectedTimeSlots.length} / {getSliceEndIndex()} selected
          </span>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center mb-2">
          <Calendar className="w-4 h-4 text-blue-600 mr-2" />
          <span className="font-medium text-gray-900">Selected Package</span>
        </div>
        <p className="text-sm text-gray-600">
          {selectedBundleDetail.dayCombination?.join(", ")} • {selectedBundleDetail.booking?.length || 0} booking days
        </p>
      </div>

      {selectedBundleDetail.booking && selectedBundleDetail.booking.length > 0 ? (
        <div className="space-y-6">
          {selectedBundleDetail.dayCombination
            .slice(0, getSliceEndIndex())
            .map((day: string, idx: number) => renderTimeSlotSection(day, day, idx))}
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">No booking days found for this bundle.</p>
        </div>
      )}

      {/* Special Instructions */}
      <div className="space-y-3 pt-4 border-t">
        <label className="block font-medium text-gray-700">Special Instructions (Optional)</label>
        <textarea
          name="specialInstructions"
          value={bookingData.specialInstructions}
          onChange={(e) => {
            setBookingData((prev) => ({
                ...prev,
                specialInstructions: e.target.value,
              }))
          }}
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Any special instructions for the cleaning team..."
        />
      </div>
    </div>
  )
}
