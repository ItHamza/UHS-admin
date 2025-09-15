import { NextRequest, NextResponse } from "next/server";

const BASE_URL =
  "https://backend.urbanservices-qa.com/api/v2";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: any }> }) {

   try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ success: false, message: "Team ID is required" }, { status: 400 });
    }
    const teamRes = await fetch(`${BASE_URL}/teams/${id}`, {
      method: "DELETE",
    });

    return NextResponse.json({
      success: true,
      message: "Team deleted successfully",
      data: teamRes,
    });
  } catch (error: any) {
    console.error("Error updating team:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
  
}
