"use client"

import type React from "react"
import { CheckCircleIcon } from "lucide-react"
import type { BookingData, ServiceOption } from "@/types/new-booking"
import { noFocusStyle } from "@/utils/styles"

interface ServiceSelectionProps {
  bookingData: BookingData
  setBookingData: React.Dispatch<React.SetStateAction<BookingData>>
  services: ServiceOption[]
  subServices: ServiceOption[]
  specialServices: ServiceOption[]
  specializedSubCategories: any[]
  onServiceChange: (serviceId: string) => void
  onSubServiceChange: (subServiceId: string, subServiceName: string) => void
  onSpecialServiceChange: (specialServiceId: string) => void
  onSpecializedSubCategoryChange: (categoryId: string, categoryName: string) => void
}

export const ServiceSelection: React.FC<ServiceSelectionProps> = ({
  bookingData,
  setBookingData,
  services,
  subServices,
  specialServices,
  specializedSubCategories,
  onServiceChange,
  onSubServiceChange,
  onSpecialServiceChange,
  onSpecializedSubCategoryChange,
}) => {
  const handleSpecializedSubCategoryToggle = (subCategory: any) => {
    setBookingData((prev) => {
      const existing = prev.selectedSpecializedSubCategories || []
      const alreadySelected = existing.find((s) => s.id === subCategory.id)

      if (alreadySelected) {
        return {
          ...prev,
          selectedSpecializedSubCategories: existing.filter((s) => s.id !== subCategory.id),
        }
      } else {
        return {
          ...prev,
          selectedSpecializedSubCategories: [
            ...existing,
            {
              id: subCategory.id,
              name: subCategory.name,
              quantity: 1,
              price_per_unit: subCategory.price_per_unit,
              currency: subCategory.currency || "QAR",
              category: subCategory.category,
            },
          ],
        }
      }
    })
  }

  const handleQuantityChange = (subCategoryId: string, quantity: number) => {
    setBookingData((prev) => ({
      ...prev,
      selectedSpecializedSubCategories: prev.selectedSpecializedSubCategories.map((s) =>
        s.id === subCategoryId ? { ...s, quantity: Math.max(1, quantity) } : s,
      ),
    }))
  }

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-medium text-gray-900">Service Selection</h3>

      {/* Main Service Selection */}
      <div className="space-y-3">
        <label className="block font-medium text-gray-700">Select Service *</label>
        <select
          name="service"
          value={bookingData.service}
          onChange={(e) => {
            setBookingData((prev) => ({ ...prev, service: e.target.value, subService: "" }))
            onServiceChange(e.target.value)
          }}
          className={`w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition ${noFocusStyle}`}
          required
        >
          <option value="">Select a service</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
        </select>
      </div>

      {/* Sub-Service Selection */}
      {bookingData.service && (
        <div className="space-y-3">
          <label className="block font-medium text-gray-700">Select Sub-Service *</label>
          <select
            name="subService"
            value={bookingData.subService}
            onChange={(e) => {
              const selectedOption = e.target.options[e.target.selectedIndex]
              onSubServiceChange(e.target.value, selectedOption.text)
            }}
            className={`w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition ${noFocusStyle}`}
            required
          >
            <option value="">Select a sub-service</option>
            {subServices.map((subService) => (
              <option key={subService.id} value={subService.id}>
                {subService.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Specialized Categories */}
      {specialServices.length > 0 && (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Specialized Category *</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {specialServices.map((category) => (
              <div
                key={category.id}
                onClick={() => onSpecializedSubCategoryChange(category.id, category.name)}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  bookingData.selectedSpecializedCategory === category.id
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{category.name}</h4>
                    {category.photo_url && (
                      <img
                        src={category.photo_url || "/placeholder.svg"}
                        alt={category.name}
                        className="w-12 h-12 object-cover rounded mt-2"
                      />
                    )}
                  </div>
                  {bookingData.selectedSpecializedCategory === category.id && (
                    <CheckCircleIcon className="w-5 h-5 text-blue-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Specialized Sub-Categories */}
      {specializedSubCategories.length > 0 && (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Specialized Sub-Categories *</label>
          <div className="grid grid-cols-1 gap-3">
            {specializedSubCategories.map((subCategory) => {
              const selected = bookingData.selectedSpecializedSubCategories?.find((s) => s.id === subCategory.id)

              return (
                <div
                  key={subCategory.id}
                  onClick={() => handleSpecializedSubCategoryToggle(subCategory)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selected
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{subCategory.name}</h4>
                      {subCategory.description && (
                        <p className="text-sm text-gray-500 mt-1">{subCategory.description}</p>
                      )}
                      {subCategory.photo_url && (
                        <img
                          src={subCategory.photo_url || "/placeholder.svg"}
                          alt={subCategory.name}
                          className="w-12 h-12 object-cover rounded mt-2"
                        />
                      )}
                    </div>
                    {selected && <CheckCircleIcon className="w-5 h-5 text-blue-500" />}
                  </div>

                  {/* Quantity Input */}
                  {selected && (
                    <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                      <label className="block text-sm text-gray-600 mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={selected.quantity}
                        onChange={(e) => handleQuantityChange(subCategory.id, Number.parseInt(e.target.value) || 1)}
                        className="w-20 border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
