"use client"

import { useEffect, useRef } from "react"
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline"
import { useState } from "react"

interface Area {
  id: string
  name: string
  latitude: string
  longitude: string
}

interface District {
  id: string
  name: string
  areaId: string
}

interface TreeDistrictSelectorProps {
  areas: Area[]
  districts: District[]
  selectedDistricts: Set<string>
  setSelectedDistricts: (districts: Set<string>) => void
  className?: string
}

export default function TreeDistrictSelector({
  areas,
  districts,
  selectedDistricts,
  setSelectedDistricts,
  className = "",
}: TreeDistrictSelectorProps) {
  const [expandedAreas, setExpandedAreas] = useState<Set<string>>(new Set())
  const areaRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const getDistrictsByArea = (areaId: string) =>
    Array.isArray(districts) ? districts.filter((d) => d.areaId === areaId) : []

  const isAreaFullySelected = (areaId: string) => {
    const areaDistricts = getDistrictsByArea(areaId)
    return areaDistricts.length > 0 && areaDistricts.every((d) => selectedDistricts.has(d.id))
  }

  const isAreaPartiallySelected = (areaId: string) => {
    const areaDistricts = getDistrictsByArea(areaId)
    return (
      areaDistricts.length > 0 && areaDistricts.some((d) => selectedDistricts.has(d.id)) && !isAreaFullySelected(areaId)
    )
  }

  const toggleArea = (areaId: string) => {
    const areaDistricts = getDistrictsByArea(areaId)
    const newSet = new Set(selectedDistricts)

    if (isAreaFullySelected(areaId)) {
      // Unselect all districts in this area
      areaDistricts.forEach((d) => newSet.delete(d.id))
    } else {
      // Select all districts in this area
      areaDistricts.forEach((d) => newSet.add(d.id))
    }

    setSelectedDistricts(newSet)
  }

  const toggleDistrict = (districtId: string) => {
    const newSet = new Set(selectedDistricts)
    newSet.has(districtId) ? newSet.delete(districtId) : newSet.add(districtId)
    setSelectedDistricts(newSet)
  }

  const toggleAreaExpansion = (areaId: string) => {
    const newExpanded = new Set(expandedAreas)
    newExpanded.has(areaId) ? newExpanded.delete(areaId) : newExpanded.add(areaId)
    setExpandedAreas(newExpanded)
  }

  // Auto-expand areas that have selected districts
  useEffect(() => {
    const newExpanded = new Set(expandedAreas)
    areas.forEach((area) => {
      if (isAreaPartiallySelected(area.id) || isAreaFullySelected(area.id)) {
        newExpanded.add(area.id)
      }
    })
    setExpandedAreas(newExpanded)
  }, [selectedDistricts])

  const selectedCount = selectedDistricts.size

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Selection Summary */}
      {selectedCount > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">
              {selectedCount} district{selectedCount !== 1 ? "s" : ""} selected
            </span>
            <button
              type="button"
              onClick={() => setSelectedDistricts(new Set())}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Clear all
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {Array.from(selectedDistricts)
              .slice(0, 5)
              .map((districtId) => {
                const district = districts.find((d) => d.id === districtId)
                const area = areas.find((a) => a.id === district?.areaId)
                return (
                  <span
                    key={districtId}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {district?.name} ({area?.name})
                  </span>
                )
              })}
            {selectedCount > 5 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                +{selectedCount - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tree Structure */}
      <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md">
        {areas.map((area) => {
          const areaDistricts = getDistrictsByArea(area.id)
          const isExpanded = expandedAreas.has(area.id)

          useEffect(() => {
            const ref = areaRefs.current[area.id]
            if (ref) {
              ref.indeterminate = isAreaPartiallySelected(area.id)
            }
          }, [selectedDistricts, area.id])


          return (
            <div key={area.id} className="border-b border-gray-100 last:border-b-0">
              {/* Area Header */}
              <div className="flex items-center p-3 hover:bg-gray-50">
                <button
                  type="button"
                  onClick={() => toggleAreaExpansion(area.id)}
                  className="mr-2 p-1 hover:bg-gray-200 rounded"
                  disabled={areaDistricts.length === 0}
                >
                  {areaDistricts.length > 0 ? (
                    isExpanded ? (
                      <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronRightIcon className="h-4 w-4 text-gray-500" />
                    )
                  ) : (
                    <div className="h-4 w-4" />
                  )}
                </button>

                <input
                  ref={(el) => { areaRefs.current[area.id] = el }}
                  type="checkbox"
                  checked={isAreaFullySelected(area.id)}
                  onChange={() => toggleArea(area.id)}
                  disabled={areaDistricts.length === 0}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />

                <div className="flex-1">
                  <span className="font-medium text-gray-900">{area.name}</span>
                  <span className="ml-2 text-sm text-gray-500">
                    ({areaDistricts.length} district{areaDistricts.length !== 1 ? "s" : ""})
                  </span>
                </div>
              </div>

              {/* Districts */}
              {isExpanded && areaDistricts.length > 0 && (
                <div className="pl-10 pr-3 pb-3 bg-gray-25">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {areaDistricts.map((district) => (
                      <label
                        key={district.id}
                        className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedDistricts.has(district.id)}
                          onChange={() => toggleDistrict(district.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{district.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {isExpanded && areaDistricts.length === 0 && (
                <div className="pl-10 pr-3 pb-3 text-sm text-gray-500 italic">No districts in this area</div>
              )}
            </div>
          )
        })}
      </div>

      {areas.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No areas available</p>
        </div>
      )}
    </div>
  )
}
