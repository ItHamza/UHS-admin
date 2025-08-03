"use client"

import type React from "react"
import moment from "moment"
import type { BookingData } from "@/types/new-booking"
import CustomDatePicker from "@/components/ui/custom-date-picker"
import { noFocusStyle } from "@/utils/styles"

interface ScheduleDetailsProps {
  bookingData: BookingData
  setBookingData: React.Dispatch<React.SetStateAction<BookingData>>
  frequencies: any[]
  teams: any[]
  calendar: Date[]
  isLoading: boolean
}

const durations = [1, 3, 6, 12]

export const ScheduleDetails: React.FC<ScheduleDetailsProps> = ({
  bookingData,
  setBookingData,
  frequencies,
  teams,
  calendar,
  isLoading,
}) => {
  const isFrequencyRecurring = bookingData.frequency !== "one_time" && bookingData.frequency !== ""
  const isRegularService = bookingData.selectedSubServiceName.toLowerCase().includes("regular")

  const handleFrequencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setBookingData((prev) => ({
      ...prev,
      frequency: value,
      duration: value === "one_time" ? "1" : "", // reset duration if not one-time
    }))
  }

  const handleDurationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setBookingData((prev) => ({
      ...prev,
      duration: value,
    }))
  }

  const handleTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setBookingData((prev) => ({
      ...prev,
      teamId: value,
    }))
  }

  if (!isRegularService) {
    return (
      <div className="space-y-5">
        <h3 className="text-lg font-medium text-gray-900">Schedule Details</h3>

        <div className="space-y-3">
          <label className="block font-medium text-gray-700">Select Start Date *</label>
          <CustomDatePicker
            startDate={moment().toDate()}
            maxDate={moment().add(1, "months").toDate()}
            setStartDate={(date: any) => {
              setBookingData((prev) => ({
                ...prev,
                startDate: moment(date).format("YYYY-MM-DD"),
              }))
            }}
            unavailableDates={calendar}
            minDate={moment().toDate()}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-medium text-gray-900">Schedule Details</h3>

      {/* Frequency Selection */}
      <div className="space-y-3">
        <label className="block font-medium text-gray-700">Select Frequency *</label>
        <select
          name="frequency"
          value={bookingData.frequency}
          onChange={handleFrequencyChange}
          className={`w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition ${noFocusStyle}`}
          required
        >
          <option value="">Select frequency</option>
          {frequencies.map((frequency) => (
            <option key={frequency.id} value={frequency.id}>
              {frequency.label}
            </option>
          ))}
        </select>
      </div>

      {/* Duration Selection */}
      {isFrequencyRecurring && (
        <div className="space-y-3">
          <label className="block font-medium text-gray-700">Select Duration (months) *</label>
          <select
            name="duration"
            value={bookingData.duration}
            onChange={handleDurationChange}
            className={`w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition ${noFocusStyle}`}
            required
          >
            <option value="">Select duration</option>
            {durations.map((duration) => (
              <option key={duration} value={duration.toString()}>
                {duration} {duration === 1 ? "month" : "months"}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Team Selection */}
      <div className="space-y-3">
        <label className="block font-medium text-gray-700">Select Team *</label>
        <select
          name="Team"
          value={bookingData.teamId}
          onChange={handleTeamChange}
          className={`w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition ${noFocusStyle}`}
          required
        >
          <option value="">Select Team</option>
          {teams.map((team: any) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>

      {/* Start Date Selection */}
      <div className="space-y-3">
        <label className="block font-medium text-gray-700">Select Start Date *</label>
        {bookingData.frequency && (isFrequencyRecurring ? bookingData.duration : true) ? (
          <CustomDatePicker
            startDate={moment().toDate()}
            maxDate={moment()
              .add( 20, "days")
              .toDate()}
            setStartDate={(date: any) => {
              setBookingData((prev) => ({
                ...prev,
                startDate: moment(date).format("YYYY-MM-DD"),
              }))
            }}
            unavailableDates={calendar}
            minDate={moment().toDate()}
          />
        ) : (
          <div className="p-3 text-gray-500 border border-gray-200 rounded-lg">
            {!bookingData.frequency ? "Select a frequency first" : "Select duration first"}
          </div>
        )}
      </div>
    </div>
  )
}
