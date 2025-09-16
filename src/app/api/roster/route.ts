import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const BASE_URL =
  "https://backend.urbanservices-qa.com/api/v1";

const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(":");
  const parsedHours = parseInt(hours, 10);
  const suffix = parsedHours >= 12 ? "PM" : "AM";
  const formattedHours = parsedHours % 12 || 12;
  return `${formattedHours}:${minutes} ${suffix}`;
};

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");
    const teamId = searchParams.get("team_id");

    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append("start_date", startDate);
    if (endDate) queryParams.append("end_date", endDate);
    if (teamId) queryParams.append("team_id", teamId);

    const queryString = queryParams.toString();
    const scheduleUrl = `${BASE_URL}/schedules${
      queryString ? `?${queryString}` : ""
    }`;
    const availabilityUrl = `${BASE_URL}/team-availability${
      queryString ? `?${queryString}` : ""
    }`;

    const [schedulesResponse, teamAvailabilityResponse] = await Promise.all([
      axios.get(scheduleUrl),
      axios.get(availabilityUrl),
    ]);

    const schedules = schedulesResponse.data;
    const teamAvailability = teamAvailabilityResponse.data;

    const formattedSchedules = schedules.map((schedule: any) => {
      return {
        id: schedule.id,
        date: schedule.date,
        start_time: formatTime(schedule.start_time),
        end_time: formatTime(schedule.end_time),
        team_name: schedule.Team?.name || "N/A",
        members: schedule.Team?.Users || [],
        rating: schedule.Team?.rating || 0,
        status: schedule?.is_blocked
          ? "Blocked"
          : schedule?.is_available
          ? "Available"
          : schedule?.is_booked
          ? "Booked"
          : schedule?.is_completed
          ? "Completed"
          : schedule?.is_cancelled
          ? "Cancelled"
          : schedule?.schedule_type
          ? schedule?.schedule_type.replace("_", " ").charAt(0).toUpperCase() +
            schedule?.schedule_type.slice(1)
          : "N/A",
        is_blocked: schedule.is_blocked,
        is_available: schedule?.is_available || false,
        team_id: schedule.team_id,
      };
    });

    const teamAvailabilitySchedules = await Promise.all(
      teamAvailability.map(async (schedule: any) => {
        let booking = null;

        return {
          id: schedule.id,
          date: schedule.date,
          start_time: formatTime(schedule.start_time),
          end_time: formatTime(schedule.end_time),
          team_name: schedule.team?.name || "N/A",
          members: schedule.team?.Users || [],
          rating: schedule.team?.rating || 0,
          status: schedule?.is_blocked
            ? "Blocked"
            : schedule?.is_available
            ? "Available"
            : schedule?.is_booked
            ? "Booked"
            : schedule?.is_completed
            ? "Completed"
            : schedule?.is_cancelled
            ? "Cancelled"
            : schedule?.schedule_type
            ? schedule?.schedule_type
            : "N/A",
          is_blocked: schedule.is_blocked,
          is_available: schedule?.is_available || false,
          team_id: schedule.team_id,
          apartment_number: schedule.Bookings[0]?.appartment_number || schedule.apartment_number,
          area: schedule.Area,
          district: schedule.District,
          property: schedule.Property,
          residence_type: schedule.ResidenceType,
          user: schedule.Bookings[0]?.user || null,
          booking_number: schedule.Bookings[0]?.booking_number || null,
        };
      })
    );

    const combinedSchedules = [
      ...formattedSchedules,
      ...teamAvailabilitySchedules,
    ];

    return NextResponse.json({
      schedules: combinedSchedules,
      filters: {
        start_date: startDate || null,
        end_date: endDate || null,
        team_id: teamId || null,
      },
    });
  } catch (error) {
    console.error("Error fetching or processing data:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
