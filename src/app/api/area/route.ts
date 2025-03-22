/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

const BASE_URL =
  "http://ec2-3-28-58-24.me-central-1.compute.amazonaws.com/api/v1";

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
