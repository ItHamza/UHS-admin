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

export async function GET() {
  try {
    const bookings = await fetchBookings();

    const transformedBookings = bookings.map((booking: any) => {
      const startDate = moment(booking.date);
      const endDate = moment(booking.end_date);
      const duration = calculateDuration(startDate, endDate);

      return {
        id: booking.booking_number,
        customer: booking.user.name,
        frequency: booking.recurrence_plan,
        date: `${moment(booking.date).format("DD, MMM YY")} - ${moment(
          booking.end_date
        ).format("DD, MMM YY")}`,
        status: booking.status.replace("_", " "),
        customer_id: booking.user.user_number,
        duration: duration,
        paymentStatus: booking.payment_status,
        instructions: booking.special_instructions,
        ...booking,
      };
    });

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
