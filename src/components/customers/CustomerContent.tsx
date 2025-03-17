"use client";

import React from "react";
import CustomersHeader from "./CustomersHeader";
import CustomerFilters from "./CustomersFilter";
import CustomersList from "./CustomersList";

export default function CustomersPage() {
  return (
    <div className='space-y-6 p-4 lg:p-6'>
      <CustomersHeader />
      <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
        <div className='lg:col-span-1'>
          <CustomerFilters />
        </div>
        <div className='lg:col-span-3'>
          <CustomersList />
        </div>
      </div>
    </div>
  );
}
