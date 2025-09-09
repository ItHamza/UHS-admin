import { NextRequest, NextResponse } from "next/server";
import moment from "moment";
import { formatTime } from "@/utils/format-time";

const BASE_URL =
  "http://ec2-3-28-198-66.me-central-1.compute.amazonaws.com/api/v1";

async function fetchSchedules() {
  const response = await fetch(`${BASE_URL}/schedules`);
  if (!response.ok) {
    throw new Error("Failed to fetch bookings");
  }
  const data = await response.json();
  return data || [];
}

const calculateDuration = (startTime: string, endTime: string): string => {
  const start = new Date(`1970-01-01T${startTime}`);
  const end = new Date(`1970-01-01T${endTime}`);
  const durationInMilliseconds = end.getTime() - start.getTime();
  const durationInHours = durationInMilliseconds / (1000 * 60 * 60);

  if (durationInHours % 1 !== 0) {
    const hours = Math.floor(durationInHours);
    const minutes = Math.round((durationInHours - hours) * 60);
    return `${hours} hours ${minutes} minutes`;
  }

  return `${durationInHours} hours`;
};

export async function GET() {
  try {
    const schedules = await fetchSchedules();

    const getLocation = (schedule: any): string => {
      const locationParts = [];
      if (schedule.Property) locationParts.push(schedule.Property.name);
      if (schedule.District) locationParts.push(schedule.District.name);
      if (schedule.Area) locationParts.push(schedule.Area.name);

      return locationParts.length > 0 ? locationParts.join(" > ") : "N/A";
    };
    const transformSchedules = schedules.map((schedule: any, idx: number) => ({
      id: schedule.schedule_number || idx + 1,
      date: `${moment(schedule.date).format("DD, MMM YY")}`,
      startTime: formatTime(schedule.start_time),
      endTime: formatTime(schedule.end_time),
      status: schedule.schedule_type || "free_time",
      teamName: schedule.Team.name,
      teamId: schedule.Team.team_number,
      location: getLocation(schedule),
      duration: calculateDuration(schedule.start_time, schedule.end_time),
    }));

    return NextResponse.json({
      success: true,
      message: "Schedules fetched and transformed successfully",
      data: transformSchedules,
    });
  } catch (error: any) {
    console.error("Error fetching or transforming bookings:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      start_date,
      number_of_days,
      start_time,
      end_time,
      team_id,
      schedule_type,
    } = await req.json();

    if (
      !start_date ||
      !number_of_days ||
      !start_time ||
      !end_time ||
      !team_id ||
      !schedule_type
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields in the request body",
        },
        { status: 400 }
      );
    }
    const data = {
      start_date,
      number_of_days,
      start_time,
      end_time,
      team_id,
      schedule_type,
    };
    console.log("data", data);
    const scheduleRes = await fetch(`${BASE_URL}/schedules/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const createRes = await scheduleRes.json();
    const schedules = createRes.schedules;
    const createBulk = await fetch(`${BASE_URL}/schedules/bulk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(schedules),
    });
    return NextResponse.json({
      success: true,
      message: "schedule created successfully",
    });
  } catch (error: any) {
    console.error("Error rescheduling:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
