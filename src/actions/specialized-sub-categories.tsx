"use server"
const BASE_URL =
  "http://ec2-3-28-58-24.me-central-1.compute.amazonaws.com/api/v1";

export default async function SpecializedSubCategoriesAction(categoryId: string) {
  console.log('----------------')
  console.log(categoryId)
  try {
    // Replace with your actual API endpoint
    const response = await fetch(
      `${BASE_URL}/services/sub-service-items/category/${categoryId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Add any required authentication headers
        },
      },
    )

    if (!response.ok) {
      throw new Error("Failed to fetch specialized sub-categories")
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error in SpecializedSubCategoriesAction:", error)
    throw error
  }
}