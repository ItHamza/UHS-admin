/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

const BASE_URL =
  "http://ec2-3-28-198-66.me-central-1.compute.amazonaws.com/api/v1";

async function createSpecialiseBooking(body: any) {
  try {
    const response = await fetch(`${BASE_URL}/bookings/specialised`, {
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
    console.error("Error booking specialise service:", error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    // Validate the required fields in the body
    if (
      !body.date ||
      !body.end_date ||
      !body.recurrence_plan ||
      !body.user_id ||
      !body.service_id ||
      !body.area_id ||
      !body.district_id ||
      !body.property_id ||
      !body.residence_type_id ||
      !body.user_available_in_apartment ||
      !body.appartment_number ||
      !body.no_of_cleaners ||
      !body.cleaning_supply_included ||
      !body.booking_items ||
      !body.total_amount ||
      !body.currency
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
      message: "Sepcialised service booked successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error booking specialise service:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
