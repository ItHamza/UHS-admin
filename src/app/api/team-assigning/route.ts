/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

const BASE_URL =
  "https://backend.urbanservices-qa.com/api/v2";

export async function POST(req: NextRequest) {
  try {
    const {
      district_id,
      start_date,
      duration,
    } = await req.json();
    if (!district_id || !start_date || !duration) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields in the request body",
        },
        { status: 400 }
      );
    }
    const data = {
      district_id,
      start_date,
      duration,
    };
    const response = await fetch(`${BASE_URL}/teams/team-availability`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    
    const availRes = await response.json();
    return NextResponse.json({
      success: true,
      message: "Team availability fetched successfully",
      data: availRes,
    });
  } catch (error: any) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

