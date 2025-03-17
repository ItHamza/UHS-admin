"use client";

import React from "react";
import ScheduleHeader from "./ScheduleHeader";
import SchedulesList from "./ScheduleList";

export default function SchedulesPage() {
  return (
    <div className='space-y-6 p-4 lg:p-6'>
      <ScheduleHeader />
      <SchedulesList />
    </div>
  );
}
