"use server";
import { generateSchedule, getSchedules } from "@/lib/service/schedules";

export async function ScheduleAction() {
  const schedules = await getSchedules();
  return schedules.data;
}

export async function GenerateScheduleAction(data: any) {
  const schedules = await generateSchedule(data);
  return schedules;
}
