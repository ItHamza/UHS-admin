import { NextResponse } from "next/server";
import moment from "moment";

const BASE_URL =
  "http://ec2-3-28-58-24.me-central-1.compute.amazonaws.com/api/v1";

async function fetchBookings(page: number, limit: number, service_id: string[], user_id: string, team_id: string) {
  const params = new URLSearchParams();
  params.append('page', String(page));
  params.append('limit', String(limit));
  params.append('user_id', String(user_id));
  params.append('team_id', String(team_id));
  service_id.forEach(id => {
    params.append('service_id', id);
  });
  const response = await fetch(`${BASE_URL}/bookings/bookings?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch bookings");
  }
  const data = await response.json();
  return data || [];
}

const residenceDurationMap: any = {
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

async function getServices(ids: any[]) {
  if (!ids || ids.length === 0) return []; // Ensure no empty calls
  try {
    const response = await fetch(`${BASE_URL}/team-availability/all-by-ids`, {
      method: "POST",
      body: JSON.stringify({ ids, disableCurrentDate: true }),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    return data || [];
  } catch (error) {
    console.error("Error fetching services:", error);
    return [];
  }
}

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const service_id = searchParams.getAll('service_id');
    const user_id = String(searchParams.get('user_id'))
    const team_id = String(searchParams.get('team_id'))

    const bookings = await fetchBookings(page, limit, service_id, user_id, team_id);

    const transformedBookings = await Promise.all(
      bookings.data.map(async (booking: any) => {
        const startDate = moment(booking.date);
        const endDate = moment(booking.end_date);
        const duration = calculateDuration(startDate, endDate);

        // Fetch services, but ensure it doesn't block the main booking info
        const services = await getServices(booking.team_availability_ids).catch(
          () => []
        );

        return {
          id: booking.booking_number,
          customer: booking.user?.name || "Unknown",
          frequency: booking.recurrence_plan,
          date: `${moment(booking.date).format("DD, MMM YY")} - ${moment(
            booking.end_date
          ).format("DD, MMM YY")}`,
          status: booking.status.replace("_", " "),
          customer_id: booking.user?.user_number || "N/A",
          duration: duration,
          paymentStatus: booking.payment_status,
          instructions: booking.special_instructions,
          serviceMinutes: booking.residence_type?.type
            ? residenceDurationMap[booking.residence_type.type] || 0
            : 0,
          services, // Services are now correctly handled
          ...booking,
        };
      })
    );

    return NextResponse.json({
      success: true,
      message: "Bookings fetched and transformed successfully",
      data: transformedBookings,
      pagination: bookings.pagination
    });
  } catch (error: any) {
    console.error("Error fetching or transforming bookings:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
