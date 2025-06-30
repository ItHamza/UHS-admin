/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/bundles/route.ts
import { NextRequest, NextResponse } from "next/server";

const BASE_URL =
  "http://ec2-3-28-58-24.me-central-1.compute.amazonaws.com/api/v1";

async function fetchBundles(body: any) {
  try {
    const response = await fetch(`${BASE_URL}/bundles/get-bundles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    const responseText = await response.text(); // Helps debug API response

    if (!response.ok) {
      throw new Error(
        `Failed to fetch bundles: ${response.status} ${response.statusText}`
      );
    }

    const data = JSON.parse(responseText);
    return data || [];
  } catch (error) {
    console.error("Error fetching bundles:", error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();

    // Validate the required fields in the body
    if (
      !body.startDate ||
      !body.location ||
      !body.frequency ||
      !body.servicePeriod ||
      !body.serviceType ||
      !body.duration
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields in the request body",
        },
        { status: 400 }
      );
    }

    // Fetch bundles using the provided body
    const bundles = await fetchBundles(body);

    return NextResponse.json({
      success: true,
      message: "Bundles fetched successfully",
      data: bundles,
    });
  } catch (error: any) {
    console.error("Error fetching bundles:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
