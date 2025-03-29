"use client";

import React from "react";
import TeamsHeader from "./teams-header";
import TeamsList from "./teams-list";

export default function TeamsContent() {
  return (
    <div className='space-y-6 p-4 lg:p-6'>
      <TeamsHeader />
      <TeamsList />
    </div>
  );
}
