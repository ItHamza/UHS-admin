import React from "react";

interface ScheduleFilterProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
  scheduleCount: number;
}

const ScheduleFilter: React.FC<ScheduleFilterProps> = ({
  currentFilter,
  onFilterChange,
  scheduleCount,
}) => {
  return (
    <div className='flex items-center'>
      <span className='text-sm text-gray-500 mr-4'>
        {scheduleCount} schedule{scheduleCount !== 1 ? "s" : ""}
      </span>
      <div className='flex bg-gray-100 rounded-lg p-1'>
        <button
          onClick={() => onFilterChange("all")}
          className={`px-3 py-1 text-sm rounded-md ${
            currentFilter === "all"
              ? "bg-white shadow text-gray-800"
              : "text-gray-600 hover:text-gray-800"
          }`}>
          All
        </button>
        <button
          onClick={() => onFilterChange("available")}
          className={`px-3 py-1 text-sm rounded-md ${
            currentFilter === "available"
              ? "bg-white shadow text-gray-800"
              : "text-gray-600 hover:text-gray-800"
          }`}>
          Available
        </button>
        <button
          onClick={() => onFilterChange("unavailable")}
          className={`px-3 py-1 text-sm rounded-md ${
            currentFilter === "unavailable"
              ? "bg-white shadow text-gray-800"
              : "text-gray-600 hover:text-gray-800"
          }`}>
          Booked
        </button>
        <button
          onClick={() => onFilterChange("blocked")}
          className={`px-3 py-1 text-sm rounded-md ${
            currentFilter === "blocked"
              ? "bg-white shadow text-gray-800"
              : "text-gray-600 hover:text-gray-800"
          }`}>
          Blocked
        </button>
      </div>
    </div>
  );
};

export default ScheduleFilter;
