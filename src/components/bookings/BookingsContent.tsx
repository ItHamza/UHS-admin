"use client";

import React from "react";
import BookingsHeader from "./BookingsHeader";
import BookingsList from "./BookingsList";

export default function BookingsPage() {
  return (
    <div className='space-y-6 p-4 lg:p-6'>
      <BookingsHeader />
      <BookingsList />
    </div>
  );
}
