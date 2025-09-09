/* eslint-disable @typescript-eslint/no-explicit-any */
import moment from "moment";
import { NextRequest, NextResponse } from "next/server";

const BASE_URL =
  "http://ec2-3-28-198-66.me-central-1.compute.amazonaws.com/api/v1";
interface ResidenceDurationMap {
  [key: string]: number;
}

// Residence duration mapping
const residenceDurationMap: ResidenceDurationMap = {
  Studio: 45,
  "1BHK Apartment": 60,
  "1BHK + Study Room": 90,
  "2BHK Apartment": 120,
  "2BHK Townhouse": 150,
  "3BHK Apartment": 150,
  "3BHK Townhouse": 180,
  "3BHK Villa": 210,
  "4BHK Apartment": 210,
  "4BHK Villa": 240,
  "5BHK Apartment": 300,
  "5BHK Villa": 300,
};

async function fetchBookings(bookingId: string) {
  const response = await fetch(`${BASE_URL}/bookings/bookings/${bookingId}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch booking with ID: ${bookingId}`);
  }

  const data = await response.json();
  return data.data || null;
}

/**
 * Fetch team availability with caching
 */
async function fetchTeamAvailabilities(
  data: {
    ids: string[];
    disableCurrentDate: boolean;
    userId: string;
  }
) {
    const response = await fetch(`${BASE_URL}/team-availability/all-by-ids`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const createRes = await response.json();
    if (!response.ok) {
      throw new Error(`Failed to fetch booking future datses`);
    }

    return createRes.data || null;
}

/**
 * Calculate duration between dates
 */
function calculateDuration(
  startDate: moment.Moment,
  endDate: moment.Moment
): string {
  const durationInDays = endDate.diff(startDate, "days");

  if (durationInDays >= 365) {
    const years = Math.floor(durationInDays / 365);
    return `${years} ${years === 1 ? "year" : "years"}`;
  } else if (durationInDays >= 30) {
    const months = Math.floor(durationInDays / 30);
    return `${months} ${months === 1 ? "month" : "months"}`;
  } else {
    return `${durationInDays} ${durationInDays === 1 ? "day" : "days"}`;
  }
}

/**
 * Transform booking data for client consumption
 * This is separated to make the code more maintainable
 */
async function transformBooking(booking: any) {
  const startDate = moment(booking.date);
  const endDate = moment(booking.end_date);
  const teamAvailabilities =
    booking.team_availability_ids.length > 0
      ? await fetchTeamAvailabilities(
          {
            ids: booking.team_availability_ids,
            disableCurrentDate: true,
            userId: booking.user_id
          }
        )
      : [];
  return {
    id: booking.booking_number,
    customer: booking.user?.name || "Unknown",
    frequency: booking.recurrence_plan,
    date: `${startDate.format("DD, MMM YY")} - ${endDate.format("DD, MMM YY")}`,
    paymentStatus: booking.payment_status?.replace("_", " ") || "Unknown",
    status: booking.status || "Unknown",
    team: booking.team?.name || "Unknown",
    service: booking.service?.name || "Unknown",
    startDate: startDate.format("DD MMM YYYY"),
    endDate: endDate.format("DD MMM YYYY"),
    ref: booking.id,
    teamAvailabilities:
      teamAvailabilities || booking.team_availability_ids || [],
    residenceType: booking.residence_type?.type || "Unknown",
    serviceMinutes: booking.residence_type?.type
      ? residenceDurationMap[booking.residence_type.type] || 0
      : 0,
    duration: calculateDuration(startDate, endDate),
    ...booking,
  };
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: any }> }
) {
  try {
    const { id } = await params;
    // Fetch bookings
    const booking = await fetchBookings(id);

    // Transform bookings in batch
    const bookingData = await transformBooking(booking);

    return NextResponse.json({
      success: true,
      message: "Bookings fetched and transformed successfully",
      data: bookingData,
    });
  } catch (error: any) {
    console.error("Error fetching or transforming bookings:", error);
    return NextResponse.json(
      { success: false, message: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}

const updateBooking = async (id: string, data: any) => {
  try {
    const renewRes = await fetch(`${BASE_URL}/bookings/bookings/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const response = await renewRes.json()
    return response
  } catch (error: any) {
    console.error("Error updating renew booking:", error);
    throw new Error(error.message);
  }
};


export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: any }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const bookingRes = await updateBooking(id, body);
    if (bookingRes.success && body.prev_booking_id) {
      await updateBooking(body.prev_booking_id, {
        has_renewed: true,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Booking renewed successfully",
      data: bookingRes.data,
    });
  } catch (error: any) {
    console.error("Error renewing bookings:", error);
    return NextResponse.json(
      { success: false, message: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}
