import { NextRequest, NextResponse } from "next/server";

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

export async function POST(req: NextRequest) {
  try {
    const { name, description } = await req.json();

    if (!name || !description) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields in the request body",
        },
        { status: 400 }
      );
    }
    const data = {
      name,
      description,
    };
    const userRes = await fetch(`${BASE_URL}/teams`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const createRes = await userRes.json();
    return NextResponse.json({
      success: true,
      message: "team created successfully",
      data: createRes.data,
    });
  } catch (error: any) {
    console.error("Error creating team:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { name, description, id } = await req.json();

    if (!name || !description || !id) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields in the request body",
        },
        { status: 400 }
      );
    }
    const data = {
      name,
      description,
      id,
    };
    const userRes = await fetch(`${BASE_URL}/teams/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const createRes = await userRes.json();
    return NextResponse.json({
      success: true,
      message: "user created successfully",
      data: createRes.data,
    });
  } catch (error: any) {
    console.error("Error rescheduling:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
