import { NextResponse } from "next/server";

const BASE_URL =
  "http://ec2-3-28-58-24.me-central-1.compute.amazonaws.com/api/v1";

export async function GET() {
  try {
    const response = await fetch(`${BASE_URL}/teams`);
    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }
    const { data: teams } = await response.json();

    return NextResponse.json({
      success: true,
      message: "Teams fetched successfully",
      data: teams,
    });
  } catch (error: any) {
    console.error("Error fetching or transforming users:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
