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

    const { payment_status, status, has_renewed } = body;

    const updateData: Record<string, any> = {};
    if (payment_status !== undefined) {
      updateData.payment_status = payment_status;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    if (has_renewed !== undefined) {
      updateData.has_renewed = has_renewed;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields provided for update" },
        { status: 400 }
      );
    }

    const result = await updateBooking(id, updateData);

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
