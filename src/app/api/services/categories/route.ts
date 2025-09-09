import { NextRequest, NextResponse } from "next/server";

const BASE_URL =
  "http://ec2-3-28-198-66.me-central-1.compute.amazonaws.com/api/v1";

export async function GET() {
  try {
    const response = await fetch(`${BASE_URL}/services/sub-service-items/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch special services: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching special services:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


export async function POST(req: NextRequest) {

  try {
    const {
      service_id, name, category, sub_category, price_per_unit
    } = await req.json();
    if (!service_id ||
        !name ||
        !category ||
        !sub_category ||
        !price_per_unit) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields in the request body",
        },
        { status: 400 }
      );
    }
    const data = {
      service_id, name, category, sub_category, price_per_unit
    };
    const response = await fetch(`${BASE_URL}/services/sub-service-items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    console.log(response)
    const createRes = await response.json();
    return NextResponse.json({
      success: true,
      message: "Specialize Pricing updated successfully",
      data: createRes,
    });
  } catch (error: any) {
    console.error("Error creating:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
