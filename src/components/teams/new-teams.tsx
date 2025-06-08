"use client"

import React, { useState, Fragment, useEffect } from "react"
import { Dialog, Transition } from "@headlessui/react"
import DatePicker from "react-datepicker"
import toast from "react-hot-toast"
import {
  PlusIcon,
  XMarkIcon,
  UsersIcon,
  CalendarIcon,
  MapPinIcon,
  CogIcon,
} from "@heroicons/react/24/outline"
import "react-datepicker/dist/react-datepicker.css"
import AreaAction from "@/actions/area"
import DistrictAction from "@/actions/district"
import { PlusCircleIcon } from "lucide-react"

interface TeamMember {
  id: string
  name: string
  email: string
  phone: string
  role: string
  isExisting: boolean
}

interface TeamData {
  teamName: string
  teamType: string
  members: TeamMember[]
  services: string[]
  location: {
    area: string
    district: string
  }
  startingDate: Date | null
  workingHours: {
    start: string
    end: string
  }
  breakTime: {
    start: string
    end: string
  }
  daysOff: string[]
}

const SERVICES = ["Regular", "Deep", "Special"]

const AREAS = [
  { id: "area1", name: "The Pearl Island" },
  { id: "area2", name: "Doha City" },
  { id: "area3", name: "Lusail" },
]

const DISTRICTS = [
  { id: "district1", name: "District 1" },
  { id: "district2", name: "District 2" },
  { id: "district3", name: "District 3" },
  { id: "district4", name: "District 4" },
]

const TEAM_TYPES = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "hybrid", label: "Hybrid" },
]
const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

// Mock existing members data
const EXISTING_MEMBERS = [
  { id: "1", name: "John Doe", email: "john@example.com", phone: "+1234567890", role: "cleaner" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", phone: "+1234567891", role: "cleaner" },
  { id: "3", name: "Mike Johnson", email: "mike@example.com", phone: "+1234567892", role: "cleaner" },
]



export default function TeamCreationModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5
  const [areas, setAreas] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  
  const fetchArea = async () => {
    try {
      const area = await AreaAction();
      setAreas(area);
    } catch (error) {
      console.log("error", error);
    } finally {
    }
  };

  const fetchDistrict = async (area: string) => {
    try {
      const district = await DistrictAction(area);
      setDistricts(district);
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
  if (currentStep === 4 && areas.length === 0) {
    fetchArea();
  }
}, [currentStep]);

  const [teamData, setTeamData] = useState<TeamData>({
    teamName: "",
    teamType: "",
    members: [],
    services: [],
    location: { area: "", district: "" },
    startingDate: null,
    workingHours: { start: "", end: "" },
    breakTime: { start: "", end: "" },
    daysOff: [],
  })

  const [showCreateMember, setShowCreateMember] = useState(false)
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    phone: "",
    role: "cleaner",
  })

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleAddExistingMember = (member: (typeof EXISTING_MEMBERS)[0]) => {
    const teamMember: TeamMember = {
      ...member,
      isExisting: true,
    }
    setTeamData((prev) => ({
      ...prev,
      members: [...prev.members, teamMember],
    }))
    toast.success(`${member.name} added to team`)
  }

  const handleCreateAndAddMember = () => {
    if (newMember.name && newMember.email) {
      const teamMember: TeamMember = {
        id: Date.now().toString(),
        ...newMember,
        isExisting: false,
      }
      setTeamData((prev) => ({
        ...prev,
        members: [...prev.members, teamMember],
      }))
      setNewMember({ name: "", email: "", phone: "", role: "cleaner" })
      setShowCreateMember(false)
      toast.success(`${teamMember.name} created and added to team`)
    }
  }

  const handleRemoveMember = (memberId: string) => {
    const member = teamData.members.find((m) => m.id === memberId)
    setTeamData((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.id !== memberId),
    }))
    if (member) {
      toast.success(`${member.name} removed from team`)
    }
  }

  const handleServiceToggle = (service: string) => {
    setTeamData((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }))
  }

  const handleDayOffToggle = (day: string) => {
    setTeamData((prev) => ({
      ...prev,
      daysOff: prev.daysOff.includes(day) ? prev.daysOff.filter((d) => d !== day) : [...prev.daysOff, day],
    }))
  }

  const resetModal = () => {
    setCurrentStep(1)
    setTeamData({
      teamName: "",
      teamType: "",
      members: [],
      services: [],
      location: { area: "", district: "" },
      startingDate: null,
      workingHours: { start: "", end: "" },
      breakTime: { start: "", end: "" },
      daysOff: [],
    })
    setShowCreateMember(false)
    setNewMember({ name: "", email: "", phone: "", role: "cleaner" })
  }

  const handleSubmit = () => {
    console.log("Team Data:", teamData)
    toast.success("Team created successfully!")
    setIsOpen(false)
    resetModal()
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8 px-4">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <React.Fragment key={index}>
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium border-2
              ${
                index + 1 === currentStep
                  ? "bg-white text-blue-700 border-white"
                  : index + 1 < currentStep
                    ? "bg-green-400 text-white border-white"
                    : "bg-blue-500 text-white border-white border-opacity-50"
              }`}
          >
            {index + 1 < currentStep ? "✓" : index + 1}
          </div>
          {index < totalSteps - 1 && (
            <div
              className={`h-1 flex-1 mx-1 ${index + 1 < currentStep ? "bg-green-400" : "bg-blue-500 bg-opacity-50"}`}
            ></div>
          )}
        </React.Fragment>
      ))}
    </div>
  )

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <UsersIcon className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Team Information</h3>
        <p className="text-sm text-gray-600">Set up your team name and type</p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-1">
            Team Name
          </label>
          <input
            id="teamName"
            type="text"
            value={teamData.teamName}
            onChange={(e) => setTeamData((prev) => ({ ...prev, teamName: e.target.value }))}
            placeholder="Enter team name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="teamType" className="block text-sm font-medium text-gray-700 mb-1">
            Team Type
          </label>
          <select
            name="teamType"
            value={teamData.teamType}
            onChange={(e) =>
              setTeamData((prev) => ({
                ...prev,
                teamType: e.target.value,
              }))
            }
            className="w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition"
            required
          >
            <option value="">Select team type</option>
            {TEAM_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <UsersIcon className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Team Members</h3>
        <p className="text-sm text-gray-600">Add existing members or create new ones</p>
      </div>

      {/* Selected Members */}
      {teamData.members.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Selected Members ({teamData.members.length})
          </label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {teamData.members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <span className="font-medium">{member.name}</span>
                  <span className="text-sm text-gray-500 ml-2">({member.email})</span>
                  {!member.isExisting && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ml-2">
                      New
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveMember(member.id)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Existing Members */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Add Existing Members</label>
        <div className="grid gap-2 max-h-40 overflow-y-auto">
          {EXISTING_MEMBERS.filter((member) => !teamData.members.some((tm) => tm.id === member.id)).map((member) => (
            <div key={member.id} className="flex items-center justify-between p-2 border rounded">
              <div>
                <span className="font-medium">{member.name}</span>
                <span className="text-sm text-gray-500 ml-2">({member.email})</span>
              </div>
              <button
                type="button"
                onClick={() => handleAddExistingMember(member)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Create New Member */}
      <div className="space-y-2">
        {!showCreateMember ? (
          <button
            type="button"
            onClick={() => setShowCreateMember(true)}
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create New Member
          </button>
        ) : (
          <div className="border rounded-lg p-4 bg-white">
            <h4 className="text-sm font-medium mb-3">Create New Member</h4>
            <div className="space-y-3">
              <div>
                <label htmlFor="newMemberName" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  id="newMemberName"
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="newMemberEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="newMemberEmail"
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="newMemberPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  id="newMemberPhone"
                  type="text"
                  value={newMember.phone}
                  onChange={(e) => setNewMember((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCreateAndAddMember}
                  className="flex-1 inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create & Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateMember(false)}
                  className="flex-1 inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CogIcon className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Assign Services</h3>
        <p className="text-sm text-gray-600">Select the services this team will provide</p>
      </div>

      <div className="space-y-3">
        {SERVICES.map((service) => (
          <div key={service} className="flex items-center space-x-2">
            <input
              id={service}
              type="checkbox"
              checked={teamData.services.includes(service)}
              onChange={() => handleServiceToggle(service)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor={service} className="text-sm font-medium text-gray-700">
              {service} Cleaning
            </label>
          </div>
        ))}
      </div>

      {teamData.services.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Selected Services:</label>
          <div className="flex flex-wrap gap-2">
            {teamData.services.map((service) => (
              <span
                key={service}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {service}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <MapPinIcon className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Assign Location</h3>
        <p className="text-sm text-gray-600">Set the area and district for this team</p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">
            Area
          </label>
          <select
            name="area"
            value={teamData.location.area}
            onChange={(e) => {
              setTeamData((prev) => ({
                ...prev,
                location: { ...prev.location, area: e.target.value },
              }));
              fetchDistrict(e.target.value)
            }}
            className="w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition"
            required
          >
            <option value="">Select area</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
            District
          </label>
          <select
            name="district"
            value={teamData.location.district}
            onChange={(e) =>
              setTeamData((prev) => ({
                ...prev,
                location: { ...prev.location, district: e.target.value },
              }))
            }
            className="w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition"
            required
          >
            <option value="">Select district</option>
            {DISTRICTS.map((district) => (
              <option key={district.id} value={district.id}>
                {district.name}
              </option>
            ))}
          </select>

        </div>
      </div>
    </div>
  )

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CalendarIcon className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Schedule & Working Hours</h3>
        <p className="text-sm text-gray-600">Set up the team's working schedule</p>
      </div>

      <div className="space-y-6">
        {/* Starting Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Starting Date</label>
          <DatePicker
            selected={teamData.startingDate}
            onChange={(date) => setTeamData((prev) => ({ ...prev, startingDate: date }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholderText="Select starting date"
            dateFormat="yyyy-MM-dd"
          />
        </div>

        {/* Working Hours */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Working Hours</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="workStart" className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                id="workStart"
                type="time"
                value={teamData.workingHours.start}
                onChange={(e) =>
                  setTeamData((prev) => ({
                    ...prev,
                    workingHours: { ...prev.workingHours, start: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="workEnd" className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                id="workEnd"
                type="time"
                value={teamData.workingHours.end}
                onChange={(e) =>
                  setTeamData((prev) => ({
                    ...prev,
                    workingHours: { ...prev.workingHours, end: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Break Time */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Break Time</label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="breakStart" className="block text-sm font-medium text-gray-700 mb-1">
                Start
              </label>
              <input
                id="breakStart"
                type="time"
                value={teamData.breakTime.start}
                onChange={(e) =>
                  setTeamData((prev) => ({
                    ...prev,
                    breakTime: { ...prev.breakTime, start: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="breakEnd" className="block text-sm font-medium text-gray-700 mb-1">
                End
              </label>
              <input
                id="breakEnd"
                type="time"
                value={teamData.breakTime.end}
                onChange={(e) =>
                  setTeamData((prev) => ({
                    ...prev,
                    breakTime: { ...prev.breakTime, end: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Days Off */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Days Off</label>
          <div className="grid grid-cols-2 gap-2">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day} className="flex items-center space-x-2">
                <input
                  id={day}
                  type="checkbox"
                  checked={teamData.daysOff.includes(day)}
                  onChange={() => handleDayOffToggle(day)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={day} className="text-sm text-gray-700">
                  {day}
                </label>
              </div>
            ))}
          </div>
          {teamData.daysOff.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {teamData.daysOff.map((day) => (
                <span
                  key={day}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-gray-300 text-gray-700"
                >
                  {day}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1()
      case 2:
        return renderStep2()
      case 3:
        return renderStep3()
      case 4:
        return renderStep4()
      case 5:
        return renderStep5()
      default:
        return renderStep1()
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return teamData.teamName && teamData.teamType
      case 2:
        return teamData.members.length > 0
      case 3:
        return teamData.services.length > 0
      case 4:
        return teamData.location.area && teamData.location.district
      case 5:
        return teamData.startingDate && teamData.workingHours.start && teamData.workingHours.end
      default:
        return false
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <PlusCircleIcon className='w-5 h-5 mr-2' />
        New Team
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
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
                  <div className="bg-blue-600 px-6 pt-6 pb-4 text-white">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-white mb-4">
                      Create New Team
                    </Dialog.Title>
                    {renderStepIndicator()}
                  </div>

                  <div className="px-6 py-6">{renderCurrentStep()}</div>

                  <div className="flex justify-between px-6 py-4 border-t bg-gray-50">
                    <button
                      type="button"
                      onClick={handlePrevious}
                      disabled={currentStep === 1}
                      className={`inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md ${
                        currentStep === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      }`}
                    >
                      Previous
                    </button>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpen(false)
                          resetModal()
                        }}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Cancel
                      </button>

                      {currentStep === totalSteps ? (
                        <button
                          type="button"
                          onClick={handleSubmit}
                          disabled={!isStepValid()}
                          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                            isStepValid()
                              ? "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              : "bg-blue-400 cursor-not-allowed"
                          }`}
                        >
                          Create Team
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleNext}
                          disabled={!isStepValid()}
                          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                            isStepValid()
                              ? "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              : "bg-blue-400 cursor-not-allowed"
                          }`}
                        >
                          Next
                        </button>
                      )}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
