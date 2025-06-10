import React from "react";
import { RiCalendarFill, RiFileListFill } from "react-icons/ri";

interface RosterHeaderProps {
  activeView: "list" | "calendar";
  onViewChange: (view: "list" | "calendar") => void;
}

export default function RosterHeader({
  activeView,
  onViewChange,
}: RosterHeaderProps) {
  return (
    <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Roster Management</h1>
        <p className='text-muted-foreground'>
          Manage team schedules and availability
        </p>
      </div>
      <div className='flex items-center gap-2'>
        <div className='bg-gray-100 p-1 rounded-md flex gap-4'>
          <button
            onClick={() => onViewChange("calendar")}
            className={
              activeView === "calendar"
                ? "bg-blue-600 text-white flex items-center px-2 py-1 rounded-md"
                : "flex items-center px-2 py-1 rounded-md"
            }>
            <RiCalendarFill className='h-4 w-4 mr-2' />
            Calendar
          </button>
          <button
            onClick={() => onViewChange("list")}
            className={
              activeView === "list"
                ? "bg-blue-600 text-white flex items-center px-2 py-1 rounded-md"
                : "flex items-center px-2 py-1 rounded-md"
            }>
            <RiFileListFill className='h-4 w-4 mr-2' />
            List View
          </button>
        </div>
      </div>
    </div>
  );
}
