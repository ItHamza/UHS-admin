import { NextRequest, NextResponse } from "next/server";

const BASE_URL =
  "http://ec2-3-28-58-24.me-central-1.compute.amazonaws.com/api/v1";

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
    const pricingRes = await fetch(`${BASE_URL}/services/sub-service-items/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const createRes = await pricingRes.json();
    return NextResponse.json({
      success: true,
      message: "Specialize Pricing updated successfully",
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
      return NextResponse.json({ success: false, message: "Specialize Pricing ID is required" }, { status: 400 });
    }

    const pricingRes = await fetch(`${BASE_URL}/services/sub-service-items/${id}?permanent=true`, {
      method: "DELETE",
    });

    return NextResponse.json({
      success: true,
      message: "Specialize Pricing deleted successfully",
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
