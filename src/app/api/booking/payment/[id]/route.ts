import { NextResponse } from "next/server";


const BASE_URL =
  "http://ec2-3-28-58-24.me-central-1.compute.amazonaws.com/api/v1";

const updateBooking = async (id: string, data: any) => {
  try {
    const renewRes = await fetch(`${BASE_URL}/bookings/bookings/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const response = await renewRes.json()
    return response
  } catch (error: any) {
    console.error("Error updating renew booking:", error);
    throw new Error(error.message);
  }
};


export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: any }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const { payment_status, status } = body;

    if (!payment_status) {
      return NextResponse.json(
        { success: false, message: "Missing payment status" },
        { status: 400 }
      );
    }

    const result = await updateBooking(id, { payment_status, status });

    return NextResponse.json({
      success: true,
      message: "Payment status updated successfully",
      data: result.data,
    });
  } catch (error: any) {
    console.error("Error updating payment status:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
