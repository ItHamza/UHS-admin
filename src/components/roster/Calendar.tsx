import { useState, useTransition, useEffect } from "react";
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
} from "date-fns";
import RosterAction from "@/actions/roster";
import TeamsAction from "@/actions/team";

const statusColors = {
  Working: "bg-blue-600",
  Available: "bg-green-600",
  Booked: "bg-pink-600",
  Cancelled: "bg-red-600",
  Transporting: "bg-purple-600",
  Break: "bg-yellow-600",
  Blocked: "bg-gray-600",
  Completed: "bg-slate-600",
};

type StatusType = keyof typeof statusColors;

interface ScheduleData {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  team_name: string;
  rating: number;
  status: StatusType;
  is_blocked: boolean;
  is_available: boolean;
  team_id: string;
  apartment_number: string | null;
  residence_type: { id: string; type: string } | null;
  property: { id: string; name: string } | null;
  district: { id: string; name: string } | null;
  area: { id: string; name: string } | null;
}

interface Schedule {
  id: string;
  team_id: string;
  teamName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: StatusType;
  bookedBy: string | null;
  blockedBy: string | null;
  apartment_number: string | null;
  residence_type: { id: string; type: string } | null;
  property: { id: string; name: string } | null;
  district: { id: string; name: string } | null;
  area: { id: string; name: string } | null;
}

interface ScheduleDetailsViewProps {
  schedule: Schedule;
  onBack: () => void;
}

const formatLocation = (schedule: Schedule): string => {
  const parts = [];

  if (schedule.apartment_number) parts.push(`Apt ${schedule.apartment_number}`);
  if (schedule.residence_type?.type) parts.push(schedule.residence_type.type);
  if (schedule.property?.name) parts.push(schedule.property.name);
  if (schedule.district?.name) parts.push(schedule.district.name);
  if (schedule.area) parts.push(schedule.area.name);

  return parts.length > 0 ? parts.join(", ") : "No location specified";
};

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
              <p className='text-lg font-semibold'>
                {formatLocation(schedule)}
              </p>
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
                ${
                  day.isSelected
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-100"
                }
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
              <span className='font-medium'>Location:</span>{" "}
              {selectedTeam ? formatLocation(selectedTeam) : "Not specified"}
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

const timeSlots = Array.from({ length: 15 }, (_, i) => {
  const hour = i + 8;
  return hour < 12
    ? `${hour}:00 AM`
    : hour === 12
    ? `${hour}:00 PM`
    : `${hour - 12}:00 PM`;
});

const formatTimeString = (timeString: string) => {
  return timeString;
};

const timeToHours = (timeString: string) => {
  const [timePart, meridiem] = timeString.split(" ");
  let [hours, minutes] = timePart.split(":").map(Number);

  if (meridiem === "PM" && hours !== 12) {
    hours += 12;
  } else if (meridiem === "AM" && hours === 12) {
    hours = 0;
  }

  return hours;
};

const getUniqueSchedules = (schedules: Schedule[], dayStr: string) => {
  const daySchedules = schedules.filter((s) => s.date === dayStr);
  const groups: Record<string, Schedule[]> = {};
  daySchedules.forEach((schedule) => {
    const key = `${schedule.startTime}-${schedule.endTime}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(schedule);
  });
  return Object.values(groups);
};

const ScheduleGroups: React.FC<{
  daySchedules: Schedule[][];
  hour: number;
  onClick: (schedules: Schedule[], e: React.MouseEvent) => void;
}> = ({ daySchedules, hour, onClick }) => {
  const schedulesInHour = daySchedules.filter((group) => {
    const startHour = timeToHours(group[0].startTime);
    const endHour = timeToHours(group[0].endTime);
    return startHour <= hour && endHour > hour;
  });

  const schedulesToShow = schedulesInHour.filter((group) => {
    return timeToHours(group[0].startTime) === hour;
  });

  return (
    <div className='space-y-1'>
      {schedulesToShow.map((group, idx) => (
        <div key={idx} className='space-y-1'>
          {group.map((schedule, scheduleIdx) => (
            <div
              key={`${idx}-${scheduleIdx}`}
              className={`rounded p-2 text-xs text-white cursor-pointer ${
                statusColors[schedule.status]
              }`}
              style={{
                height: "auto",
                gridRowStart: `span ${
                  timeToHours(schedule.endTime) -
                  timeToHours(schedule.startTime)
                }`,
              }}
              onClick={(e) => onClick([schedule], e)}>
              <div className='font-bold'>{schedule.teamName}</div>
              <div>{schedule.status}</div>
              <div>
                {schedule.startTime} - {schedule.endTime}
              </div>
              <div className='text-xs truncate'>{schedule.property?.name}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const ShimmerLoading = () => (
  <div className='animate-pulse space-y-4'>
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className='h-16 bg-gray-200 rounded'></div>
    ))}
  </div>
);

const ScheduleCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tooltipData, setTooltipData] = useState<{
    schedules: Schedule[];
    position: { x: number; y: number };
  } | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null
  );
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [scheduleDetailsView, setScheduleDetailsView] = useState(false);
  const [schedulesData, setSchedulesData] = useState<ScheduleData[]>([]);
  const [isPending, startTransition] = useTransition();

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const fetchSchedules = async () => {
    startTransition(async () => {
      try {
        const startDate = format(weekStart, "yyyy-MM-dd");
        const endDate = format(addDays(weekStart, 6), "yyyy-MM-dd");
        const data: ScheduleData[] = await RosterAction({
          start_date: startDate,
          end_date: endDate,
        });

        setSchedulesData(data);
      } catch (error) {
        console.error("Failed to fetch schedules:", error);
      }
    });
  };

  const fetchTeams = async () => {
    try {
      const data: any = await TeamsAction();
      setTeams(data);
    } catch (error) {
      console.error("Failed to fetch schedules:", error);
    }
  };

  useEffect(() => {
    fetchTeams();
    fetchSchedules();
  }, [currentDate]);

  const transformToSchedules = (data: ScheduleData[]): Schedule[] => {
    return data.map((item) => ({
      id: item.id,
      team_id: item.team_id,
      teamName: item.team_name,
      date: item.date,
      startTime: item.start_time,
      endTime: item.end_time,
      area: item.area || null,
      status: item.status,
      bookedBy: item.status === "Booked" ? "Customer" : null,
      blockedBy: item.is_blocked ? "Admin" : null,
      apartment_number: item.apartment_number || null,
      residence_type: item.residence_type || null,
      property: item.property || null,
      district: item.district || null,
    }));
  };

  const schedules = transformToSchedules(schedulesData);

  const filteredSchedules =
    selectedTeams.length > 0
      ? schedules.filter((schedule) => selectedTeams.includes(schedule.team_id))
      : schedules;

  const handlePrevWeek = () => {
    setCurrentDate((prev) => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setCurrentDate((prev) => addDays(prev, 7));
  };

  const handleCardClick = (schedules: Schedule[], e: React.MouseEvent) => {
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

  const toggleTeamFilter = (teamId: string) => {
    setSelectedTeams((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId]
    );
  };

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
                  <div key={team.id} className='flex items-start mb-2'>
                    <input
                      type='checkbox'
                      id={`${team.id}`}
                      checked={selectedTeams.includes(team.id)}
                      onChange={() => toggleTeamFilter(team.id)}
                      className='mr-2 mt-1'
                    />
                    <label htmlFor={`${team.id}`}>{team.name}</label>
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
      {isPending ? (
        <ShimmerLoading />
      ) : (
        <>
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
                        <div key={idx} className='space-y-2'>
                          {group.map((schedule, scheduleIdx) => (
                            <div
                              key={`${idx}-${scheduleIdx}`}
                              className={`rounded p-2 text-sm text-white ${
                                statusColors[schedule.status]
                              }`}
                              onClick={(e) => handleCardClick([schedule], e)}>
                              <div className='font-bold'>
                                {schedule.teamName}
                              </div>
                              <div>{schedule.status}</div>
                              <div>
                                {schedule.startTime} - {schedule.endTime}
                              </div>
                              <div className='text-xs mt-1 truncate'>
                                {schedule.property?.name}
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className='p-2 text-gray-500'>No schedules</div>
                  )}
                </div>
              );
            })}
          </div>

          <div className='hidden md:block overflow-auto'>
            <div className='min-w-[800px]'>
              <div className='grid grid-cols-8 border-b'>
                <div className='py-2 px-4 text-center bg-gray-50'></div>
                {weekDays.map((day, i) => (
                  <div
                    key={i}
                    className={`py-2 px-4 text-center font-semibold ${
                      isSameDay(day, new Date()) ? "bg-blue-50" : "bg-gray-50"
                    }`}>
                    <div>{format(day, "EEE")}</div>
                    <div>{format(day, "MMM d")}</div>
                  </div>
                ))}
              </div>

              {timeSlots.map((timeSlot, timeIndex) => {
                const hour = timeIndex + 8;
                return (
                  <div key={timeIndex} className='grid grid-cols-8 border-b'>
                    <div className='py-2 px-4 text-xs text-gray-500 bg-gray-50 border-r'>
                      {timeSlot}
                    </div>
                    {weekDays.map((day, dayIndex) => {
                      const formattedDate = format(day, "yyyy-MM-dd");
                      const dayScheduleGroups = getUniqueSchedules(
                        filteredSchedules,
                        formattedDate
                      );
                      return (
                        <div
                          key={dayIndex}
                          className='py-2 px-1 min-h-[60px] border-r'>
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

          {tooltipData && (
            <ScheduleTooltip
              schedules={tooltipData.schedules}
              position={tooltipData.position}
              onClose={closeTooltip}
              onViewDetails={viewScheduleDetails}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ScheduleCalendar;
