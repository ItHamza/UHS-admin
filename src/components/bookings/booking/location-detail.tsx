"use client"

import type React from "react"
import type { BookingData, LocationOption } from "@/types/new-booking"
import { noFocusStyle } from "@/utils/styles"

interface LocationDetailsProps {
  bookingData: BookingData
  setBookingData: React.Dispatch<React.SetStateAction<BookingData>>
  areas: LocationOption[]
  districts: LocationOption[]
  properties: LocationOption[]
  residenceTypes: any[]
  onAreaChange: (areaId: string) => void
  onDistrictChange: (districtId: string) => void
  onPropertyChange: (propertyId: string) => void
}

export const LocationDetails: React.FC<LocationDetailsProps> = ({
  bookingData,
  setBookingData,
  areas,
  districts,
  properties,
  residenceTypes,
  onAreaChange,
  onDistrictChange,
  onPropertyChange,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setBookingData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-medium text-gray-900">Location Details</h3>

      {/* Apartment Number */}
      <div className="space-y-3">
        <label className="block font-medium text-gray-700">Apartment Number *</label>
        <input
          type="text"
          name="apartmentNumber"
          value={bookingData.apartmentNumber}
          onChange={handleChange}
          className={`w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition ${noFocusStyle}`}
          placeholder="e.g., 101, Villa 2A"
          required
        />
      </div>

      {/* Area Selection */}
      <div className="space-y-3">
        <label className="block font-medium text-gray-700">Select Area *</label>
        <select
          name="area"
          value={bookingData.area}
          onChange={(e) => {
            handleChange(e)
            setBookingData((prev) => ({
              ...prev,
              district: "",
              property: "",
              residenceType: "",
            }))
            onAreaChange(e.target.value)
          }}
          className={`w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition ${noFocusStyle}`}
          required
        >
          <option value="">Select an area</option>
          {areas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.name}
            </option>
          ))}
        </select>
      </div>

      {/* District Selection */}
      {bookingData.area && (
        <div className="space-y-3">
          <label className="block font-medium text-gray-700">Select District *</label>
          <select
            name="district"
            value={bookingData.district}
            onChange={(e) => {
              handleChange(e)
              setBookingData((prev) => ({
                ...prev,
                property: "",
                residenceType: "",
              }))
              onDistrictChange(e.target.value)
            }}
            className={`w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition ${noFocusStyle}`}
            required
          >
            <option value="">Select a district</option>
            {districts.map((district) => (
              <option key={district.id} value={district.id}>
                {district.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Property Selection */}
      {bookingData.district && (
        <div className="space-y-3">
          <label className="block font-medium text-gray-700">Select Property *</label>
          <select
            name="property"
            value={bookingData.property}
            onChange={(e) => {
              handleChange(e)
              setBookingData((prev) => ({
                ...prev,
                residenceType: "",
              }))
              onPropertyChange(e.target.value)
            }}
            className={`w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition ${noFocusStyle}`}
            required
          >
            <option value="">Select a property</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Residence Type Selection */}
      {bookingData.property && (
        <div className="space-y-3">
          <label className="block font-medium text-gray-700">Select Residence Type *</label>
          <select
            name="residenceType"
            value={bookingData.residenceType}
            onChange={handleChange}
            className={`w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition ${noFocusStyle}`}
            required
          >
            <option value="">Select residence type</option>
            {residenceTypes.map((residence) => (
              <option key={residence.id} value={residence.id}>
                {residence.type}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* User Presence */}
      <div className="space-y-3 pt-2">
        <label className="flex items-center">
          <input
            type="checkbox"
            name="userPresent"
            checked={bookingData.userPresent}
            onChange={handleChange}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
          />
          <span className="text-gray-700">Will you be present during service?</span>
        </label>
      </div>
    </div>
  )
}
