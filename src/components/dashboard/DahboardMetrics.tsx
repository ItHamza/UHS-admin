"use client";

import React from "react";
import { Bar, Line } from "recharts";
import {
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Metric {
  name: string;
  value: number;
  change: number;
  icon: React.ReactNode;
}

const DashboardMetrics: React.FC = () => {
  // Sample data for metrics
  const metrics: Metric[] = [
    {
      name: "Total Bookings",
      value: 248,
      change: 12.5,
      icon: (
        <svg
          className='w-6 h-6'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
          xmlns='http://www.w3.org/2000/svg'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
          />
        </svg>
      ),
    },
    {
      name: "Revenue",
      value: 15840,
      change: 8.2,
      icon: (
        <svg
          className='w-6 h-6'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
          xmlns='http://www.w3.org/2000/svg'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
          />
        </svg>
      ),
    },
    {
      name: "Team Utilization",
      value: 87,
      change: -2.3,
      icon: (
        <svg
          className='w-6 h-6'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
          xmlns='http://www.w3.org/2000/svg'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
          />
        </svg>
      ),
    },
    {
      name: "Customer Satisfaction",
      value: 92,
      change: 4.1,
      icon: (
        <svg
          className='w-6 h-6'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
          xmlns='http://www.w3.org/2000/svg'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5'
          />
        </svg>
      ),
    },
  ];

  const bookingData = [
    { name: "Jan", bookings: 65, revenue: 4200 },
    { name: "Feb", bookings: 59, revenue: 3800 },
    { name: "Mar", bookings: 80, revenue: 5100 },
    { name: "Apr", bookings: 81, revenue: 5400 },
    { name: "May", bookings: 56, revenue: 3900 },
    { name: "Jun", bookings: 55, revenue: 3800 },
    { name: "Jul", bookings: 72, revenue: 4800 },
  ];

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {metrics.map((metric) => (
          <div key={metric.name} className='bg-white p-4 rounded-lg shadow'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500'>{metric.name}</p>
                <div className='flex items-baseline mt-1'>
                  <p className='text-2xl font-semibold text-gray-800'>
                    {metric.name === "Revenue"
                      ? `$${metric.value.toLocaleString()}`
                      : metric.name === "Team Utilization" ||
                        metric.name === "Customer Satisfaction"
                      ? `${metric.value}%`
                      : metric.value}
                  </p>
                  <span
                    className={`ml-2 text-sm ${
                      metric.change > 0 ? "text-green-500" : "text-red-500"
                    }`}>
                    {metric.change > 0 ? "+" : ""}
                    {metric.change}%
                  </span>
                </div>
              </div>
              <div
                className={`p-2 rounded-md ${
                  metric.change > 0
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}>
                {metric.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className='bg-white p-4 rounded-lg shadow'>
        <h2 className='text-lg font-medium mb-4'>Booking & Revenue Trends</h2>
        <div className='h-64 md:h-80'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart
              data={bookingData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='name' />
              <YAxis yAxisId='left' />
              <YAxis yAxisId='right' orientation='right' />
              <Tooltip />
              <Legend />
              <Line
                yAxisId='left'
                type='monotone'
                dataKey='bookings'
                stroke='#0369a1'
                activeDot={{ r: 8 }}
              />
              <Line
                yAxisId='right'
                type='monotone'
                dataKey='revenue'
                stroke='#15803d'
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardMetrics;
