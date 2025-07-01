/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

const BASE_URL =
  "http://ec2-3-28-58-24.me-central-1.compute.amazonaws.com/api/v1";

async function createSpecialiseBooking(body: any) {
  try {
    const response = await fetch(`${BASE_URL}/bookings/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    const responseText = await response.text(); // Helps debug API response
    console.log("Response Text:", responseText);

    if (!response.ok) {
      throw new Error(
        `Failed to block time slots: ${response.status} ${response.statusText}`
      );
    }

    const data = JSON.parse(responseText); // Convert text response to JSON
    return data;
  } catch (error) {
    console.error("Error booking deep service:", error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    // Validate the required fields in the body
    if (
      !body.end_date ||
      !body.recurrence_plan ||
      !body.payment_status ||
      !body.status ||
      !body.user_id === undefined ||
      !body.service_id ||
      !body.area_id ||
      !body.district_id ||
      !body.property_id ||
      !body.residence_type_id ||
      !body.total_amount ||
      !body.currency ||
      !body.no_of_cleaners ||
      !body.cleaning_supplies === undefined ||
      !body.appartment_number ||
      !body.is_renewed === undefined ||
      !body.has_renewed === undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields in the request body",
        },
        { status: 400 }
      );
    }

    // Block the time slots
    const result = await createSpecialiseBooking(body);

    return NextResponse.json({
      success: true,
      message: "Deep service booked successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error booking deep service:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
