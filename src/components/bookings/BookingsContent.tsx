"use client"

import { useState } from "react"
import { Tab } from "@headlessui/react"
import BookingsHeader from "./BookingsHeader"
import BookingsList from "./BookingsList"
import OneTimeServicesAssignment from "./OneTimeAssignmnet"
import NewBookingsHeader from "./NewBookingHeader"

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}

export default function BookingsContentEnhanced() {
  const tabs = [
    { name: "Bookings", icon: "📦", description: "Package bookings" },
    { name: "One Time", icon: "🔧", description: "One time services" },
  ]

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <NewBookingsHeader />

      <div className="w-full">
        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
            {tabs.map((tab) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  classNames(
                    "w-full rounded-lg py-2.5 text-sm font-medium leading-5",
                    "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
                    selected ? "bg-white text-blue-700 shadow" : "text-blue-100 hover:bg-white/[0.12] hover:text-white",
                  )
                }
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="hidden sm:inline">{tab.icon}</span>
                  <span>{tab.name}</span>
                  <span className="hidden lg:inline text-xs">({tab.description})</span>
                </div>
              </Tab>
            ))}
          </Tab.List>

          <Tab.Panels className="mt-6">
            <Tab.Panel className="rounded-xl bg-white p-3 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2">
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Package Bookings</h2>
                  <p className="text-sm text-gray-600 mt-1">Manage complete booking packages with multiple services</p>
                </div>
                <BookingsList />
              </div>
            </Tab.Panel>
            <Tab.Panel className="rounded-xl bg-white p-3 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2">
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h2 className="text-lg font-semibold text-gray-900">One Time Services</h2>
                  <p className="text-sm text-gray-600 mt-1">Search and manage one time service appointments</p>
                </div>
                <OneTimeServicesAssignment />
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  )
}
