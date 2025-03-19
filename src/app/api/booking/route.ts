import { NextResponse } from "next/server";
import moment from "moment";

const BASE_URL =
  "http://ec2-3-28-58-24.me-central-1.compute.amazonaws.com/api/v1";

async function fetchBookings() {
  const response = await fetch(`${BASE_URL}/bookings/bookings`);
  if (!response.ok) {
    throw new Error("Failed to fetch bookings");
  }
  const data = await response.json();
  return data.data || [];
}

export async function GET() {
  try {
    const bookings = await fetchBookings();

    const transformedBookings = bookings.map((booking: any) => ({
      id: booking.booking_number,
      customer: booking.user.name,
      frequency: booking.recurrence_plan,
      date: `${moment(booking.date).format("DD, MMM YY")} - ${moment(
        booking.end_date
      ).format("DD, MMM YY")}`,
      status: booking.status.replace("_", " "),
      team: booking.team.name,
    }));

    return NextResponse.json({
      success: true,
      message: "Bookings fetched and transformed successfully",
      data: transformedBookings,
    });
  } catch (error: any) {
    console.error("Error fetching or transforming bookings:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
