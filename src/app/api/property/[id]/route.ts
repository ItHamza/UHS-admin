/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

const BASE_URL =
  "http://ec2-3-28-58-24.me-central-1.compute.amazonaws.com/api/v1";

// Function to fetch a property by ID
async function fetchPropertyById(propertyId: string) {
  const response = await fetch(`${BASE_URL}/properties/${propertyId}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch property with ID: ${propertyId}`);
  }

  const data = await response.json();
  return data || null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: any }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Property ID is required" },
        { status: 400 }
      );
    }

    const property = await fetchPropertyById(id);

    return NextResponse.json({
      success: true,
      message: "Property fetched successfully",
      data: property,
    });
  } catch (error: any) {
    console.error("Error fetching property:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
