/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

const BASE_URL =
  "https://backend.urbanservices-qa.com/api/v1";

// Function to block time slots
async function fetchCalendar(startDate: string, endDate: string, bookingId: string, teamId: string, user_id: string) {
  try {
    const response = await fetch(
      `${BASE_URL}/schedules/calendar/availability?start_date=${startDate}&end_date=${endDate}
        &booking_id=${bookingId}&team_id=${teamId}&userId=${user_id}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(
        `Failed to find calendar: ${response.status} ${response.statusText}`
      );
    }

    const data = JSON.parse(responseText);
    return data;
  } catch (error) {
    console.error("Error getting calendar:", error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();

    // Validate the required fields in the body
    if (!body.startDate || !body.endDate) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields in the request body",
        },
        { status: 400 }
      );
    }

    // Block the time slots
    const result = await fetchCalendar(body.startDate, body.endDate, body.booking_id, body.team_id, body.user_id);

    return NextResponse.json({
      success: true,
      message: "Dates fetched successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error getting calendar:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
