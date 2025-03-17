"use client";

import React, { useState } from "react";
import { Schedule } from "@/types/schedule";
import ScheduleFilter from "./ScheduleFilter";
import ScheduleDetail from "./ScheduleDetail";

const SchedulesList: React.FC = () => {
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [filterAvailability, setFilterAvailability] = useState<string>("all");

  // Sample data
  const schedules: Schedule[] = [
    {
      id: "S-1001",
      teamId: "T-101",
      teamName: "Cleaning Team Alpha",
      date: "2025-03-21",
      startTime: "08:00",
      endTime: "12:00",
      is_blocked: false,
      is_available: true,
      location: "Downtown District",
      assignedMembers: ["Maria Rodriguez", "David Smith"],
      notes:
        "Regular morning shift, bring extra supplies for post-construction jobs",
      createdAt: "2025-03-01T10:23:18",
      lastUpdated: "2025-03-05T14:10:22",
    },
    {
      id: "S-1002",
      teamId: "T-102",
      teamName: "Cleaning Team Beta",
      date: "2025-03-21",
      startTime: "13:00",
      endTime: "17:00",
      is_blocked: false,
      is_available: true,
      location: "Waterfront Area",
      assignedMembers: ["James Wilson", "Sarah Lee", "Miguel Hernandez"],
      notes: "Afternoon shift, focus on commercial properties",
      createdAt: "2025-03-01T10:25:30",
      lastUpdated: "2025-03-05T14:12:15",
    },
    {
      id: "S-1003",
      teamId: "T-101",
      teamName: "Cleaning Team Alpha",
      date: "2025-03-22",
      startTime: "08:00",
      endTime: "16:00",
      is_blocked: false,
      is_available: false,
      location: "Suburban District",
      assignedMembers: ["Maria Rodriguez", "David Smith"],
      notes: "Team fully booked with residential clients",
      createdAt: "2025-03-01T10:30:12",
      lastUpdated: "2025-03-10T09:05:45",
    },
    {
      id: "S-1004",
      teamId: "T-103",
      teamName: "Cleaning Team Gamma",
      date: "2025-03-22",
      startTime: "09:00",
      endTime: "17:00",
      is_blocked: true,
      is_available: false,
      location: "N/A",
      assignedMembers: ["Lisa Chen", "Robert Taylor", "Emma White"],
      notes: "Team training day - annual safety protocols review",
      createdAt: "2025-03-02T09:15:10",
      lastUpdated: "2025-03-02T09:15:10",
    },
    {
      id: "S-1005",
      teamId: "T-104",
      teamName: "Special Services Team",
      date: "2025-03-23",
      startTime: "07:00",
      endTime: "15:00",
      is_blocked: false,
      is_available: true,
      location: "Business District",
      assignedMembers: ["Carlos Mendes", "Aisha Patel", "Tom Johnson"],
      notes:
        "Specialized team for post-construction and deep cleaning services",
      createdAt: "2025-03-02T14:22:40",
      lastUpdated: "2025-03-15T11:30:22",
    },
    {
      id: "S-1006",
      teamId: "T-102",
      teamName: "Cleaning Team Beta",
      date: "2025-03-23",
      startTime: "16:00",
      endTime: "22:00",
      is_blocked: false,
      is_available: true,
      location: "Downtown District",
      assignedMembers: ["James Wilson", "Sarah Lee"],
      notes: "Evening shift for office buildings",
      createdAt: "2025-03-02T14:25:18",
      lastUpdated: "2025-03-15T11:32:45",
    },
  ];

  const handleViewSchedule = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
  };

  const handleFilterChange = (availability: string) => {
    setFilterAvailability(availability);
  };

  const filteredSchedules = (() => {
    if (filterAvailability === "all") return schedules;
    if (filterAvailability === "available")
      return schedules.filter((s) => s.is_available);
    if (filterAvailability === "unavailable")
      return schedules.filter((s) => !s.is_available);
    if (filterAvailability === "blocked")
      return schedules.filter((s) => s.is_blocked);
    return schedules;
  })();

  const getAvailabilityStatus = (schedule: Schedule) => {
    if (schedule.is_blocked)
      return { text: "Blocked", class: "bg-red-100 text-red-800" };
    if (schedule.is_available)
      return { text: "Available", class: "bg-green-100 text-green-800" };
    return { text: "Booked", class: "bg-blue-100 text-blue-800" };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const time = new Date();
    time.setHours(parseInt(hours));
    time.setMinutes(parseInt(minutes));
    return time.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className='bg-white rounded-lg shadow overflow-hidden'>
      <div className='flex justify-between items-center p-4 border-b'>
        <h2 className='text-lg font-medium'>Team Schedules</h2>
        <ScheduleFilter
          currentFilter={filterAvailability}
          onFilterChange={handleFilterChange}
          scheduleCount={filteredSchedules.length}
        />
      </div>

      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Schedule ID
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Team
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Date
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Time
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Status
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Location
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {filteredSchedules.map((schedule) => (
              <tr key={schedule.id} className='hover:bg-gray-50'>
                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                  {schedule.id}
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='flex items-center'>
                    <div>
                      <div className='text-sm font-medium text-gray-900'>
                        {schedule.teamName}
                      </div>
                      <div className='text-xs text-gray-500'>
                        ID: {schedule.teamId}
                      </div>
                    </div>
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm text-gray-900'>
                    {formatDate(schedule.date)}
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm text-gray-900'>
                    {formatTime(schedule.startTime)} -{" "}
                    {formatTime(schedule.endTime)}
                  </div>
                  <div className='text-xs text-gray-500'>
                    {(() => {
                      const start = new Date(
                        `2000-01-01T${schedule.startTime}`
                      ) as any;
                      const end = new Date(
                        `2000-01-01T${schedule.endTime}`
                      ) as any;
                      const hours = (end - start) / (1000 * 60 * 60);
                      return `${hours} hours`;
                    })()}
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      getAvailabilityStatus(schedule).class
                    }`}>
                    {getAvailabilityStatus(schedule).text}
                  </span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                  {schedule.location}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                  <button
                    onClick={() => handleViewSchedule(schedule)}
                    className='text-indigo-600 hover:text-indigo-900'>
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className='bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6'>
        <div className='flex-1 flex justify-between sm:hidden'>
          <button className='relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'>
            Previous
          </button>
          <button className='ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'>
            Next
          </button>
        </div>
        <div className='hidden sm:flex-1 sm:flex sm:items-center sm:justify-between'>
          <div>
            <p className='text-sm text-gray-700'>
              Showing <span className='font-medium'>1</span> to{" "}
              <span className='font-medium'>{filteredSchedules.length}</span> of{" "}
              <span className='font-medium'>{filteredSchedules.length}</span>{" "}
              results
            </p>
          </div>
          <div>
            <nav
              className='relative z-0 inline-flex rounded-md shadow-sm -space-x-px'
              aria-label='Pagination'>
              <button className='relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50'>
                Previous
              </button>
              <button className='bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium'>
                1
              </button>
              <button className='relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50'>
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Schedule detail modal/sidebar */}
      {isDetailOpen && selectedSchedule && (
        <div
          className='fixed inset-0 overflow-hidden'
          aria-labelledby='slide-over-title'
          role='dialog'
          aria-modal='true'>
          <div className='absolute inset-0 overflow-hidden'>
            {/* Background overlay */}
            <div
              className='absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity'
              aria-hidden='true'
              onClick={handleCloseDetail}></div>

            <div className='fixed inset-y-0 right-0 pl-10 max-w-full flex'>
              <div className='relative w-screen max-w-md'>
                <div className='h-full flex flex-col bg-white shadow-xl overflow-y-scroll'>
                  <ScheduleDetail
                    schedule={selectedSchedule}
                    onClose={handleCloseDetail}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulesList;
