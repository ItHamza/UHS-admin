"use client"

import type React from "react"
import { Check, Calendar, MapPin, User, Clock, Package, DollarSign } from "lucide-react"
import type {
  BookingData,
  FinalBookingData,
  User as UserType,
  ServiceOption,
  LocationOption,
  SpecializedSubCategory,
} from "@/types/new-booking"

interface BookingConfirmationProps {
  bookingData: BookingData
  finalBookingData: FinalBookingData
  users: UserType[]
  services: ServiceOption[]
  subServices: ServiceOption[]
  areas: LocationOption[]
  districts: LocationOption[]
  properties: LocationOption[]
  residenceTypes: any[]
  selectedBundleDetail: any
  selectedTimeSlots: any[]
  frequencies: any[]
  onConfirm: () => void
  isLoading: boolean
}

export const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
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
  selectedTimeSlots,
  frequencies,
  onConfirm,
  isLoading,
}) => {
  const isRegularService = bookingData.selectedSubServiceName.toLowerCase().includes("regular")
  const isDeepService = bookingData.selectedSubServiceName.toLowerCase().includes("deep")
  const isSpecialService = bookingData.selectedSubServiceName.toLowerCase().includes("special")
  const isFrequencyRecurring = bookingData.frequency !== "one_time" && bookingData.frequency !== ""

  // Helper functions to get display names
  const getServiceName = () => services.find((s) => s.id === bookingData.service)?.name || "N/A"
  const getSubServiceName = () => subServices.find((s) => s.id === bookingData.subService)?.name || "N/A"
  const getAreaName = () => areas.find((a) => a.id === bookingData.area)?.name || "N/A"
  const getDistrictName = () => districts.find((d) => d.id === bookingData.district)?.name || "N/A"
  const getPropertyName = () => properties.find((p) => p.id === bookingData.property)?.name || "N/A"
  const getResidenceTypeName = () => residenceTypes.find((r) => r.id === bookingData.residenceType)?.type || "N/A"
  const getFrequencyName = () => frequencies.find((f) => f.id === bookingData.frequency)?.label || "N/A"

  // Calculate total for specialized services
  const calculateSpecializedTotal = () => {
    return bookingData.selectedSpecializedSubCategories.reduce(
      (total, item) => total + Number(item.price_per_unit) * item.quantity,
      0,
    )
  }

  // Format time slots for display
  const formatTimeSlots = () => {
    if (!selectedTimeSlots || selectedTimeSlots.length === 0) return []

    return selectedTimeSlots.map((slot) => ({
      date: slot.date,
      time: `${slot.start_time.slice(0, 5)} - ${slot.end_time.slice(0, 5)}`,
    }))
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Confirm Your Booking</h3>
        <p className="text-gray-600">Please review your booking details before confirming</p>
      </div>

      <div className="space-y-4">
        {/* Customer Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <User className="w-5 h-5 text-blue-600 mr-2" />
            <h4 className="font-semibold text-gray-900">Customer Information</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Name:</span>
              <span className="ml-2 font-medium">{bookingData.userName}</span>
            </div>
            <div>
              <span className="text-gray-500">Phone:</span>
              <span className="ml-2 font-medium">{bookingData.phoneNumber}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-gray-500">Email:</span>
              <span className="ml-2 font-medium">{bookingData.email}</span>
            </div>
          </div>
        </div>

        {/* Service Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <Package className="w-5 h-5 text-blue-600 mr-2" />
            <h4 className="font-semibold text-gray-900">Service Details</h4>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Service Type:</span>
              <span className="font-medium">{getServiceName()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Sub-Service:</span>
              <span className="font-medium">{getSubServiceName()}</span>
            </div>
            {isSpecialService && bookingData.selectedSpecializedCategoryName && (
              <div className="flex justify-between">
                <span className="text-gray-500">Category:</span>
                <span className="font-medium">{bookingData.selectedSpecializedCategoryName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Location Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <MapPin className="w-5 h-5 text-blue-600 mr-2" />
            <h4 className="font-semibold text-gray-900">Location Details</h4>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Area:</span>
              <span className="font-medium">{getAreaName()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">District:</span>
              <span className="font-medium">{getDistrictName()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Property:</span>
              <span className="font-medium">{getPropertyName()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Residence Type:</span>
              <span className="font-medium">{getResidenceTypeName()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Apartment:</span>
              <span className="font-medium">{bookingData.apartmentNumber}</span>
            </div>
          </div>
        </div>

        {/* Schedule Information - Regular Services */}
        {isRegularService && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Calendar className="w-5 h-5 text-blue-600 mr-2" />
              <h4 className="font-semibold text-gray-900">Schedule Details</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Frequency:</span>
                <span className="font-medium">{getFrequencyName()}</span>
              </div>
              {isFrequencyRecurring && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Duration:</span>
                  <span className="font-medium">
                    {bookingData.duration} {bookingData.duration === "1" ? "month" : "months"}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Start Date:</span>
                <span className="font-medium">{bookingData.startDate}</span>
              </div>
              {finalBookingData.endDate && (
                <div className="flex justify-between">
                  <span className="text-gray-500">End Date:</span>
                  <span className="font-medium">{finalBookingData.endDate}</span>
                </div>
              )}
              {selectedBundleDetail?.dayCombination && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Service Days:</span>
                  <span className="font-medium">{selectedBundleDetail.dayCombination.join(", ")}</span>
                </div>
              )}
            </div>

            {/* Time Slots */}
            {selectedTimeSlots && selectedTimeSlots.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center mb-2">
                  <Clock className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="font-medium text-gray-900">Selected Time Slots</span>
                </div>
                <div className="space-y-1">
                  {formatTimeSlots().map((slot, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-500">{slot.date}:</span>
                      <span className="font-medium">{slot.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Schedule Information - Deep/Special Services */}
        {(isDeepService || isSpecialService) && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Calendar className="w-5 h-5 text-blue-600 mr-2" />
              <h4 className="font-semibold text-gray-900">Service Date</h4>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Scheduled Date:</span>
              <span className="font-medium">{bookingData.startDate}</span>
            </div>
          </div>
        )}

        {/* Specialized Service Items */}
        {isSpecialService && bookingData.selectedSpecializedSubCategories.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Package className="w-5 h-5 text-blue-600 mr-2" />
              <h4 className="font-semibold text-gray-900">Selected Items</h4>
            </div>
            <div className="space-y-3">
              {bookingData.selectedSpecializedSubCategories.map((item: SpecializedSubCategory, index: number) => (
                <div key={index} className="flex justify-between items-center p-3 bg-white rounded border">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-500">
                      Quantity: {item.quantity} × {item.currency || "QAR"} {Number(item.price_per_unit)
}
                    </div>
                  </div>
                  <div className="font-semibold text-gray-900">
                    {item.currency || "QAR"} {(Number(item.price_per_unit) * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing Information */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center mb-3">
            <DollarSign className="w-5 h-5 text-blue-600 mr-2" />
            <h4 className="font-semibold text-gray-900">Pricing Details</h4>
          </div>
          <div className="space-y-2">
            {isRegularService && finalBookingData.total_amount > 0 && (
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Amount:</span>
                <span className="text-blue-600">QAR {finalBookingData.total_amount.toFixed(2)}</span>
              </div>
            )}
            {isSpecialService && (
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Amount:</span>
                <span className="text-blue-600">QAR {calculateSpecializedTotal().toFixed(2)}</span>
              </div>
            )}
            {isDeepService && (
              <div className="flex justify-between text-lg font-semibold">
                <span>Service Fee:</span>
                <span className="text-blue-600">QAR {finalBookingData.total_amount.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Additional Information</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Customer Present:</span>
              <span className="font-medium">{bookingData.userPresent ? "Yes" : "No"}</span>
            </div>
            {bookingData.specialInstructions && (
              <div>
                <span className="text-gray-500">Special Instructions:</span>
                <div className="mt-1 p-2 bg-white rounded border text-gray-900">{bookingData.specialInstructions}</div>
              </div>
            )}
          </div>
        </div>

        {/* Service Terms */}
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <h4 className="font-semibold text-gray-900 mb-2">Important Notes</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Please ensure someone is available at the scheduled time if required</li>
            <li>• Our team will contact you 30 minutes before arrival</li>
            <li>• Cancellations must be made at least 24 hours in advance</li>
            {isRegularService && <li>• For recurring services, you can modify the schedule through your account</li>}
            {isSpecialService && <li>• Specialized cleaning may require additional time based on the condition</li>}
          </ul>
        </div>
      </div>
    </div>
  )
}
