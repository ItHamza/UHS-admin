"use client"

import type React from "react"
import { Combobox } from "@headlessui/react"
import type { User, BookingData } from "@/types/new-booking"
import { noFocusStyle } from "@/utils/styles"

interface CustomerSelectionProps {
  users: User[]
  selectedUserId: string | null
  setSelectedUserId: (id: string | null) => void
  bookingData: BookingData
  setBookingData: React.Dispatch<React.SetStateAction<BookingData>>
  isCreatingNewUser: boolean
  setIsCreatingNewUser: (creating: boolean) => void
  query: string
  setQuery: (query: string) => void
  onUserChange: (user: User) => void
}

export const CustomerSelection: React.FC<CustomerSelectionProps> = ({
  users,
  selectedUserId,
  setSelectedUserId,
  bookingData,
  setBookingData,
  isCreatingNewUser,
  setIsCreatingNewUser,
  query,
  setQuery,
  onUserChange,
}) => {
  const filteredUsers =
    query === "" ? users : users.filter((u) => `${u.name} ${u.phone}`.toLowerCase().includes(query.toLowerCase()))

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setBookingData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  if (isCreatingNewUser) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Create New Customer</h3>

        <div className="space-y-3">
          <label className="block font-medium text-gray-700">Full Name *</label>
          <input
            type="text"
            name="userName"
            value={bookingData.userName}
            onChange={handleChange}
            className={`w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition ${noFocusStyle}`}
            placeholder="John Doe"
            required
          />
        </div>

        <div className="space-y-3">
          <label className="block font-medium text-gray-700">Phone Number *</label>
          <input
            type="tel"
            name="phoneNumber"
            value={bookingData.phoneNumber}
            onChange={handleChange}
            className={`w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition ${noFocusStyle}`}
            placeholder="971501234567"
            required
          />
        </div>

        <div className="space-y-3">
          <label className="block font-medium text-gray-700">Email *</label>
          <input
            type="email"
            name="email"
            value={bookingData.email}
            onChange={handleChange}
            className={`w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition ${noFocusStyle}`}
            placeholder="john@example.com"
            required
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Select Customer</h3>

      <div className="space-y-3">
        <label className="block font-medium text-gray-700">Select Existing Customer</label>
        <Combobox
          value={selectedUserId}
          onChange={(userId) => {
            setSelectedUserId(userId);
            const selectedUser = users.find(
              (u) => u.id === userId
            );
            if (selectedUser) {
              setBookingData((prev) => ({
                ...prev,
                userName: selectedUser.name,
                phoneNumber: selectedUser.phone,
                email: selectedUser.email,
              }));
              onUserChange(selectedUser)
            }
          }}>
          <Combobox.Input
            onChange={(e) => setQuery(e.target.value)}
            displayValue={(userId) => {
              const u = users.find((u) => u.id === userId);
              return u ? `${u.name} - ${u.phone}` : "";
            }}
            className={`w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition ${noFocusStyle}`}
            placeholder='Select a customer'
            required
          />
          <Combobox.Options className='absolute z-10 mt-1 max-h-60 overflow-auto rounded-md bg-gray-100 py-1 text-base shadow-lg'>
            {filteredUsers.map((user) => (
              <Combobox.Option
                key={user.id}
                value={user.id}
                className="cursor-pointer select-none px-4 py-2 hover:bg-blue-50 hover:text-blue-900">
                {user.name} - {user.phone}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        </Combobox>
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={() => setIsCreatingNewUser(true)}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          + Create New Customer
        </button>
      </div>
    </div>
  )
}
