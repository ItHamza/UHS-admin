"use server";
import { getSchedules } from "@/lib/service/schedules";

export default async function ScheduleAction() {
  const schedules = await getSchedules();
  return schedules.data;
}
