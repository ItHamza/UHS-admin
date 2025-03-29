import React, { useState } from "react";
import TeamsDetailHeader from "./teams-detail-header";
import { Booking } from "@/types/booking";
import {
  BuildingIcon,
  LayoutGridIcon,
  MapPinIcon,
  Star,
  UsersIcon,
} from "lucide-react";
import { formatTime } from "@/utils/format-time";
import AddScheduleModal from "./add-schedule";
import UpdateTeamModal from "./update-team";

interface TeamsDetailProps {
  team: any;
  onClose: () => void;
}

const TeamsDetail: React.FC<TeamsDetailProps> = ({ team, onClose }) => {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isAddScheduleModalOpen, setIsAddScheduleModalOpen] = useState(false);

  const handleUpdateTeam = (updatedTeam: any) => {
    // Handle team update logic here
    // console.log("Updated team:", updatedTeam);
    window.location.reload();
  };

  const handleAddSchedule = (schedule: any) => {
    // Handle schedule addition logic here
    window.location.reload();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <>
      <TeamsDetailHeader team={team} onClose={onClose} />

      <div className=' overflow-y-auto py-6 px-6'>
        <div className='overflow-y-auto '>
          <div className='mb-6'>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Team Information
            </h3>
            <div className='bg-gray-50 p-4 rounded-lg'>
              <div className='flex items-center mb-3'>
                <div className='bg-indigo-100 rounded-full h-10 w-10 flex items-center justify-center mr-3'>
                  <span className='text-indigo-800 font-medium'>
                    {team.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h4 className='text-md font-medium'>{team.name}</h4>
                </div>
              </div>
              <div className='text-sm space-y-2 w-full text-gray-500'>
                {team.description}
              </div>
              <div className='text-sm space-y-4'>
                <div className='flex mt-4 gap-6 items-center text-gray-700'>
                  <div className='flex items-center '>
                    <Star className='mr-2 h-5 w-5 text-blue-500' />
                    {team.ratings}{" "}
                  </div>

                  <span
                    className={`inline-flex px-2 py-1 text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-600`}>
                    {team.service_count} services
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className='mb-6'>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Team Members {`(${team.Users.length})`}
            </h3>
            <div className='bg-gray-50 p-4 rounded-lg'>
              {team.Users && (
                <ul className='divide-y divide-gray-200'>
                  {team.Users.map((member: any, index: number) => (
                    <li key={index} className='py-2 flex items-center'>
                      <div className='bg-gray-200 rounded-full h-8 w-8 flex items-center justify-center mr-3'>
                        <span className='text-gray-600 font-medium text-sm'>
                          {member.name.charAt(0)}
                        </span>
                      </div>
                      <div className='flex items-center flex-col'>
                        <span>{member.name}</span>
                        <span>{member.phone}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className='mt-6  flex gap-4 '>
            <button
              onClick={() => {
                setIsUpdateModalOpen(true);
              }}
              className='flex-1   bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none cursor-pointer'>
              Update Team
            </button>

            <button
              onClick={() => {
                setIsAddScheduleModalOpen(true);
              }}
              className='flex-1  bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none cursor-pointer'>
              Add Schedule
            </button>
          </div>
        </div>
      </div>
      {isUpdateModalOpen && (
        <UpdateTeamModal
          team={team}
          users={[]} // Pass your list of all available users here
          onClose={() => setIsUpdateModalOpen(false)}
          onUpdate={handleUpdateTeam}
        />
      )}

      {isAddScheduleModalOpen && (
        <AddScheduleModal
          onClose={() => setIsAddScheduleModalOpen(false)}
          onSubmit={handleAddSchedule}
          teamId={team.id}
        />
      )}
    </>
  );
};

export default TeamsDetail;
