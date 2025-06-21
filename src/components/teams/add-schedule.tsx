"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { Fragment } from "react"
import { X, Calendar, Clock, Users, AlertTriangle, CheckCircle } from "lucide-react"
import toast from "react-hot-toast"
import moment from "moment"

interface Team {
  id: string
  name: string
  description?: string
  team_type: "male" | "female" | "hybrid"
  team_number?: string
  ratings?: number
  service_count?: number
  lat?: number
  lng?: number
  members?: any[]
  services?: any[]
  areas?: any[]
  districts?: any[]
  properties?: any[]
  residenceTypes?: any[]
  start_date: string
  work_start_time?: string
  work_end_time?: string
  break_start_time?: string
  break_end_time?: string
  off_days: string | string[]
  created_at: string
}

interface AddScheduleModalProps {
  team: Team
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
}

interface ScheduleData {
  title: string
  description?: string
  schedule_type: "working" | "break" | "transport" | "meeting" | "maintenance" | "training"
  mode: "duration" | "end_date" | "specific_days"
  start_date: string
  start_time: string
  end_time?: string
  end_date?: string
  duration_hours?: number
  duration_minutes?: number
  specific_days: string[]
  repeat_weekly: boolean
  exclude_off_days: boolean
  location?: string
  notes?: string
  priority: "low" | "medium" | "high"
  notify_members: boolean
}

const SCHEDULE_TYPES = [
  { value: "working", label: "Working", color: "bg-blue-100 text-blue-800", icon: "💼" },
  { value: "break", label: "Break", color: "bg-green-100 text-green-800", icon: "☕" },
  { value: "transport", label: "Transport", color: "bg-yellow-100 text-yellow-800", icon: "🚗" },
  { value: "meeting", label: "Meeting", color: "bg-purple-100 text-purple-800", icon: "👥" },
  { value: "training", label: "Training", color: "bg-indigo-100 text-indigo-800", icon: "📚" },
  { value: "maintenance", label: "Maintenance", color: "bg-red-100 text-red-800", icon: "🔧" },
]

const PRIORITY_LEVELS = [
  { value: "low", label: "Low", color: "bg-gray-100 text-gray-800" },
  { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  { value: "high", label: "High", color: "bg-red-100 text-red-800" },
]

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const AddScheduleImproved: React.FC<AddScheduleModalProps> = ({ team, isOpen, onClose, onSubmit }) => {
  const [submitting, setSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [scheduleData, setScheduleData] = useState<ScheduleData>({
    title: "",
    description: "",
    schedule_type: "working",
    mode: "duration",
    start_date: moment().format("YYYY-MM-DD"),
    start_time: team.work_start_time || "09:00",
    end_time: team.work_end_time || "17:00",
    end_date: "",
    duration_hours: 8,
    duration_minutes: 0,
    specific_days: [],
    repeat_weekly: true,
    exclude_off_days: true,
    location: "",
    notes: "",
    priority: "medium",
    notify_members: true,
  })

  const normalizeOffDays = (off_days: any): string[] => {
    return Array.isArray(off_days) ? off_days : off_days ? [off_days] : []
  }

  const getScheduleTypeInfo = (type: string) => {
    return SCHEDULE_TYPES.find((t) => t.value === type) || SCHEDULE_TYPES[0]
  }

  const calculateDuration = () => {
    if (scheduleData.start_time && scheduleData.end_time) {
      const start = moment(scheduleData.start_time, "HH:mm")
      const end = moment(scheduleData.end_time, "HH:mm")
      const duration = moment.duration(end.diff(start))
      return `${Math.floor(duration.asHours())}h ${duration.minutes()}m`
    }
    return ""
  }

  const validateSchedule = (): string[] => {
    const errors: string[] = []

    if (!scheduleData.title.trim()) {
      errors.push("Schedule title is required")
    }

    if (!scheduleData.start_date) {
      errors.push("Start date is required")
    }

    if (!scheduleData.start_time) {
      errors.push("Start time is required")
    }

    if (scheduleData.mode === "end_date") {
      if (!scheduleData.end_date) {
        errors.push("End date is required for this mode")
      } else if (moment(scheduleData.end_date).isBefore(moment(scheduleData.start_date))) {
        errors.push("End date cannot be before start date")
      }
      if (!scheduleData.end_time) {
        errors.push("End time is required for end date mode")
      }
    }

    if (scheduleData.mode === "specific_days" && scheduleData.specific_days.length === 0) {
      errors.push("Please select at least one day")
    }

    if (scheduleData.start_time && scheduleData.end_time) {
      const start = moment(scheduleData.start_time, "HH:mm")
      const end = moment(scheduleData.end_time, "HH:mm")
      if (end.isSameOrBefore(start)) {
        errors.push("End time must be after start time")
      }
    }

    // Check for conflicts with team off days
    if (scheduleData.mode === "specific_days" && scheduleData.exclude_off_days) {
      const teamOffDays = normalizeOffDays(team.off_days)
      const conflictDays = scheduleData.specific_days.filter((day) => teamOffDays.includes(day))
      if (conflictDays.length > 0) {
        errors.push(`Selected days conflict with team off days: ${conflictDays.join(", ")}`)
      }
    }

    return errors
  }

  const handleDayToggle = (day: string) => {
    setScheduleData((prev) => ({
      ...prev,
      specific_days: prev.specific_days.includes(day)
        ? prev.specific_days.filter((d) => d !== day)
        : [...prev.specific_days, day],
    }))
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      setValidationErrors([])

      const errors = validateSchedule()
      if (errors.length > 0) {
        setValidationErrors(errors)
        return
      }

      // Here you would typically call your API to create the schedule
      // const result = await CreateScheduleAction({
      //   team_id: team.id,
      //   ...scheduleData
      // })

      console.log("Creating schedule:", {
        team_id: team.id,
        ...scheduleData,
      })

      toast.success("Schedule created successfully!")
      onSubmit()
    } catch (error: any) {
      console.error("Error creating schedule:", error)
      toast.error(error.message || "Failed to create schedule")
    } finally {
      setSubmitting(false)
    }
  }

  const renderModeContent = () => {
    switch (scheduleData.mode) {
      case "duration":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  value={scheduleData.start_time}
                  onChange={(e) => setScheduleData((prev) => ({ ...prev, start_time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <div className="flex gap-2">
                  <div className="flex items-center">
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={scheduleData.duration_hours || 0}
                      onChange={(e) =>
                        setScheduleData((prev) => ({ ...prev, duration_hours: Number.parseInt(e.target.value) || 0 }))
                      }
                      className="w-16 px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="ml-1 text-sm text-gray-500">h</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={scheduleData.duration_minutes || 0}
                      onChange={(e) =>
                        setScheduleData((prev) => ({ ...prev, duration_minutes: Number.parseInt(e.target.value) || 0 }))
                      }
                      className="w-16 px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="ml-1 text-sm text-gray-500">m</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case "end_date":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  value={scheduleData.start_time}
                  onChange={(e) => setScheduleData((prev) => ({ ...prev, start_time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  value={scheduleData.end_time || ""}
                  onChange={(e) => setScheduleData((prev) => ({ ...prev, end_time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={scheduleData.end_date || ""}
                onChange={(e) => setScheduleData((prev) => ({ ...prev, end_date: e.target.value }))}
                min={scheduleData.start_date}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {scheduleData.start_time && scheduleData.end_time && (
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-blue-800">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Daily duration: {calculateDuration()}
                </p>
              </div>
            )}
          </div>
        )

      case "specific_days":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  value={scheduleData.start_time}
                  onChange={(e) => setScheduleData((prev) => ({ ...prev, start_time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  value={scheduleData.end_time || ""}
                  onChange={(e) => setScheduleData((prev) => ({ ...prev, end_time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Days</label>
              <div className="grid grid-cols-2 gap-2">
                {DAYS_OF_WEEK.map((day) => {
                  const isOffDay = normalizeOffDays(team.off_days).includes(day)
                  return (
                    <div key={day} className="flex items-center space-x-2">
                      <input
                        id={`day-${day}`}
                        type="checkbox"
                        checked={scheduleData.specific_days.includes(day)}
                        onChange={() => handleDayToggle(day)}
                        disabled={scheduleData.exclude_off_days && isOffDay}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                      />
                      <label
                        htmlFor={`day-${day}`}
                        className={`text-sm ${
                          scheduleData.exclude_off_days && isOffDay ? "text-gray-400 line-through" : "text-gray-700"
                        }`}
                      >
                        {day}
                        {isOffDay && <span className="ml-1 text-xs text-red-500">(Off Day)</span>}
                      </label>
                    </div>
                  )
                })}
              </div>
            </div>

            {scheduleData.specific_days.length > 0 && scheduleData.start_time && scheduleData.end_time && (
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm text-blue-800">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Selected: {scheduleData.specific_days.join(", ")} • Duration: {calculateDuration()}
                </p>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-white">
                        Add Schedule for {team.name}
                      </Dialog.Title>
                      <p className="text-blue-100 text-sm">#{team.team_number}</p>
                    </div>
                    <button
                      onClick={onClose}
                      className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                  <div className="px-6 py-4 bg-red-50 border-b border-red-200">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-2" />
                      <div>
                        <h4 className="text-sm font-medium text-red-800">Please fix the following errors:</h4>
                        <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                          {validationErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Team Context */}
                <div className="px-6 py-4 bg-gray-50 border-b">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-gray-600">
                        Default: {team.work_start_time} - {team.work_end_time}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-gray-600">{team.members?.length || 0} members</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-gray-600">
                        Off days:{" "}
                        {normalizeOffDays(team.off_days).length > 0
                          ? normalizeOffDays(team.off_days).join(", ")
                          : "None"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Form Content */}
                <div className="px-6 py-6 space-y-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Title *</label>
                      <input
                        type="text"
                        value={scheduleData.title}
                        onChange={(e) => setScheduleData((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Morning Shift, Team Meeting"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                      <textarea
                        value={scheduleData.description || ""}
                        onChange={(e) => setScheduleData((prev) => ({ ...prev, description: e.target.value }))}
                        rows={2}
                        placeholder="Additional details about this schedule"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Type</label>
                        <div className="grid grid-cols-2 gap-2">
                          {SCHEDULE_TYPES.map((type) => (
                            <button
                              key={type.value}
                              type="button"
                              onClick={() => setScheduleData((prev) => ({ ...prev, schedule_type: type.value as any }))}
                              className={`p-3 border rounded-lg text-left transition-colors ${
                                scheduleData.schedule_type === type.value
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-gray-300 hover:border-gray-400"
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{type.icon}</span>
                                <span className="font-medium text-sm">{type.label}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                        <div className="space-y-2">
                          {PRIORITY_LEVELS.map((priority) => (
                            <label key={priority.value} className="flex items-center">
                              <input
                                type="radio"
                                name="priority"
                                value={priority.value}
                                checked={scheduleData.priority === priority.value}
                                onChange={(e) =>
                                  setScheduleData((prev) => ({ ...prev, priority: e.target.value as any }))
                                }
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${priority.color}`}>
                                {priority.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Date and Mode */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                      <input
                        type="date"
                        value={scheduleData.start_date}
                        onChange={(e) => setScheduleData((prev) => ({ ...prev, start_date: e.target.value }))}
                        min={moment().format("YYYY-MM-DD")}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Mode</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setScheduleData((prev) => ({ ...prev, mode: "duration" }))}
                          className={`p-3 border rounded-lg text-left transition-colors ${
                            scheduleData.mode === "duration"
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          <div className="font-medium text-sm">Duration</div>
                          <div className="text-xs text-gray-500">Set specific duration</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setScheduleData((prev) => ({ ...prev, mode: "end_date" }))}
                          className={`p-3 border rounded-lg text-left transition-colors ${
                            scheduleData.mode === "end_date"
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          <div className="font-medium text-sm">End Date</div>
                          <div className="text-xs text-gray-500">Set end date</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setScheduleData((prev) => ({ ...prev, mode: "specific_days" }))}
                          className={`p-3 border rounded-lg text-left transition-colors ${
                            scheduleData.mode === "specific_days"
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          <div className="font-medium text-sm">Specific Days</div>
                          <div className="text-xs text-gray-500">Choose days</div>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Mode-specific content */}
                  {renderModeContent()}

                  {/* Options */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        id="repeat_weekly"
                        type="checkbox"
                        checked={scheduleData.repeat_weekly}
                        onChange={(e) => setScheduleData((prev) => ({ ...prev, repeat_weekly: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="repeat_weekly" className="text-sm text-gray-700">
                        Repeat weekly
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        id="exclude_off_days"
                        type="checkbox"
                        checked={scheduleData.exclude_off_days}
                        onChange={(e) => setScheduleData((prev) => ({ ...prev, exclude_off_days: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="exclude_off_days" className="text-sm text-gray-700">
                        Exclude team off days
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        id="notify_members"
                        type="checkbox"
                        checked={scheduleData.notify_members}
                        onChange={(e) => setScheduleData((prev) => ({ ...prev, notify_members: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="notify_members" className="text-sm text-gray-700">
                        Notify team members
                      </label>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location (Optional)</label>
                      <input
                        type="text"
                        value={scheduleData.location || ""}
                        onChange={(e) => setScheduleData((prev) => ({ ...prev, location: e.target.value }))}
                        placeholder="Meeting room, site address, etc."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                      <textarea
                        value={scheduleData.notes || ""}
                        onChange={(e) => setScheduleData((prev) => ({ ...prev, notes: e.target.value }))}
                        rows={2}
                        placeholder="Additional notes or instructions"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between px-6 py-4 border-t bg-gray-50">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!scheduleData.title.trim() || submitting}
                    className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                      scheduleData.title.trim() && !submitting
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-blue-400 cursor-not-allowed"
                    }`}
                  >
                    {submitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Create Schedule
                      </div>
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export default AddScheduleImproved
