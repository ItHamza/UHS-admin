import { NextRequest, NextResponse } from "next/server";

const BASE_URL =
  "http://ec2-3-28-58-24.me-central-1.compute.amazonaws.com/api/v1";

async function fetchPricingDetails() {
  const response = await fetch(`${BASE_URL}/pricing`);
  if (!response.ok) {
    return null;
  }
  const data = await response.json();
  return data.data || [];
}

function transformPricingData(pricingData: any) {
  if (pricingData.length === 0) return "No pricing data available";

  return pricingData.map((pricing: any) => ({
    id: pricing.id,
    service_id: pricing.service_id,
    residence_type_id: pricing.residence_type_id,
    frequency: pricing.frequency,
    duration_value: pricing.duration_value,
    duration_unit: pricing.duration_unit,
    unit_amount: pricing.unit_amount,
    currency: pricing.currency,
    total_services: pricing.total_services,
    total_amount: pricing.total_amount,
    createdAt: pricing.createdAt,
    updatedAt: pricing.updatedAt,
    service: pricing.service,
    residenceType: pricing.residenceType,
  }));
}

export async function GET() {
  try {
    const pricingData = await fetchPricingDetails();
    if (!pricingData) {
      return NextResponse.json(
        { error: "Failed to fetch pricing details" },
        { status: 500 }
      );
    }

    const transformedPricingData = transformPricingData(pricingData);

    return NextResponse.json({
      success: true,
      message: "Pricing data fetched and transformed successfully",
      data: transformedPricingData,
    });
  } catch (error: any) {
    console.error("Error fetching or transforming pricing data:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      service_id, residence_type_id, frequency, duration_value, duration_unit, unit_amount, currency, total_services, total_amount
    } = await req.json();
  
    if (!service_id ||
        !residence_type_id ||
        !frequency ||
        !duration_value ||
        !duration_unit ||
        !unit_amount ||
        !currency ||
        !total_services ||
        !total_amount) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields in the request body",
        },
        { status: 400 }
      );
    }
    const data = {
      service_id ,residence_type_id ,frequency ,duration_value ,duration_unit ,unit_amount ,currency ,total_services, total_amount
    };
    const pricingRes = await fetch(`${BASE_URL}/pricing`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    
    const createRes = await pricingRes.json();
    return NextResponse.json({
      success: true,
      message: "Residence created successfully",
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
