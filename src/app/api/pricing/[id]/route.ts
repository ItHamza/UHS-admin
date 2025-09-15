import { NextRequest, NextResponse } from "next/server";

const BASE_URL =
  "https://backend.urbanservices-qa.com/api/v1";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: any }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields in the request body",
        },
        { status: 400 }
      );
    }
    const pricingRes = await fetch(`${BASE_URL}/pricing/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const createRes = await pricingRes.json();
    return NextResponse.json({
      success: true,
      message: "Residence updated successfully",
      data: createRes.data,
    });
  } catch (error: any) {
    console.error("Error updating pricing:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}


export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: any }> }) {

   try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ success: false, message: "Residence ID is required" }, { status: 400 });
    }

    const pricingRes = await fetch(`${BASE_URL}/pricing/${id}`, {
      method: "DELETE",
    });

    return NextResponse.json({
      success: true,
      message: "Residence deleted successfully",
      data: pricingRes,
    });
  } catch (error: any) {
    console.error("Error updating pricing:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
  
}
