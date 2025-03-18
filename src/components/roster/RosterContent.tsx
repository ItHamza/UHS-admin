"use client";

import React, { useState } from "react";
import RosterHeader from "./RosterHeader";
import TeamRosterList from "./RosterList";
import ScheduleCalendar from "./Calendar";

export default function RosterPage() {
  const [activeView, setActiveView] = useState<"list" | "calendar">("calendar");

  return (
    <div className='space-y-6 p-4 lg:p-6'>
      <RosterHeader onViewChange={setActiveView} activeView={activeView} />
      {activeView === "list" ? <TeamRosterList /> : <ScheduleCalendar />}
    </div>
  );
}
