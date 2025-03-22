/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

const BASE_URL =
  "http://ec2-3-28-58-24.me-central-1.compute.amazonaws.com/api/v1";

// Function to block time slots
async function blockTimeSlots(body: any) {
  try {
    const response = await fetch(`${BASE_URL}/bookings/block-schedule`, {
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
    console.error("Error blocking time slots:", error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();

    // Validate the required fields in the body
    if (
      !body.userPhone ||
      !body.no_of_cleaners ||
      !body.userId ||
      !body.timeslots ||
      !body.teamId ||
      !body.areaId ||
      !body.districtId ||
      !body.propertyId ||
      !body.residenceTypeId ||
      !body.startDate ||
      !body.endDate ||
      !body.frequency ||
      !body.serviceId
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
    const result = await blockTimeSlots(body);

    return NextResponse.json({
      success: true,
      message: "Time slots blocked successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error blocking time slots:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
