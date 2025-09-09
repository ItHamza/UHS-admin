/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

const BASE_URL =
  "http://ec2-3-28-198-66.me-central-1.compute.amazonaws.com/api/v1";

async function fetchArea() {
  const response = await fetch(`${BASE_URL}/areas/`);
  if (!response.ok) {
    throw new Error("Failed to fetch areas");
  }
  const data = await response.json();
  return data || [];
}

export async function GET() {
  try {
    const areas = await fetchArea();

    return NextResponse.json({
      success: true,
      message: "areas fetched and transformed successfully",
      data: areas,
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
      name,
      latitude,
      longitude,
    } = await req.json();
    if (!name || !latitude || !longitude) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields in the request body",
        },
        { status: 400 }
      );
    }
    const data = {
      name,
      latitude,
      longitude,
    };
    const areaRes = await fetch(`${BASE_URL}/areas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    
    const createRes = await areaRes.json();
    return NextResponse.json({
      success: true,
      message: "Area created successfully",
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
