"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  X,
  Calendar as CalendarIcon,
  ArrowLeft,
} from "lucide-react";
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  isSameDay,
  parseISO,
  isSameWeek,
  addWeeks,
} from "date-fns";

const statusColors = {
  Working: "bg-blue-600",
  "Free Time": "bg-green-600",
  Transporting: "bg-purple-600",
  Break: "bg-yellow-600",
  Blocked: "bg-red-600",
};

type StatusType = keyof typeof statusColors;

const mockSchedules = [
  {
    id: 1,
    teamId: 1,
    teamName: "Kitchen Staff",
    date: "2025-03-17",
    startTime: "09:00",
    endTime: "17:00",
    area: "Main Kitchen",
    status: "Working" as StatusType,
    bookedBy: null,
    blockedBy: null,
  },
  {
    id: 2,
    teamId: 2,
    teamName: "Waitstaff",
    date: "2025-03-17",
    startTime: "10:00",
    endTime: "18:00",
    area: "Dining Area",
    status: "Working" as StatusType,
    bookedBy: "John Smith",
    blockedBy: null,
  },
  {
    id: 3,
    teamId: 3,
    teamName: "Cleaning Crew",
    date: "2025-03-17",
    startTime: "16:00",
    endTime: "22:00",
    area: "All Areas",
    status: "Working" as StatusType,
    bookedBy: null,
    blockedBy: null,
  },
  {
    id: 4,
    teamId: 1,
    teamName: "Kitchen Staff",
    date: "2025-03-19",
    startTime: "08:00",
    endTime: "16:00",
    area: "Main Kitchen",
    status: "Working" as StatusType,
    bookedBy: null,
    blockedBy: null,
  },
  {
    id: 5,
    teamId: 2,
    teamName: "Waitstaff",
    date: "2025-03-20",
    startTime: "11:00",
    endTime: "19:00",
    area: "Free Time" as StatusType,
    status: "Free Time" as StatusType,
    bookedBy: null,
    blockedBy: null,
  },
  {
    id: 6,
    teamId: 1,
    teamName: "Kitchen Staff",
    date: "2025-03-17",
    startTime: "18:00",
    endTime: "22:00",
    area: "Prep Kitchen",
    status: "Break" as StatusType,
    bookedBy: null,
    blockedBy: null,
  },
  {
    id: 7,
    teamId: 3,
    teamName: "Cleaning Crew",
    date: "2025-03-18",
    startTime: "09:00",
    endTime: "13:00",
    area: "Main Floor",
    status: "Blocked" as StatusType,
    bookedBy: null,
    blockedBy: "Manager",
  },
  {
    id: 8,
    teamId: 4,
    teamName: "Hosts",
    date: "2025-03-19",
    startTime: "14:00",
    endTime: "20:00",
    area: "Entrance",
    status: "Transporting" as StatusType,
    bookedBy: "Jane Doe",
    blockedBy: null,
  },
];

// Team data
const teams = [
  { id: 1, name: "Kitchen Staff" },
  { id: 2, name: "Waitstaff" },
  { id: 3, name: "Cleaning Crew" },
  { id: 4, name: "Hosts" },
];

// Time slots from 8am to 10pm
const timeSlots = Array.from({ length: 15 }, (_, i) => {
  const hour = i + 8;
  return hour < 12
    ? `${hour}:00 AM`
    : hour === 12
    ? `${hour}:00 PM`
    : `${hour - 12}:00 PM`;
});

// Convert time string to hour number (24-hour format)
const timeToHours = (timeString: string) => {
  const [hours] = timeString.split(":").map(Number);
  return hours;
};

interface Schedule {
  id: number;
  teamId: number;
  teamName: string;
  date: string;
  startTime: string;
  endTime: string;
  area: string;
  status: StatusType;
  bookedBy: string | null;
  blockedBy: string | null;
}

interface ScheduleGroupProps {
  schedules: Schedule[];
  startHour: number;
  onClick: (schedules: Schedule[], e: React.MouseEvent) => void;
}

// Get unique schedule blocks by team+time for a day
const getUniqueSchedules = (schedules: Schedule[], dayStr: string) => {
  const daySchedules = schedules.filter((s) => s.date === dayStr);

  // Group by team and time range
  const groups: Record<string, Schedule[]> = {};

  daySchedules.forEach((schedule) => {
    const key = `${schedule.teamId}-${schedule.startTime}-${schedule.endTime}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(schedule);
  });

  return Object.values(groups);
};

// Component to display unique schedules for a specific hour
const ScheduleGroups: React.FC<{
  daySchedules: Schedule[][];
  hour: number;
  onClick: (schedules: Schedule[], e: React.MouseEvent) => void;
}> = ({ daySchedules, hour, onClick }) => {
  // Filter to get schedules that include this hour
  const schedulesInHour = daySchedules.filter((group) => {
    const startHour = timeToHours(group[0].startTime);
    const endHour = timeToHours(group[0].endTime);
    return startHour <= hour && endHour > hour;
  });

  // Only show schedule at its start hour
  const schedulesToShow = schedulesInHour.filter((group) => {
    return timeToHours(group[0].startTime) === hour;
  });

  return (
    <div className='space-y-1'>
      {schedulesToShow.map((group, idx) => (
        <div
          key={idx}
          className={`rounded p-2 text-xs text-white cursor-pointer ${
            group.length > 1 ? "bg-blue-800" : statusColors[group[0].status]
          }`}
          style={{
            height: "auto",
            gridRowStart: `span ${
              timeToHours(group[0].endTime) - timeToHours(group[0].startTime)
            }`,
          }}
          onClick={(e) => onClick(group, e)}>
          {group.length > 1 ? (
            <div>
              <div className='font-bold'>{group.length} Teams</div>
              <div>
                {group[0].startTime} - {group[0].endTime}
              </div>
            </div>
          ) : (
            <div>
              <div className='font-bold'>{group[0].teamName}</div>
              <div>{group[0].status}</div>
              <div>
                {group[0].startTime} - {group[0].endTime}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

interface TooltipProps {
  schedules: Schedule[];
  position: { x: number; y: number };
  onClose: () => void;
  onViewDetails: (schedule: Schedule) => void;
}

const ScheduleTooltip: React.FC<TooltipProps> = ({
  schedules,
  position,
  onClose,
  onViewDetails,
}) => {
  const [selectedTeam, setSelectedTeam] = useState<Schedule | null>(
    schedules.length === 1 ? schedules[0] : null
  );

  return (
    <div
      className='absolute bg-white rounded-md shadow-lg p-4 z-50 w-64'
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        maxWidth: "90vw",
      }}>
      <button
        onClick={onClose}
        className='absolute top-2 right-2 text-gray-500 hover:text-gray-700'>
        <X size={16} />
      </button>

      {!selectedTeam && schedules.length > 1 ? (
        <>
          <h3 className='font-semibold mb-2'>Select Team</h3>
          <ul className='space-y-2'>
            {schedules.map((schedule) => (
              <li
                key={schedule.id}
                className='cursor-pointer hover:bg-gray-100 p-2 rounded'
                onClick={() => setSelectedTeam(schedule)}>
                {schedule.teamName} - {schedule.status}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <h3 className='font-semibold mb-2'>{selectedTeam?.teamName}</h3>
          <div className='space-y-2 text-sm'>
            <div>
              <span className='font-medium'>Time:</span>{" "}
              {selectedTeam?.startTime} - {selectedTeam?.endTime}
            </div>
            <div>
              <span className='font-medium'>Area:</span> {selectedTeam?.area}
            </div>
            <div>
              <span className='font-medium'>Status:</span>{" "}
              {selectedTeam?.status}
            </div>
            <div className='pt-2'>
              <button
                className='bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs w-full'
                onClick={() => selectedTeam && onViewDetails(selectedTeam)}>
                View Details
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

interface ScheduleDetailsViewProps {
  schedule: Schedule;
  onBack: () => void;
}

const ScheduleDetailsView: React.FC<ScheduleDetailsViewProps> = ({
  schedule,
  onBack,
}) => {
  return (
    <div className='bg-white rounded-lg shadow'>
      <div className='flex items-center p-4 border-b'>
        <button onClick={onBack} className='mr-2'>
          <ArrowLeft size={20} />
        </button>
        <h2 className='text-xl font-bold'>Schedule Details</h2>
      </div>

      <div className='p-6 space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-4'>
            <div>
              <h3 className='text-sm font-medium text-gray-500'>Team</h3>
              <p className='text-lg font-semibold'>{schedule.teamName}</p>
            </div>

            <div>
              <h3 className='text-sm font-medium text-gray-500'>Date</h3>
              <p className='text-lg font-semibold'>
                {format(parseISO(schedule.date), "MMMM d, yyyy")}
              </p>
            </div>

            <div>
              <h3 className='text-sm font-medium text-gray-500'>Time</h3>
              <p className='text-lg font-semibold'>
                {schedule.startTime} - {schedule.endTime}
              </p>
            </div>
          </div>

          <div className='space-y-4'>
            <div>
              <h3 className='text-sm font-medium text-gray-500'>Location</h3>
              <p className='text-lg font-semibold'>{schedule.area}</p>
            </div>

            <div>
              <h3 className='text-sm font-medium text-gray-500'>Status</h3>
              <p
                className={`inline-block px-2 py-1 rounded text-white ${
                  statusColors[schedule.status]
                }`}>
                {schedule.status}
              </p>
            </div>

            {schedule.bookedBy && (
              <div>
                <h3 className='text-sm font-medium text-gray-500'>Booked By</h3>
                <p className='text-lg font-semibold'>{schedule.bookedBy}</p>
              </div>
            )}

            {schedule.blockedBy && (
              <div>
                <h3 className='text-sm font-medium text-gray-500'>
                  Blocked By
                </h3>
                <p className='text-lg font-semibold'>{schedule.blockedBy}</p>
              </div>
            )}
          </div>
        </div>

        <div className='border-t pt-6'>
          <h3 className='text-lg font-medium mb-4'>Actions</h3>
          <div className='flex flex-wrap gap-3'>
            <button className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'>
              Edit
            </button>
            {schedule.status !== "Blocked" ? (
              <button className='bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700'>
                Block
              </button>
            ) : (
              <button className='bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700'>
                Unblock
              </button>
            )}
            <button className='bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700'>
              Make Available
            </button>
            {schedule.status === "Working" && (
              <button className='bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700'>
                Set Break
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DatePicker: React.FC<{
  selectedDate: Date;
  onChange: (date: Date) => void;
  onClose: () => void;
}> = ({ selectedDate, onChange, onClose }) => {
  const [viewDate, setViewDate] = useState(selectedDate);

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const days = [];
  const monthStart = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const monthEnd = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);

  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  for (let i = 0; i < 42; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);

    const isCurrentMonth = currentDate.getMonth() === viewDate.getMonth();
    const isToday = isSameDay(currentDate, new Date());
    const isSelected = isSameDay(currentDate, selectedDate);

    days.push({ date: currentDate, isCurrentMonth, isToday, isSelected });

    if (
      i > 27 &&
      currentDate.getDate() >= monthEnd.getDate() &&
      currentDate.getMonth() >= monthEnd.getMonth()
    ) {
      break;
    }
  }

  return (
    <div className='bg-white rounded-lg shadow-lg p-4 w-64'>
      <div className='flex justify-between items-center mb-4'>
        <h3 className='font-bold'>{format(viewDate, "MMMM yyyy")}</h3>
        <div className='flex'>
          <button
            onClick={handlePrevMonth}
            className='p-1 hover:bg-gray-100 rounded'>
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={handleNextMonth}
            className='p-1 hover:bg-gray-100 rounded'>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className='grid grid-cols-7 gap-1 mb-2'>
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div
            key={day}
            className='text-center text-xs font-medium text-gray-500'>
            {day}
          </div>
        ))}
      </div>

      <div className='grid grid-cols-7 gap-1'>
        {days.map((day, index) => (
          <button
            key={index}
            className={`
              h-8 w-8 flex items-center justify-center rounded text-sm
              ${!day.isCurrentMonth ? "text-gray-400" : ""}
              ${day.isToday ? "bg-blue-100" : ""}
              ${day.isSelected ? "bg-blue-600 text-white" : "hover:bg-gray-100"}
            `}
            onClick={() => {
              onChange(day.date);
              onClose();
            }}>
            {format(day.date, "d")}
          </button>
        ))}
      </div>

      <div className='mt-3 flex justify-end'>
        <button
          onClick={onClose}
          className='text-sm text-gray-600 hover:text-gray-800'>
          Cancel
        </button>
      </div>
    </div>
  );
};

const ScheduleCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tooltipData, setTooltipData] = useState<{
    schedules: Schedule[];
    position: { x: number; y: number };
  } | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null
  );
  const [selectedTeams, setSelectedTeams] = useState<number[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [scheduleDetailsView, setScheduleDetailsView] = useState(false);

  // Generate days of the week
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start week on Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handlePrevWeek = () => {
    setCurrentDate((prev) => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setCurrentDate((prev) => addDays(prev, 7));
  };

  const handleCardClick = (schedules: Schedule[], e: React.MouseEvent) => {
    // Calculate position for tooltip
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const position = {
      x: Math.min(rect.left, window.innerWidth - 300),
      y: rect.top + window.scrollY,
    };

    setTooltipData({ schedules, position });
  };

  const closeTooltip = () => {
    setTooltipData(null);
  };

  const viewScheduleDetails = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    closeTooltip();
    setScheduleDetailsView(true);
  };

  const handleBackFromDetails = () => {
    setScheduleDetailsView(false);
    setSelectedSchedule(null);
  };

  const toggleTeamFilter = (teamId: number) => {
    setSelectedTeams((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId]
    );
  };

  // Filter schedules based on selected teams
  const filteredSchedules =
    selectedTeams.length > 0
      ? mockSchedules.filter((schedule) =>
          selectedTeams.includes(schedule.teamId)
        )
      : mockSchedules;

  if (scheduleDetailsView && selectedSchedule) {
    return (
      <ScheduleDetailsView
        schedule={selectedSchedule}
        onBack={handleBackFromDetails}
      />
    );
  }

  return (
    <div className='bg-white rounded-lg shadow p-2 md:p-4'>
      {/* Calendar Header */}
      <div className='flex flex-col md:flex-row justify-between md:items-center mb-4 md:mb-6 space-y-3 md:space-y-0'>
        <h2 className='text-xl font-bold'>Schedules</h2>
        <div className='flex flex-wrap gap-2 md:gap-4'>
          <div className='relative'>
            <button
              className='flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 px-2 md:px-3 py-2 rounded text-sm'
              onClick={() => setIsFilterOpen(!isFilterOpen)}>
              <Filter size={16} />
              <span className='hidden md:inline'>Filter Teams</span>
            </button>

            {isFilterOpen && (
              <div className='absolute right-0 mt-2 bg-white shadow-lg rounded-md p-3 z-40 w-48'>
                <div className='mb-2 font-semibold'>Select Teams</div>
                {teams.map((team) => (
                  <div key={team.id} className='flex items-center mb-2'>
                    <input
                      type='checkbox'
                      id={`team-${team.id}`}
                      checked={selectedTeams.includes(team.id)}
                      onChange={() => toggleTeamFilter(team.id)}
                      className='mr-2'
                    />
                    <label htmlFor={`team-${team.id}`}>{team.name}</label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className='flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-2 md:px-3 py-2 rounded text-sm'>
            <Plus size={16} />
            <span className='hidden md:inline'>Add Schedule</span>
          </button>
        </div>
      </div>

      {/* Week Navigation */}
      <div className='flex flex-col sm:flex-row justify-between sm:items-center mb-4 space-y-2 sm:space-y-0'>
        <div className='relative'>
          <button
            onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            className='flex items-center space-x-1 px-2 py-1 border rounded hover:bg-gray-50 text-sm'>
            <CalendarIcon size={16} />
            <span>
              {format(weekStart, "MMMM d")} -{" "}
              {format(
                endOfWeek(currentDate, { weekStartsOn: 1 }),
                "MMMM d, yyyy"
              )}
            </span>
          </button>

          {isDatePickerOpen && (
            <div className='absolute top-full left-0 z-40 mt-1'>
              <DatePicker
                selectedDate={currentDate}
                onChange={setCurrentDate}
                onClose={() => setIsDatePickerOpen(false)}
              />
            </div>
          )}
        </div>

        <div className='flex space-x-2'>
          <button
            onClick={handlePrevWeek}
            className='p-2 rounded hover:bg-gray-100'>
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className='px-3 py-1 rounded hover:bg-gray-100 text-sm'>
            Today
          </button>
          <button
            onClick={handleNextWeek}
            className='p-2 rounded hover:bg-gray-100'>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Mobile View - Stacked Days */}
      <div className='md:hidden space-y-4'>
        {weekDays.map((day, dayIndex) => {
          const formattedDate = format(day, "yyyy-MM-dd");
          const dayScheduleGroups = getUniqueSchedules(
            filteredSchedules,
            formattedDate
          );

          return (
            <div key={dayIndex} className='border rounded'>
              <div
                className={`p-2 font-bold ${
                  isSameDay(day, new Date()) ? "bg-blue-50" : "bg-gray-50"
                }`}>
                {format(day, "EEE, MMM d")}
              </div>
              {dayScheduleGroups.length > 0 ? (
                <div className='p-2 space-y-2'>
                  {dayScheduleGroups.map((group, idx) => (
                    <div
                      key={idx}
                      className={`rounded p-2 text-sm text-white ${
                        group.length > 1
                          ? "bg-blue-800"
                          : statusColors[group[0].status]
                      }`}
                      onClick={(e) => handleCardClick(group, e)}>
                      {group.length > 1 ? (
                        <div>
                          <div className='font-bold'>{group.length} Teams</div>
                          <div>
                            {group[0].startTime} - {group[0].endTime}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className='font-bold'>{group[0].teamName}</div>
                          <div>{group[0].status}</div>
                          <div>
                            {group[0].startTime} - {group[0].endTime}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className='p-4 text-center text-gray-500'>
                  No schedules
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop Calendar Grid */}
      <div className='hidden md:block overflow-auto'>
        <div className='min-w-full'>
          {/* Day Headers */}
          <div className='grid grid-cols-8 border-b'>
            <div className='p-2 font-semibold text-center'>Time</div>
            {weekDays.map((day, index) => (
              <div
                key={index}
                className={`p-2 font-semibold text-center ${
                  isSameDay(day, new Date()) ? "bg-blue-50" : ""
                }`}>
                <div>{format(day, "EEE")}</div>
                <div>{format(day, "d")}</div>
              </div>
            ))}
          </div>

          {/* Time Grid */}
          {timeSlots.map((time, timeIndex) => {
            const hour = timeIndex + 8; // 8am is our starting time

            return (
              <div
                key={timeIndex}
                className='grid grid-cols-8 border-b min-h-16'>
                <div className='p-2 text-center text-sm border-r'>{time}</div>

                {weekDays.map((day, dayIndex) => {
                  const formattedDate = format(day, "yyyy-MM-dd");
                  const dayScheduleGroups = getUniqueSchedules(
                    filteredSchedules,
                    formattedDate
                  );

                  return (
                    <div
                      key={dayIndex}
                      className={`relative p-1 border-r ${
                        isSameDay(day, new Date()) ? "bg-blue-50" : ""
                      }`}>
                      <ScheduleGroups
                        daySchedules={dayScheduleGroups}
                        hour={hour}
                        onClick={handleCardClick}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tooltip */}
      {tooltipData && (
        <ScheduleTooltip
          schedules={tooltipData.schedules}
          position={tooltipData.position}
          onClose={closeTooltip}
          onViewDetails={viewScheduleDetails}
        />
      )}
    </div>
  );
};

export default ScheduleCalendar;
