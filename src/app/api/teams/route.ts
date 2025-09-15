import { NextRequest, NextResponse } from "next/server";

const BASE_URL =
  "https://backend.urbanservices-qa.com/api/v1";
const BASE_URLV2 =
  "https://backend.urbanservices-qa.com/api/v2";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || ""
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', String(limit));
    // params.append('search', String(search));
    const response = await fetch(`${BASE_URLV2}/teams?${params.toString()}`);
    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }
    const teams = await response.json();

    return NextResponse.json({
      success: true,
      message: "Teams fetched successfully",
      data: teams.data,
      pagination: teams.pagination
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
    const { 
      name,
      description,
      team_type,
      lat,
      lng,
      user_ids,
      service_ids,
      start_date,
      work_start_time,
      work_end_time,
      break_start_time,
      break_end_time,
      off_days,
      area_ids,
      district_ids,
      property_ids,
      area_id,
      district_id,
      property_id,
      residence_type_id,
    } = await req.json();

    if (
      !name ||
      !team_type ||
      !user_ids?.length ||
      !start_date ||
      !work_start_time ||
      !work_end_time
    ) {
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
      team_type,
      lat,
      lng,
      user_ids,
      service_ids,
      start_date,
      work_start_time,
      work_end_time,
      break_start_time,
      break_end_time,
      off_days,
      area_ids,
      district_ids,
      property_ids,
      area_id,
      district_id,
      property_id,
      residence_type_id,
    };

    const res = await fetch(`${BASE_URLV2}/teams`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    return NextResponse.json({
      success: true,
      message: "Team created successfully",
      data: result.data,
    });
  } catch (error: any) {
    console.error("POST error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}


export async function PUT(req: NextRequest) {
  try {
    const {
      id,
      name,
      description,
      team_type,
      lat,
      lng,
      user_ids,
      service_ids,
      start_date,
      work_start_time,
      work_end_time,
      break_start_time,
      break_end_time,
      // off_days,
      area_ids,
      district_ids,
      property_ids,
      residence_type_ids,
    } = await req.json();

    if (!id || !name || !user_ids?.length || !work_start_time || !work_end_time) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const data = {
      id,
      name,
      description,
      team_type,
      lat,
      lng,
      user_ids,
      service_ids,
      start_date,
      work_start_time,
      work_end_time,
      break_start_time,
      break_end_time,
      // off_days,
      area_ids,
      district_ids,
      property_ids,
      residence_type_ids,
    };

    if (
      data.start_date === null ||
      data.start_date === undefined ||
      (typeof data.start_date === "string" && data.start_date.trim() === "")
    ) {
      delete data.start_date;
    }

    console.log(data)
    const res = await fetch(`${BASE_URLV2}/teams/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    console.log(result)
    return NextResponse.json({
      success: true,
      message: "Team updated successfully",
      data: result.data,
    });
  } catch (error: any) {
    console.error("PUT error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
