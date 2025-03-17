"use client";

import React, { useState } from "react";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: "available" | "busy" | "unavailable";
  currentTask?: string;
  nextAvailable?: string;
  completedJobs: number;
  rating: number;
}

const TeamAvailability: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const teamMembers: TeamMember[] = [
    {
      id: "TM001",
      name: "Team A",
      role: "Cleaning",
      avatar: "/api/placeholder/40/40",
      status: "busy",
      currentTask: "Premium Cleaning - Alex Johnson",
      nextAvailable: "12:30 PM",
      completedJobs: 145,
      rating: 4.9,
    },
    {
      id: "TM002",
      name: "Team B",
      role: "Deep Cleaning",
      avatar: "/api/placeholder/40/40",
      status: "available",
      completedJobs: 132,
      rating: 4.8,
    },
    {
      id: "TM003",
      name: "Team C",
      role: "Cleaning Specialists",
      avatar: "/api/placeholder/40/40",
      status: "busy",
      currentTask: "Deep Cleaning - Maria Garcia",
      nextAvailable: "3:00 PM",
      completedJobs: 98,
      rating: 4.7,
    },
    {
      id: "TM004",
      name: "Team D",
      role: "Car Washing",
      avatar: "/api/placeholder/40/40",
      status: "available",
      completedJobs: 187,
      rating: 4.9,
    },
    {
      id: "TM005",
      name: "Team E",
      role: "Regular Cleaning",
      avatar: "/api/placeholder/40/40",
      status: "unavailable",
      nextAvailable: "Tomorrow, 9:00 AM",
      completedJobs: 76,
      rating: 4.5,
    },
    {
      id: "TM006",
      name: "Team F",
      role: "Standard Cleaning",
      avatar: "/api/placeholder/40/40",
      status: "busy",
      currentTask: "Standard Cleaning - James Wilson",
      nextAvailable: "5:30 PM",
      completedJobs: 121,
      rating: 4.8,
    },
  ];

  const filteredTeamMembers =
    statusFilter === "all"
      ? teamMembers
      : teamMembers.filter((member) => member.status === statusFilter);

  const getStatusColor = (status: TeamMember["status"]) => {
    switch (status) {
      case "available":
        return "bg-green-500";
      case "busy":
        return "bg-yellow-500";
      case "unavailable":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: TeamMember["status"]) => {
    switch (status) {
      case "available":
        return "Available";
      case "busy":
        return "Busy";
      case "unavailable":
        return "Unavailable";
      default:
        return status;
    }
  };

  const renderRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <div className='flex'>
        {[...Array(fullStars)].map((_, i) => (
          <svg
            key={`full-${i}`}
            className='w-4 h-4 text-yellow-400'
            fill='currentColor'
            viewBox='0 0 20 20'
            xmlns='http://www.w3.org/2000/svg'>
            <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
          </svg>
        ))}

        {halfStar && (
          <svg
            className='w-4 h-4 text-yellow-400'
            fill='currentColor'
            viewBox='0 0 20 20'
            xmlns='http://www.w3.org/2000/svg'>
            <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
          </svg>
        )}

        {[...Array(emptyStars)].map((_, i) => (
          <svg
            key={`empty-${i}`}
            className='w-4 h-4 text-gray-300'
            fill='currentColor'
            viewBox='0 0 20 20'
            xmlns='http://www.w3.org/2000/svg'>
            <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
          </svg>
        ))}

        <span className='ml-1 text-xs text-gray-500'>{rating.toFixed(1)}</span>
      </div>
    );
  };

  // Stats for team overview
  const teamStats = {
    totalMembers: teamMembers.length,
    availableMembers: teamMembers.filter((m) => m.status === "available")
      .length,
    busyMembers: teamMembers.filter((m) => m.status === "busy").length,
    unavailableMembers: teamMembers.filter((m) => m.status === "unavailable")
      .length,
  };

  return (
    <div className='bg-white rounded-lg shadow'>
      <div className='p-4 border-b flex flex-col md:flex-row md:items-center md:justify-between'>
        <h2 className='text-lg font-medium'>Team Availability</h2>

        <div className='mt-3 md:mt-0 flex space-x-2'>
          <button
            className={`px-3 py-1 text-sm rounded-md ${
              statusFilter === "all"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => setStatusFilter("all")}>
            All ({teamMembers.length})
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-md ${
              statusFilter === "available"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => setStatusFilter("available")}>
            Available ({teamStats.availableMembers})
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-md ${
              statusFilter === "busy"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => setStatusFilter("busy")}>
            Busy ({teamStats.busyMembers})
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-md ${
              statusFilter === "unavailable"
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => setStatusFilter("unavailable")}>
            Unavailable ({teamStats.unavailableMembers})
          </button>
        </div>
      </div>

      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Team Member
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Status
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Current Task / Next Available
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Performance
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {filteredTeamMembers.map((member) => (
              <tr key={member.id} className='hover:bg-gray-50'>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0 h-10 w-10 relative'>
                      <img
                        className='h-10 w-10 rounded-full'
                        src={member.avatar}
                        alt={member.name}
                      />
                      <span
                        className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white ${getStatusColor(
                          member.status
                        )}`}></span>
                    </div>
                    <div className='ml-4'>
                      <div className='text-sm font-medium text-gray-900'>
                        {member.name}
                      </div>
                      <div className='text-sm text-gray-500'>{member.role}</div>
                    </div>
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      member.status === "available"
                        ? "bg-green-100 text-green-800"
                        : member.status === "busy"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                    {getStatusText(member.status)}
                  </span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm text-gray-900'>
                    {member.status === "busy"
                      ? member.currentTask
                      : member.status === "available"
                      ? "Ready for assignment"
                      : "Off duty"}
                  </div>
                  {(member.status === "busy" ||
                    member.status === "unavailable") && (
                    <div className='text-xs text-gray-500'>
                      Next available: {member.nextAvailable}
                    </div>
                  )}
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm text-gray-900'>
                    {member.completedJobs} jobs completed
                  </div>
                  <div className='flex items-center'>
                    {renderRatingStars(member.rating)}
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                  <button className='text-blue-600 hover:text-blue-900 mr-3'>
                    View
                  </button>
                  <button className='text-blue-600 hover:text-blue-900'>
                    Assign
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className='p-4 border-t'>
        <button className='text-sm text-blue-500 hover:text-blue-700'>
          View all team members
        </button>
      </div>
    </div>
  );
};

export default TeamAvailability;
