import { useState, useTransition, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  X,
  Calendar as CalendarIcon,
  ArrowLeft,
  Users,
  MapPin,
  Clock,
  Star,
  User,
  Phone,
  Book,
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
import { TeamsAction } from "@/actions/team";
import { useRouter } from "next/navigation";

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
  members: any[];
  user: any;
  booking_number: string;
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
  members: any[];
  rating: number;
  user: any;
  booking_number: string;
}

interface ScheduleDetailsViewProps {
  schedule: Schedule;
  onBack: () => void;
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className='flex items-center'>
      {[...Array(5)].map((_, index) => (
        <Star
          key={index}
          size={20}
          className={`
            ${index < Math.floor(rating) ? "text-yellow-500" : "text-gray-300"}
            ${
              index === Math.floor(rating) && rating % 1 >= 0.5
                ? "text-yellow-300"
                : ""
            }
          `}
          fill={index < Math.floor(rating) ? "currentColor" : "none"}
        />
      ))}
      <span className='ml-2 text-sm text-gray-600'>({rating.toFixed(1)})</span>
    </div>
  );
};

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
  const [expandTeamDetails, setExpandTeamDetails] = useState(false);
  const navigation = useRouter();
  return (
    <div className='bg-white rounded-lg shadow-lg'>
      {/* Header */}
      <div className='flex items-center p-4 border-b'>
        <button onClick={onBack} className='mr-2'>
          <ArrowLeft size={20} />
        </button>
        <h2 className='text-xl font-bold'>Schedule Details</h2>
      </div>

      {/* Main Content */}
      <div className='p-6 space-y-6'>
        {/* Top Section */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-4'>
            <div>
              <h3 className='text-sm font-medium text-gray-500 flex items-center'>
                <User className='mr-2 text-gray-400' size={16} /> Team
              </h3>
              <div className='flex items-center justify-between'>
                <p className='text-lg font-semibold'>{schedule.teamName}</p>
                <StarRating rating={schedule.rating} />
              </div>
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
              <h3 className='text-sm font-medium text-gray-500 flex items-center'>
                <MapPin className='mr-2 text-gray-400' size={16} /> Location
              </h3>
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
              {schedule.user && schedule.status === "Cancelled" && (
                <div>
                  <p className='text-lg font-semibold mt-2'>
                    {schedule.user?.name}
                  </p>
                  <p
                    onClick={() => {
                      navigation.push("/bookings");
                    }}
                    className='text-sm cursor-pointer font-semibold underline text-blue-500'>
                    View Booking
                  </p>
                </div>
              )}
            </div>

            {schedule.bookedBy && (
              <>
                <div>
                  <h3 className='text-sm font-medium text-gray-500'>Booked By</h3>
                  <p className='text-lg font-semibold'>{schedule.user?.name}{' '}({schedule.user?.user_number})</p>
                </div>
                <div>
                  <h3 className='text-sm font-medium text-gray-500'>Booking Number</h3>
                  <p className='text-lg font-semibold'>{schedule.booking_number}</p>
                  <p
                    onClick={() => {
                      navigation.push("/bookings");
                    }}
                    className='text-sm cursor-pointer font-semibold underline text-blue-500'>
                    View Booking
                  </p>
                </div>
              </>
            )}

            {schedule.blockedBy && (
              <div>
                <h3 className='text-sm font-medium text-gray-500'>
                  Blocked By
                </h3>
                <p className='text-lg font-semibold'>{schedule.user?.name}</p>
              </div>
            )}
          </div>
        </div>

        {/* Team Members Section */}
        <div className='border-t pt-6'>
          <div className='flex justify-between items-center mb-4'>
            <h3 className='text-lg font-medium'>Team Members</h3>
            <button
              onClick={() => setExpandTeamDetails(!expandTeamDetails)}
              className='text-blue-600 hover:text-blue-800'>
              {expandTeamDetails ? "Collapse" : "Expand"} Details
            </button>
          </div>

          {expandTeamDetails ? (
            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {schedule.members.map((member) => (
                <div
                  key={member.id}
                  className='bg-gray-50 p-4 rounded-lg shadow-sm'>
                  <div className='flex items-center mb-2'>
                    <User className='mr-2 text-gray-500' size={20} />
                    <h4 className='font-semibold'>{member.name}</h4>
                  </div>
                  <div className='flex items-center mb-2'>
                    <Phone className='mr-2 text-gray-500' size={16} />
                    <p className='text-sm text-gray-700'>{member.phone}</p>
                  </div>
                  <p className='text-xs text-gray-500'>{member.role}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className='flex space-x-2'>
              {schedule.members.slice(0, 3).map((member) => (
                <div
                  key={member.id}
                  className='bg-gray-100 rounded-full px-3 py-1 text-sm'>
                  {member.name}
                </div>
              ))}
              {schedule.members.length > 3 && (
                <div className='bg-gray-100 rounded-full px-3 py-1 text-sm'>
                  +{schedule.members.length - 3} more
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions Section */}
        {/* <div className='border-t pt-6'>
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
        </div> */}
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

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "available":
      return "bg-green-100 text-green-800";
    case "booked":
      return "bg-blue-100 text-blue-800";
    case "transporting":
      return "bg-yellow-100 text-yellow-800";
    case "break":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

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
      className='absolute bg-white rounded-xl shadow-2xl border border-gray-100 p-6 w-96 max-w-[90vw] animate-fade-in'
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
      }}>
      {/* Close Button */}
      <button
        onClick={onClose}
        className='absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors'>
        <X size={20} />
      </button>

      {!selectedTeam && schedules.length > 1 ? (
        <div>
          <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center'>
            <Users className='mr-2 text-gray-500' size={20} />
            Select Team
          </h3>
          <div className='space-y-2'>
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                onClick={() => setSelectedTeam(schedule)}
                className='flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group'>
                <div className='flex items-center space-x-3'>
                  <Users
                    className='text-gray-400 group-hover:text-blue-500 transition-colors'
                    size={16}
                  />
                  <span className='font-medium text-gray-700 group-hover:text-blue-600'>
                    {schedule.teamName}
                  </span>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    schedule.status
                  )}`}>
                  {schedule.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          {/* Team Name and Status */}
          <div className='flex justify-between items-center mb-6'>
            <div className='flex items-center space-x-3'>
              <Users className='text-gray-500' size={24} />
              <h2 className='text-xl font-bold text-gray-800'>
                {selectedTeam?.teamName}
              </h2>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                selectedTeam?.status || ""
              )}`}>
              {selectedTeam?.status}
            </span>
          </div>

          {/* Schedule Details */}
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              {/* Time */}
              <div className='flex flex-col space-x-3 bg-gray-50 p-3 rounded-lg'>
                <div className='flex items-center gap-2'>
                  <Clock className='text-gray-500' size={20} />
                  <div className='text-xs text-gray-500'>Time</div>
                </div>
                <div>
                  <div className='font-semibold mt-2 ml-2 text-sm text-gray-700'>
                    {selectedTeam?.startTime} - {selectedTeam?.endTime}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className='  bg-gray-50 p-3 rounded-lg'>
                <div className='flex items-center gap-2'>
                  <MapPin className='text-gray-500' size={20} />
                  <div className='text-xs text-gray-500'>Location</div>
                </div>

                <div className='font-semibold mt-2 ml-2 text-xs text-gray-700'>
                  {formatLocation(selectedTeam as Schedule) || "Not specified"}
                </div>
              </div>
            </div>

            {/* Team Members */}
            <div className='bg-gray-50 p-4 rounded-lg'>
              <div className='flex justify-between items-center mb-3'>
                <div className='flex items-center space-x-2'>
                  <Book className='text-gray-500' size={16} />
                  <span className='font-medium text-gray-700'>
                    Booking Details
                  </span>
                </div>
                <span className='text-xs text-gray-500'>
                  {selectedTeam?.booking_number} 
                </span>
              </div>
            </div>
            
            <div className='bg-gray-50 p-4 rounded-lg'>
              <div className='flex justify-between items-center mb-3'>
                <div className='flex items-center space-x-2'>
                  <Users className='text-gray-500' size={16} />
                  <span className='font-medium text-gray-700'>
                    Team Members
                  </span>
                </div>
                <span className='text-xs text-gray-500'>
                  {selectedTeam?.members.length} members
                </span>
              </div>

              <div className='flex -space-x-2'>
                {selectedTeam?.members.map((member: any, index: number) => (
                  <div key={member.id} className='relative' title={member.name}>
                    <img
                      src={
                        member.avatar ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${member.name}`
                      }
                      alt={member.name}
                      className='w-10 h-10 rounded-full border-2 border-white object-cover'
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* View Details Button */}
            <button
              onClick={() => selectedTeam && onViewDetails(selectedTeam)}
              className='w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center space-x-2'>
              <span>View Details</span>
            </button>
          </div>
        </div>
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
  // Handle different time formats: "8:15", "08:15", "8:15 AM", "08:15:00"
  let cleanTime = timeString.trim();

  // Remove seconds if present (08:15:00 -> 08:15)
  if (cleanTime.split(":").length === 3) {
    const parts = cleanTime.split(":");
    cleanTime = `${parts[0]}:${parts[1]}`;
  }

  // Check if it has AM/PM
  if (cleanTime.includes(" ")) {
    const [timePart, meridiem] = cleanTime.split(" ");
    let [hours, minutes] = timePart.split(":").map(Number);

    if (meridiem?.toUpperCase() === "PM" && hours !== 12) {
      hours += 12;
    } else if (meridiem?.toUpperCase() === "AM" && hours === 12) {
      hours = 0;
    }

    return hours;
  } else {
    // Assume 24-hour format or just hours
    const [hours] = cleanTime.split(":").map(Number);
    return hours;
  }
};

const ScheduleGroups: React.FC<{
  daySchedules: Schedule[][];
  hour: number;
  onClick: (schedules: Schedule[], e: React.MouseEvent) => void;
}> = ({ daySchedules, hour, onClick }) => {
  // Debug: Let's see what times we're working with
  if (daySchedules.length > 0) {
    console.log(
      "Debug - Hour:",
      hour,
      "Sample schedule times:",
      daySchedules[0]?.[0]?.startTime,
      daySchedules[0]?.[0]?.endTime,
      "Parsed start hour:",
      timeToHours(daySchedules[0]?.[0]?.startTime || "")
    );
  }

  // Only show schedules that START in this hour to avoid duplicates
  const schedulesToShow = daySchedules.filter((group) => {
    const schedule = group[0];
    const startHour = timeToHours(schedule.startTime);
    return startHour === hour;
  });

  return (
    <div className='space-y-1'>
      {schedulesToShow.map((group, idx) => (
        <div key={idx} className='space-y-1'>
          {group.map((schedule, scheduleIdx) => {
            const startHour = timeToHours(schedule.startTime);
            const endHour = timeToHours(schedule.endTime);
            const duration = endHour - startHour;

            return (
              <div
                key={`${idx}-${scheduleIdx}`}
                className={`rounded p-2 text-xs text-white cursor-pointer ${
                  statusColors[schedule.status]
                }`}
                style={{
                  height: duration > 1 ? `${duration * 60}px` : "auto",
                  minHeight: "50px",
                }}
                onClick={(e) => onClick([schedule], e)}>
                <div className='font-bold'>{schedule.teamName}</div>
                <div>{schedule.status}</div>
                <div>
                  {schedule.startTime} - {schedule.endTime}
                </div>
                <div className='text-xs truncate'>
                  {schedule.user?.user_number}
                </div>
                <div className='text-xs truncate'>
                  {schedule.property?.name}
                </div>
                <div className='text-xs truncate'>
                  {schedule.district?.name}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

const getUniqueSchedules = (schedules: Schedule[], dayStr: string) => {
  const daySchedules = schedules.filter((s) => s.date === dayStr);
  console.log(
    "Filtering schedules for day:",
    schedules.length,
    daySchedules.length
  );
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
      const teams: any = await TeamsAction(1, 20, "");
      setTeams(teams.data);
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
      members: item.members || [],
      rating: item.rating || 0,
      user: item.user || null,
      booking_number: item.booking_number
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
          {/* <button className='flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-2 md:px-3 py-2 rounded text-sm'>
            <Plus size={16} />
            <span className='hidden md:inline'>Add Schedule</span>
          </button> */}
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
                              <div>
                                {schedule.user?.user_number}
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
