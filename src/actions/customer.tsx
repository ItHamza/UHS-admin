"use server";
import { getCustomers } from "@/lib/service/customer";

export default async function CustomerAction() {
  const customers = await getCustomers();
  return customers.data;
}
