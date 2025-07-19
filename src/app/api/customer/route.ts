import { NextResponse } from "next/server";

const BASE_URL =
  "http://ec2-3-28-58-24.me-central-1.compute.amazonaws.com/api/v1";

async function fetchBookings(userId: string) {
  const response = await fetch(
    `${BASE_URL}/bookings/bookings?user_id=${userId}`
  );
  if (!response.ok) {
    return [];
  }
  const data = await response.json();
  return data.data || [];
}

function getLastServiceDate(bookings: any[]) {
  if (bookings.length === 0) return "No bookings";
  const sortedBookings = bookings.sort(
    (a, b) => (new Date(b.date) as any) - (new Date(a.date) as any)
  );
  return sortedBookings[0].date;
}

function getAddress(user: any) {
  const { area, district, property } = user;
  const addressParts = [area, district, property].filter(Boolean);
  return addressParts.join(", ") || "Address not available";
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';

    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', String(limit));
    if (search === "" || search === undefined){
      params.append('role', 'user')
    } else {
      params.append('search', String(search));
    }
    const response = await fetch(`${BASE_URL}/users?${params.toString()}`);
    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }
    const { data: users, pagination: pagination } = await response.json();
    const transformedUsers = await Promise.all(
      users.map(async (user: any, index: number) => {
        const bookings = await fetchBookings(user.id);
        const totalBookings = bookings.length;
        const lastServiceDate = getLastServiceDate(bookings);
        const address = getAddress(user);

        return {
          base_id: user.id,
          id: user.user_number,
          name: user.name,
          status: user.is_active ? "Active" : "Inactive",
          totalBookings,
          lastServiceDate,
          address,
          phone: user.phone,
          email: user.email,
          apartmentNumber: user.apartment_number,
          residenceType: user.residenceType
        };
      })
    );

    return NextResponse.json({
      success: true,
      message: "Users fetched and transformed successfully",
      data: transformedUsers,
      pagination: pagination
    });
  } catch (error: any) {
    console.error("Error fetching or transforming users:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
