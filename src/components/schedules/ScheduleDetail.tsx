import React from "react";
import { Schedule } from "@/types/schedule";
import {
  RiCalendar2Fill,
  RiClipboardFill,
  RiClockwise2Fill,
  RiCloseFill,
  RiGroup2Fill,
  RiGroup3Fill,
  RiMapPin2Fill,
  RiPriceTag2Fill,
  RiTimeFill,
  RiXingFill,
} from "react-icons/ri";

interface ScheduleDetailProps {
  schedule: Schedule;
  onClose: () => void;
}

const ScheduleDetail: React.FC<ScheduleDetailProps> = ({
  schedule,
  onClose,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const time = new Date();
    time.setHours(parseInt(hours));
    time.setMinutes(parseInt(minutes));
    return time.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getAvailabilityStatus = () => {
    if (schedule.is_blocked)
      return { text: "Blocked", class: "bg-red-100 text-red-800" };
    if (schedule.is_available)
      return { text: "Available", class: "bg-green-100 text-green-800" };
    return { text: "Booked", class: "bg-blue-100 text-blue-800" };
  };

  const formatDuration = () => {
    const start = new Date(`2000-01-01T${schedule.startTime}`) as any;
    const end = new Date(`2000-01-01T${schedule.endTime}`) as any;
    const hours = (end - start) / (1000 * 60 * 60);
    return `${hours} hours`;
  };

  return (
    <div>
      <div className='px-4 mt-15 md:mt-0 py-6 sm:px-6'>
        <div className='flex items-start justify-between'>
          <h2
            className='text-lg font-medium text-gray-900'
            id='slide-over-title'>
            Schedule Details
          </h2>
          <div className='ml-3 h-7 flex items-center'>
            <button
              onClick={onClose}
              className='bg-white rounded-md text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-indigo-500'>
              <span className='sr-only'>Close panel</span>
              <RiCloseFill className='h-6 w-6' aria-hidden='true' />
            </button>
          </div>
        </div>
      </div>

      <div className='border-t border-gray-200 px-4 py-5 sm:px-6'>
        <div className='flex justify-between items-center'>
          <h3 className='text-lg leading-6 font-medium text-gray-900'>
            {schedule.id}
          </h3>
          <span
            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
              getAvailabilityStatus().class
            }`}>
            {getAvailabilityStatus().text}
          </span>
        </div>

        <div className='mt-6 border-t border-gray-200 pt-4'>
          <dl className='grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2'>
            <div className='sm:col-span-1'>
              <dt className='text-sm font-medium text-gray-500 flex items-center'>
                <RiPriceTag2Fill className='h-5 w-5 text-gray-400 mr-2' />
                Team ID
              </dt>
              <dd className='mt-1 text-sm text-gray-900'>{schedule.teamId}</dd>
            </div>
            <div className='sm:col-span-1'>
              <dt className='text-sm font-medium text-gray-500 flex items-center'>
                <RiGroup2Fill className='h-5 w-5 text-gray-400 mr-2' />
                Team Name
              </dt>
              <dd className='mt-1 text-sm text-gray-900'>
                {schedule.teamName}
              </dd>
            </div>

            <div className='sm:col-span-1'>
              <dt className='text-sm font-medium text-gray-500 flex items-center'>
                <RiCalendar2Fill className='h-5 w-5 text-gray-400 mr-2' />
                Date
              </dt>
              <dd className='mt-1 text-sm text-gray-900'>
                {formatDate(schedule.date)}
              </dd>
            </div>
            <div className='sm:col-span-1'>
              <dt className='text-sm font-medium text-gray-500 flex items-center'>
                <RiTimeFill className='h-5 w-5 text-gray-400 mr-2' />
                Time
              </dt>
              <dd className='mt-1 text-sm text-gray-900'>
                {formatTime(schedule.startTime)} -{" "}
                {formatTime(schedule.endTime)}
                <span className='text-gray-500 text-xs ml-2'>
                  ({formatDuration()})
                </span>
              </dd>
            </div>

            <div className='sm:col-span-1'>
              <dt className='text-sm font-medium text-gray-500 flex items-center'>
                <RiMapPin2Fill className='h-5 w-5 text-gray-400 mr-2' />
                Location
              </dt>
              <dd className='mt-1 text-sm text-gray-900'>
                {schedule.location}
              </dd>
            </div>
            <div className='sm:col-span-1'>
              <dt className='text-sm font-medium text-gray-500 flex items-center'>
                <RiGroup2Fill className='h-5 w-5 text-gray-400 mr-2' />
                Team Size
              </dt>
              <dd className='mt-1 text-sm text-gray-900'>
                {schedule.assignedMembers.length} members
              </dd>
            </div>

            <div className='sm:col-span-2'>
              <dt className='text-sm font-medium text-gray-500 flex items-center'>
                <RiGroup3Fill className='h-5 w-5 text-gray-400 mr-2' />
                Assigned Members
              </dt>
              <dd className='mt-1 text-sm text-gray-900'>
                <ul className='border border-gray-200 rounded-md divide-y divide-gray-200'>
                  {schedule.assignedMembers.map((member, index) => (
                    <li
                      key={index}
                      className='pl-3 pr-4 py-3 flex items-center justify-between text-sm'>
                      <div className='w-0 flex-1 flex items-center'>
                        <span className='ml-2 flex-1 w-0 truncate'>
                          {member}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>

            <div className='sm:col-span-2'>
              <dt className='text-sm font-medium text-gray-500 flex items-center'>
                <RiClipboardFill className='h-5 w-5 text-gray-400 mr-2' />
                Notes
              </dt>
              <dd className='mt-1 text-sm text-gray-900'>
                <p className='border border-gray-200 rounded-md p-3'>
                  {schedule.notes}
                </p>
              </dd>
            </div>

            <div className='sm:col-span-2 border-t border-gray-200 pt-4'>
              <dt className='text-sm font-medium text-gray-500'>
                Last Updated
              </dt>
              <dd className='mt-1 text-sm text-gray-900'>
                {new Date(schedule.lastUpdated).toLocaleString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className='border-t border-gray-200 px-4 py-5 sm:px-6'>
        <div className='flex space-x-3'>
          <button
            type='button'
            className='inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
            Edit Schedule
          </button>
          {schedule.is_available && (
            <button
              type='button'
              className='inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'>
              Book This Time
            </button>
          )}
          {!schedule.is_blocked && (
            <button
              type='button'
              className='inline-flex justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'>
              {schedule.is_available ? "Block Time" : "Mark as Available"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleDetail;
