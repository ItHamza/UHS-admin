/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

const BASE_URL =
  "http://ec2-3-28-58-24.me-central-1.compute.amazonaws.com/api/v1";

async function fetchDistrict(areaId?: string | null) {
  const url = areaId
      ? `${BASE_URL}/districts?areaId=${areaId}` : `${BASE_URL}/districts`;

  const response = await fetch(url);
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

export async function POST(req: NextRequest) {
  try {
    const {
      areaId,
      name,
      latitude,
      longitude,
    } = await req.json();

    if (!name || !areaId) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields in the request body",
        },
        { status: 400 }
      );
    }
    const data = {
      areaId,
      name,
      latitude,
      longitude,
    };
    const districtRes = await fetch(`${BASE_URL}/districts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    
    const createRes = await districtRes.json();
    return NextResponse.json({
      success: true,
      message: "District created successfully",
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
