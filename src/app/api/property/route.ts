/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

const BASE_URL =
  "http://ec2-3-28-58-24.me-central-1.compute.amazonaws.com/api/v1";

async function fetchProperty(districtId?: string | null) {
  const response = await fetch(
    `${BASE_URL}/properties?districtId=${districtId}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch properties");
  }
  const data = await response.json();
  return data || [];
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const districtId = searchParams.get("districtId");
    const properties = await fetchProperty(districtId);

    return NextResponse.json({
      success: true,
      message: "properties fetched and transformed successfully",
      data: properties,
    });
  } catch (error: any) {
    console.error("Error fetching or transforming properties:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
