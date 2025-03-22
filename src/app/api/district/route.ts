/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

const BASE_URL =
  "http://ec2-3-28-58-24.me-central-1.compute.amazonaws.com/api/v1";

async function fetchDistrict(areaId?: string | null) {
  const response = await fetch(`${BASE_URL}/districts?areaId=${areaId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch areas");
  }
  const data = await response.json();
  return data || [];
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const areaId = searchParams.get("areaId");
    const districts = await fetchDistrict(areaId);

    return NextResponse.json({
      success: true,
      message: "districts fetched and transformed successfully",
      data: districts,
    });
  } catch (error: any) {
    console.error("Error fetching or transforming districts:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
