/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

const BASE_URL =
  "http://ec2-3-28-58-24.me-central-1.compute.amazonaws.com/api/v1";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: any }> }) {
  try {
    const { id } = await params;
    const data = await req.json()
    const {
      schedule_id,
      start_time,
      end_time,
      date,
      team_id,
    } = data

    if (!id || !schedule_id || !start_time || !end_time || !date || !team_id) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields in the request body",
        },
        { status: 400 }
      );
    }
    const body = {
      schedule_id,
      start_time,
      end_time,
      date,
      team_id,
    };
    const assignRes = await fetch(`${BASE_URL}/bookings/assign-team/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const resBody = await assignRes.json();
    if (!assignRes.ok) {
      console.error("API Error Response:", resBody);
      return NextResponse.json(
        { success: false, message: resBody.message || "Unknown error" },
        { status: assignRes.status }
      );
    }
    return NextResponse.json({
      success: true,
      message: "Team and slot assign successfully",
      data: resBody.data,
    });
  } catch (error: any) {
    console.error("Error assigning team and slot:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}