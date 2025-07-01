"use client"

import type React from "react"
import { Check, Clock, Users } from "lucide-react"
import type { BookingData, Bundle } from "@/types/new-booking"

interface BundleSelectionProps {
  bookingData: BookingData
  setBookingData: React.Dispatch<React.SetStateAction<BookingData>>
  bundles: Bundle[]
  selectedBundleDetail: any
  setSelectedBundleDetail: (bundle: any) => void
  onBundleSelect: (bundleId: string, bundleDetail: any, teamId: string) => void
  isLoading: boolean
}

export const BundleSelection: React.FC<BundleSelectionProps> = ({
  bookingData,
  setBookingData,
  bundles,
  selectedBundleDetail,
  setSelectedBundleDetail,
  onBundleSelect,
  isLoading,
}) => {
  const handleBundleSelect = (bundle: any) => {
    setBookingData((prev) => ({
      ...prev,
      bundle: bundle.bundleId,
    }))

    const foundBundleDetail = {
      bundleId: bundle.bundleId,
      dayCombination: bundle.dayCombination || [],
      booking: bundle.booking || [],
      renewableSlots: bundle.renewableSlots || [],
    }

    const foundTeamId = bundle.booking?.[0]?.teamId || null

    setSelectedBundleDetail(foundBundleDetail)
    onBundleSelect(bundle.bundleId, foundBundleDetail, foundTeamId)
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Cleaning Package</h3>
        <p className="text-gray-600">Choose the days and schedule that works best for you</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-gray-600">Loading available packages...</span>
        </div>
      ) : bundles.length > 0 ? (
        <div className="space-y-4">
          {bundles.map((bundle: any) => (
            <div
              key={bundle.bundleId}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                bookingData.bundle === bundle.bundleId
                  ? "border-blue-500 bg-blue-50 shadow-md"
                  : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
              }`}
              onClick={() => handleBundleSelect(bundle)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <div className="flex items-center text-blue-600 mr-4">
                      <Clock className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">{bundle.dayCombination?.length || 0} days/week</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-1" />
                      <span className="text-sm">Team Available</span>
                    </div>
                  </div>

                  <h4 className="font-semibold text-gray-900 mb-2">
                    {bundle.dayCombination?.join(", ") || "Custom Schedule"}
                  </h4>

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Booking Slots:</span>
                      <span className="ml-1">{bundle.booking?.length || 0}</span>
                    </div>
                    <div>
                      <span className="font-medium">Renewal Slots:</span>
                      <span className="ml-1">{bundle.renewableSlots?.length || 0}</span>
                    </div>
                  </div>

                  {bundle.booking && bundle.booking.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs text-gray-500 mb-1">Available time slots preview:</div>
                      <div className="flex flex-wrap gap-1">
                        {bundle.booking.slice(0, 3).map((booking: any, idx: number) => (
                          <span key={idx} className="inline-block px-2 py-1 bg-gray-100 text-xs rounded">
                            {booking.day}: {booking.timeSlots?.length || 0} slots
                          </span>
                        ))}
                        {bundle.booking.length > 3 && (
                          <span className="inline-block px-2 py-1 bg-gray-100 text-xs rounded">
                            +{bundle.booking.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="ml-4">
                  {bookingData.bundle === bundle.bundleId ? (
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Packages Available</h4>
          <p className="text-gray-600">
            No cleaning packages are available for the selected criteria. Please try different dates or contact support.
          </p>
        </div>
      )}
    </div>
  )
}
