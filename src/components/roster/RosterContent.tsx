"use client";

import React from "react";
import RosterHeader from "./RosterHeader";
import TeamRosterList from "./RosterList";

export default function RosterPage() {
  return (
    <div className='space-y-6 p-4 lg:p-6'>
      <RosterHeader />
      <TeamRosterList />
    </div>
  );
}
