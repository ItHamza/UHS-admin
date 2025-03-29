"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Booking } from "@/types/booking";
import BookingFilter from "../bookings/BookingFilter";
import BookingDetail from "../bookings/BookingDetail";
import BookingAction from "@/actions/booking";
import moment from "moment";
import { TeamsAction } from "@/actions/team";
import { Team } from "@/types/team";
import { Star } from "lucide-react";
import TeamsDetail from "./teams-detail";

const TeamsList: React.FC = () => {
  const [selectedTeam, setSelectedTeam] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [teams, setTeams] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      try {
        const data = await TeamsAction();
        console.log("bookingdata", data);
        setTeams(data);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
      }
    });
  }, []);

  const handleViewTeam = (team: any) => {
    setSelectedTeam(team);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
  };

  const getStatusColor = (status: string) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-red-100 text-red-800",
      completed: "bg-green-100 text-green-800",
      in_progress: "bg-blue-100 text-blue-800",
    };
    return (
      statusColors[status as keyof typeof statusColors] ||
      "bg-gray-100 text-gray-800"
    );
  };

  const ShimmerTable = () => (
    <div className='animate-pulse'>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className='flex space-x-4 p-4 border-b'>
          <div className='w-24 h-6 bg-gray-300 rounded'></div>
          <div className='w-40 h-6 bg-gray-300 rounded'></div>
          <div className='w-40 h-6 bg-gray-300 rounded'></div>
          <div className='w-24 h-6 bg-gray-300 rounded'></div>
          <div className='w-24 h-6 bg-gray-300 rounded'></div>
          <div className='w-24 h-6 bg-gray-300 rounded'></div>
          <div className='w-24 h-6 bg-gray-300 rounded'></div>
          <div className='w-24 h-6 bg-gray-300 rounded'></div>
          <div className='w-24 h-6 bg-gray-300 rounded'></div>
        </div>
      ))}
    </div>
  );

  const ShimmerHeader = () => (
    <div className='animate-pulse'>
      <div className='flex justify-between items-center p-4 border-b'>
        <h2 className='text-lg bg-gray-300 font-medium h-6 w-28'></h2>
        <span className='text-sm bg-gray-300 text-gray-500 h-6 w-20'></span>
      </div>
    </div>
  );

  return (
    <div className='bg-white rounded-lg shadow overflow-hidden w-full'>
      {isPending ? (
        <ShimmerHeader />
      ) : (
        <div className='flex justify-between flex-col md:flex-row  md:items-center p-4 border-b'>
          <h2 className='text-lg font-medium'>Teams</h2>
        </div>
      )}

      {/* Responsive Container with Horizontal Scroll */}
      <div className='w-full overflow-x-auto'>
        {isPending ? (
          <ShimmerTable />
        ) : (
          <div className='max-w-[600px]'>
            {" "}
            {/* Ensure minimum width for full content */}
            <table className='w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  {[
                    "Team ID",
                    "Name",
                    "Description",
                    "Ratings",
                    "Service Count",
                    "Members",
                    "Created At",
                    "",
                  ].map((header, idx) => (
                    <th
                      key={idx}
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {teams.length > 0 &&
                  teams.map((team, idx) => (
                    <tr key={idx} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                        {team.team_number}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <div>
                            <div className='text-sm font-medium text-gray-900'>
                              {team.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-900'>
                          {team.description}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm flex items-center gap-1 text-gray-900'>
                          {team.ratings}{" "}
                          <Star size={16} className='text-blue-500' />
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full`}>
                          {team.service_count}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-900'>
                          {team.Users.length}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-900'>
                          {moment(team.createdAt).format("DD MMM YYYY")}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div
                          onClick={() => {
                            handleViewTeam(team);
                          }}
                          className='text-sm cursor-pointer text-blue-500 underline'>
                          View Details
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination - Simplified and Responsive */}
      <div className='bg-white px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200'>
        <div className='w-full flex justify-between items-center'>
          <div>
            <p className='text-sm text-gray-700'>
              Showing <span className='font-medium'>1</span> to{" "}
              <span className='font-medium'>{teams.length}</span> of{" "}
              <span className='font-medium'>{teams.length}</span> results
            </p>
          </div>
          <div className='flex space-x-2'>
            <button
              disabled={true}
              className='px-3 py-1 border rounded text-sm text-gray-500 bg-gray-100 cursor-not-allowed'>
              Previous
            </button>
            <button
              disabled={true}
              className='px-3 py-1 border rounded text-sm text-gray-500 bg-gray-100 cursor-not-allowed'>
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Booking detail modal/sidebar */}
      {isDetailOpen && selectedTeam && (
        <div
          className='fixed inset-0 overflow-hidden z-50'
          aria-labelledby='slide-over-title'
          role='dialog'
          aria-modal='true'>
          <div className='absolute inset-0 overflow-hidden'>
            {/* Background overlay */}
            <div
              className='absolute inset-0 bg-gray-800/40 bg-opacity-75 transition-opacity'
              aria-hidden='true'
              onClick={handleCloseDetail}></div>

            <div className='fixed inset-y-0 right-0 pl-10 max-w-full flex'>
              <div className='relative w-screen max-w-md'>
                <div className='h-full flex flex-col bg-white shadow-xl overflow-y-scroll'>
                  <TeamsDetail
                    team={selectedTeam}
                    onClose={handleCloseDetail}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsList;
