/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

const BASE_URL =
  "https://backend.urbanservices-qa.com/api/v1";

async function fetchNotification() {
  const response = await fetch(`${BASE_URL}/notifications/`);
  if (!response.ok) {
    throw new Error("Failed to fetch notifications");
  }
  const data = await response.json();
  return data || [];
}

export async function GET() {
  try {
    const notifications = await fetchNotification();

    return NextResponse.json({
      success: true,
      message: "Notifications fetched successfully",
      data: notifications,
    });
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}


export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, all, ids } = body ?? {};
    let notificationRes
  
    if (all === true) {
      notificationRes = await fetch(`${BASE_URL}/notifications/read-all`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } else if (id !== undefined && id !== null) {      
      notificationRes = await fetch(`${BASE_URL}/notifications/${id}/read`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    if (!notificationRes?.ok) {
      const text = await notificationRes?.text(); // log error HTML
      console.error("Backend error:", text);
      return NextResponse.json(
        { success: false, message: "Backend returned error" },
        { status: notificationRes?.status }
      );
    }
    
    const updateRes = await notificationRes.json();
    return NextResponse.json({
      success: true,
      message: "Notification updated successfully",
      data: updateRes,
    });
  } catch (error: any) {
    console.error("Error updating:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
