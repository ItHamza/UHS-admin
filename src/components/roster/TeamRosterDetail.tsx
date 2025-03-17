"use client";

import React, { useState } from "react";
import { Team } from "@/types/team";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

interface TeamRosterDetailProps {
  team: Team;
  isOpen: boolean;
  onClose: () => void;
}

const TeamRosterDetail: React.FC<TeamRosterDetailProps> = ({
  team,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<string>("members");
  const [showCalendar, setShowCalendar] = useState<boolean>(false);

  if (!isOpen) return null;

  // Function to handle calendar date click
  const handleCalendarDateClick = (date: Date) => {
    console.log("Selected Date:", date);
    // You can filter the schedule for the selected date here
  };

  return (
    <div className='fixed inset-0 bg-gray-500 z-50 flex items-center justify-center p-4'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col'>
        {/* Header */}
        <div className='flex justify-between items-center border-b p-4'>
          <div>
            <h2 className='text-xl font-bold'>{team.name}</h2>
            <p className='text-gray-600'>
              ID: {team.id} • Led by {team.teamLeader}
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <span
              className={`px-3 py-1 text-sm rounded-full ${
                team.active
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}>
              {team.active ? "Active" : "Inactive"}
            </span>
            <button
              onClick={onClose}
              className='text-gray-500 hover:text-gray-700'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-6 w-6'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className='flex border-b overflow-x-auto'>
          <button
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
              activeTab === "members"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("members")}>
            Team Members
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
              activeTab === "schedule"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("schedule")}>
            Schedule
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
              activeTab === "equipment"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("equipment")}>
            Equipment & Vehicle
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
              activeTab === "info"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("info")}>
            Team Info
          </button>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto p-4'>
          {/* Members Tab */}
          {activeTab === "members" && (
            <div>
              <div className='flex justify-between mb-4'>
                <h3 className='text-lg font-medium'>
                  Team Members ({team.members.length})
                </h3>
                <button className='bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm'>
                  Add Member
                </button>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {team.members.map((member) => (
                  <div
                    key={member.id}
                    className='border rounded-lg p-3 flex flex-col md:flex-row'>
                    <div className='w-16 h-16 bg-gray-200 rounded-full flex-shrink-0 overflow-hidden'>
                      {member.image ? (
                        <img
                          src={member.image}
                          alt={member.name}
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        <div className='w-full h-full flex items-center justify-center text-gray-500'>
                          {member.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className='ml-3 flex-grow'>
                      <div className='flex justify-between'>
                        <h4 className='font-medium'>{member.name}</h4>
                        <span className='text-xs bg-gray-100 px-2 py-1 rounded'>
                          {member.role}
                        </span>
                      </div>

                      <div className='text-xs text-gray-600 mt-1'>
                        {member.email} • {member.phoneNumber}
                      </div>

                      <div className='mt-2 flex flex-wrap gap-1'>
                        {member.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className='bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded'>
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className='mt-2 flex justify-between text-xs'>
                        <span>{member.availability}</span>
                        <span>{member.yearsOfExperience} years exp.</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Schedule Tab */}
          {activeTab === "schedule" && (
            <div>
              <div className='flex justify-between mb-4'>
                <h3 className='text-lg font-medium'>Team Schedule</h3>
                <div>
                  <button className='bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm mr-2'>
                    Add Shift
                  </button>
                  <button
                    onClick={() => setShowCalendar(!showCalendar)}
                    className='bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm'>
                    {showCalendar ? "View Table" : "View Calendar"}
                  </button>
                </div>
              </div>

              {showCalendar ? (
                <div className='flex justify-center'>
                  <Calendar
                    onChange={(date) => handleCalendarDateClick(date as Date)}
                    value={new Date()}
                    className='border rounded-lg p-2'
                  />
                </div>
              ) : (
                <div className='overflow-x-auto'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-50'>
                      <tr>
                        <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Date
                        </th>
                        <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Time
                        </th>
                        <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Location
                        </th>
                        <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Status
                        </th>
                        <th className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Notes
                        </th>
                        <th className='px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                      {team.schedule.map((shift) => (
                        <tr key={shift.id}>
                          <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-900'>
                            {new Date(shift.date).toLocaleDateString()}
                          </td>
                          <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-900'>
                            {shift.startTime} - {shift.endTime}
                          </td>
                          <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-900'>
                            {shift.location}
                          </td>
                          <td className='px-4 py-4 whitespace-nowrap'>
                            {shift.is_blocked ? (
                              <span className='px-2 py-1 text-xs rounded-full bg-red-100 text-red-800'>
                                Blocked
                              </span>
                            ) : shift.is_available ? (
                              <span className='px-2 py-1 text-xs rounded-full bg-green-100 text-green-800'>
                                Available
                              </span>
                            ) : (
                              <span className='px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800'>
                                Booked
                              </span>
                            )}
                          </td>
                          <td className='px-4 py-4 text-sm text-gray-900'>
                            {shift.notes}
                            {shift.bookingId && (
                              <div className='text-xs text-blue-600'>
                                Booking: {shift.bookingId}
                              </div>
                            )}
                          </td>
                          <td className='px-4 py-4 whitespace-nowrap text-right text-sm font-medium'>
                            <button className='text-blue-600 hover:text-blue-900 mr-3'>
                              Edit
                            </button>
                            <button className='text-red-600 hover:text-red-900'>
                              Cancel
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Equipment & Vehicle Tab */}
          {activeTab === "equipment" && (
            <div>
              <div className='flex justify-between mb-4'>
                <h3 className='text-lg font-medium'>Equipment & Vehicle</h3>
                <button className='bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm'>
                  Update Equipment
                </button>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='bg-white border rounded-lg p-4'>
                  <h4 className='font-medium mb-3'>Equipment List</h4>
                  <ul className='space-y-2'>
                    {team.equipment.map((item, index) => (
                      <li key={index} className='flex items-center'>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-5 w-5 text-green-500 mr-2'
                          viewBox='0 0 20 20'
                          fill='currentColor'>
                          <path
                            fillRule='evenodd'
                            d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                            clipRule='evenodd'
                          />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <button className='mt-4 text-sm text-blue-600 hover:text-blue-800'>
                    + Add Equipment
                  </button>
                </div>

                <div className='bg-white border rounded-lg p-4'>
                  <h4 className='font-medium mb-3'>Vehicle Information</h4>
                  <div className='space-y-3'>
                    <div>
                      <span className='text-sm font-medium'>Vehicle ID:</span>
                      <span className='text-sm ml-2'>{team.vehicle}</span>
                    </div>
                    <div>
                      <span className='text-sm font-medium'>Type:</span>
                      <span className='text-sm ml-2'>Commercial Van</span>
                    </div>
                    <div>
                      <span className='text-sm font-medium'>
                        Last Maintenance:
                      </span>
                      <span className='text-sm ml-2'>March 5, 2025</span>
                    </div>
                    <div>
                      <span className='text-sm font-medium'>
                        Next Service Due:
                      </span>
                      <span className='text-sm ml-2'>June 5, 2025</span>
                    </div>
                    <div>
                      <span className='text-sm font-medium'>Status:</span>
                      <span className='text-sm ml-2 bg-green-100 text-green-800 px-2 py-0.5 rounded'>
                        Operational
                      </span>
                    </div>
                  </div>
                  <div className='mt-4 flex space-x-2'>
                    <button className='text-sm text-blue-600 hover:text-blue-800'>
                      Maintenance History
                    </button>
                    <button className='text-sm text-blue-600 hover:text-blue-800'>
                      Report Issue
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Team Info Tab */}
          {activeTab === "info" && (
            <div>
              <div className='flex justify-between mb-4'>
                <h3 className='text-lg font-medium'>Team Information</h3>
                <button className='bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm'>
                  Edit Team
                </button>
              </div>

              <div className='bg-white border rounded-lg p-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <div className='mb-4'>
                      <h4 className='text-sm font-medium text-gray-500'>
                        Team Details
                      </h4>
                      <div className='mt-2 space-y-2'>
                        <div>
                          <span className='text-sm font-medium'>Name:</span>
                          <span className='text-sm ml-2'>{team.name}</span>
                        </div>
                        <div>
                          <span className='text-sm font-medium'>ID:</span>
                          <span className='text-sm ml-2'>{team.id}</span>
                        </div>
                        <div>
                          <span className='text-sm font-medium'>
                            Team Leader:
                          </span>
                          <span className='text-sm ml-2'>
                            {team.teamLeader}
                          </span>
                        </div>
                        <div>
                          <span className='text-sm font-medium'>
                            Specialization:
                          </span>
                          <span className='text-sm ml-2'>
                            {team.specialization}
                          </span>
                        </div>
                        <div>
                          <span className='text-sm font-medium'>Size:</span>
                          <span className='text-sm ml-2'>
                            {team.teamSize} members
                          </span>
                        </div>
                        <div>
                          <span className='text-sm font-medium'>Created:</span>
                          <span className='text-sm ml-2'>
                            {new Date(team.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className='text-sm font-medium text-gray-500'>
                        Team Status
                      </h4>
                      <div className='mt-2 space-y-2'>
                        <div>
                          <span className='text-sm font-medium'>
                            Active Status:
                          </span>
                          <span
                            className={`text-sm ml-2 px-2 py-0.5 rounded ${
                              team.active
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}>
                            {team.active ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div>
                          <span className='text-sm font-medium'>
                            Current Rating:
                          </span>
                          <div className='inline-flex items-center ml-2'>
                            <span className='text-sm'>{team.rating}/5</span>
                            <div className='flex ml-1'>
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  xmlns='http://www.w3.org/2000/svg'
                                  className={`h-4 w-4 ${
                                    i < Math.floor(team.rating)
                                      ? "text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                  viewBox='0 0 20 20'
                                  fill='currentColor'>
                                  <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                                </svg>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div>
                          <span className='text-sm font-medium'>
                            Last Updated:
                          </span>
                          <span className='text-sm ml-2'>
                            {new Date(team.lastUpdated).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className='mb-4'>
                      <h4 className='text-sm font-medium text-gray-500'>
                        Performance Metrics
                      </h4>
                      <div className='mt-3'>
                        <div className='mb-2'>
                          <div className='flex justify-between'>
                            <span className='text-xs font-medium'>
                              Customer Satisfaction
                            </span>
                            <span className='text-xs font-medium'>94%</span>
                          </div>
                          <div className='w-full bg-gray-200 rounded-full h-2'>
                            <div
                              className='bg-green-500 h-2 rounded-full'
                              style={{ width: "94%" }}></div>
                          </div>
                        </div>

                        <div className='mb-2'>
                          <div className='flex justify-between'>
                            <span className='text-xs font-medium'>
                              On-time Completion
                            </span>
                            <span className='text-xs font-medium'>88%</span>
                          </div>
                          <div className='w-full bg-gray-200 rounded-full h-2'>
                            <div
                              className='bg-blue-500 h-2 rounded-full'
                              style={{ width: "88%" }}></div>
                          </div>
                        </div>

                        <div className='mb-2'>
                          <div className='flex justify-between'>
                            <span className='text-xs font-medium'>
                              Task Accuracy
                            </span>
                            <span className='text-xs font-medium'>92%</span>
                          </div>
                          <div className='w-full bg-gray-200 rounded-full h-2'>
                            <div
                              className='bg-purple-500 h-2 rounded-full'
                              style={{ width: "92%" }}></div>
                          </div>
                        </div>

                        <div className='mb-2'>
                          <div className='flex justify-between'>
                            <span className='text-xs font-medium'>
                              Team Collaboration
                            </span>
                            <span className='text-xs font-medium'>90%</span>
                          </div>
                          <div className='w-full bg-gray-200 rounded-full h-2'>
                            <div
                              className='bg-yellow-500 h-2 rounded-full'
                              style={{ width: "90%" }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className='border-t p-4 flex justify-end'>
          <button
            onClick={onClose}
            className='bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded text-sm'>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamRosterDetail;
