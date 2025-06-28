/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

const BASE_URL =
  "http://ec2-3-28-58-24.me-central-1.compute.amazonaws.com/api/v1";

async function fetchRescheduleTimeslots(data: any) {
  const response = await fetch(`${BASE_URL}/schedules/team-date`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch reschedule timeslots");
  }
  const teamRes = await response.json();
  return teamRes || [];
}

export async function POST(req: NextRequest) {
  try {
    const { teamId, date, minutes } = await req.json();
    if (!teamId || !date || !minutes) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields in the request body",
        },
        { status: 400 }
      );
    }
    const data = { teamId, date, minutes };
    const timeslots = await fetchRescheduleTimeslots(data);

    return NextResponse.json({
      success: true,
      message: "Reschedule timeslots fetched and transformed successfully",
      data: timeslots.data,
    });
  } catch (error: any) {
    console.error("Error fetching timeslots:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
