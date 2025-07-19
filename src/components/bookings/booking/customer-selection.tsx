"use client"

import type React from "react"
import { Combobox } from "@headlessui/react"
import type { User, BookingData } from "@/types/new-booking"
import { noFocusStyle } from "@/utils/styles"
import { useMemo, useState } from "react"

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

  const [apiUsers, setApiUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    if (!query.trim()) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/customer?search=${encodeURIComponent(query)}`);
      const data = await res.json();
      const fetchedUsers: User[] = data.data;

      // Merge with deduplication by stringified id
      setApiUsers((prev) => {
        const map = new Map<string, User>();

        [...prev, ...fetchedUsers].forEach((u) => {
          if (u?.id != null) {
            map.set(String(u.id), u);
          }
        });

        return Array.from(map.values());
      });

    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };


  const mergedUsers = useMemo(() => {
    const userMap = new Map<string, User>();

    // Newer API users should overwrite local ones if duplicate IDs
    [...users, ...apiUsers].forEach((u) => {
      if (u?.id != null) {
        userMap.set(String(u.id), u); // newer overwrites older
      }
    });
    return Array.from(userMap.values());
  }, [users, apiUsers]);


  const filteredUsers = useMemo(() => {
    if (!query.trim()) return mergedUsers;

    return mergedUsers.filter((u) =>
      `${u.name} ${u.phone} ${u.email}`.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, mergedUsers]);



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
            const selectedUser = mergedUsers.find((u) => u.id === userId);
            if (selectedUser) {
              setBookingData((prev) => ({
                ...prev,
                userName: selectedUser.name,
                phoneNumber: selectedUser.phone,
                email: selectedUser.email,
              }));
              onUserChange(selectedUser);
            }
          }}
        >
          <Combobox.Input
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                fetchUsers();
              }
            }}
            displayValue={(userId) => {
              const u = mergedUsers.find((u) => u.id === userId);
              return u ? `${u.name} - ${u.phone}` : '';
            }}
            className={`w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition`}
            placeholder='Search and press Enter'
            required
          />

          <Combobox.Options className="absolute z-50 mt-1 max-h-60 overflow-auto rounded-md bg-gray-100 py-1 text-base shadow-lg">
            {loading ? (
              <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500">
                <svg className="animate-spin h-4 w-4 text-gray-400" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Loading...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-500">
                No users found. Press Enter to search
              </div>
            ) : (
              filteredUsers.map((user) => (
                <Combobox.Option
                  key={user.id}
                  value={user.id}
                  className="cursor-pointer select-none px-4 py-2 hover:bg-blue-50 hover:text-blue-900"
                >
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.phone} • {user.email}</div>
                </Combobox.Option>
              ))
            )}
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
