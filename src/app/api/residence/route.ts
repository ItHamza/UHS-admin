/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

const BASE_URL =
  "http://ec2-3-28-58-24.me-central-1.compute.amazonaws.com/api/v1";

async function fetchResidence() {
  const response = await fetch(`${BASE_URL}/residences/`);
  if (!response.ok) {
    throw new Error("Failed to fetch residences");
  }
  const data = await response.json();
  return data || [];
}

export async function GET() {
  try {
    const residences = await fetchResidence();

    return NextResponse.json({
      success: true,
      message: "residences fetched and transformed successfully",
      data: residences,
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
      type
    } = await req.json();
  
    if (!type) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields in the request body",
        },
        { status: 400 }
      );
    }
    const data = {
      type
    };
    const residenceRes = await fetch(`${BASE_URL}/residences`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    
    const createRes = await residenceRes.json();
    return NextResponse.json({
      success: true,
      message: "Residence created successfully",
      data: createRes,
    });
  } catch (error: any) {
    console.error("Error rescheduling:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

