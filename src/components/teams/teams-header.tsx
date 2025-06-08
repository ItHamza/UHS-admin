"use client";

import React, { useState, useEffect } from "react";
import { ArrowDownTrayIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import ServicesAction from "@/actions/service-action";
import AreaAction from "@/actions/area";
import DistrictAction from "@/actions/district";
import { PropertyAction } from "@/actions/property";
import ResidenceAction from "@/actions/residence";
import BundlesAction from "@/actions/bundles";
import moment from "moment";
import BlockBookingAction from "@/actions/block";
import ConfirmBookingAction from "@/actions/confirmBooking";
import CalendarAction from "@/actions/calendar";
import CustomDatePicker from "../ui/custom-date-picker";
import { UserCreateAction, UsersActions } from "@/actions/users";
import toast from "react-hot-toast";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { CreateTeamAction } from "@/actions/team";
import TeamCreationModal from "./new-teams";

const durations = [1, 3, 6, 12];
export const residenceDurationMap: any = {
  Studio: 45,
  "1BHK Apartment": 60,
  "1BHK + Study Room": 90,
  "2BHK Apartment": 120,
  "2BHK Townhouse": 150,
  "3BHK Apartment": 150,
  "3BHK Townhouse": 180,
  "3BHK Villa": 210,
  "4BHK Apartment": 210,
  "4BHK Villa": 240,
  "5BHK Apartment": 300,
  "5BHK Villa": 300,
};

export const frequencyNumberMapping: Record<string, number> = {
  one_time: 1,
  once: 1,
  twice: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
};

interface BookingData {
  service: string;
  subService: string;
  area: string;
  district: string;
  property: string;
  residenceType: string;
  frequency: string;
  duration: string;
  startDate: string;
  bundle: string;
  timeSlot: string;
  userName: string;
  phoneNumber: string;
  email: string;
  apartmentNumber: string;
  userPresent: boolean;
  specialInstructions: string;
}

interface FinalBookingData {
  userPhone: string;
  no_of_cleaners: number;
  userId: string;
  timeslots: {
    schedule_id: string;
    start_time: string;
    end_time: string;
  }[];
  teamId: string;
  areaId: string;
  districtId: string;
  propertyId: string;
  residenceTypeId: string;
  startDate: string;
  endDate: string;
  frequency: string;
}

export interface TimeSlot {
  day: string;
  date: string;
  timeSlots: {
    id: string;
    startTime: string;
    endTime: string;
  }[];
}

interface CreateTeamDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  [key: string]: any;
}

// Create Team Dialog Component
const CreateTeamDialog: React.FC<CreateTeamDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setTeamName("");
      setTeamDescription("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teamName.trim()) {
      toast.error("Team name is required");
      return;
    }

    setIsSubmitting(true);

    try {
      await CreateTeamAction({ name: teamName, description: teamDescription });

      toast.success("Team created successfully");
      onClose();
      window.location.reload();
    } catch (error) {
      console.error("Error creating team:", error);
      toast.error("Failed to create team. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-gray-800/40 bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg w-full max-w-md p-6 relative'>
        <button
          onClick={onClose}
          className='absolute top-4 right-4 text-gray-500 hover:text-gray-700'>
          <XMarkIcon className='w-5 h-5' />
        </button>

        <h2 className='text-xl font-bold mb-6'>Create New Team</h2>

        <form onSubmit={handleSubmit}>
          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Team Name <span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='Enter team name'
              required
            />
          </div>

          <div className='mb-6'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Description
            </label>
            <textarea
              value={teamDescription}
              onChange={(e) => setTeamDescription(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='Enter team description'
              rows={4}
            />
          </div>

          <div className='flex justify-end space-x-3'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50'>
              Cancel
            </button>
            <button
              type='submit'
              disabled={isSubmitting}
              className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}>
              {isSubmitting ? "Creating..." : "Create Team"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TeamsHeader: React.FC = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <div className='p-6 bg-white rounded-lg shadow-sm'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-4'>
        <div>
          <h1 className='text-2xl font-bold'>Teams</h1>
          <p className='text-gray-600'>
            Manage your teams database and view detailed team information
          </p>
        </div>
        <div className='flex space-x-3 mt-4 md:mt-0'>
          <button className='px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center'>
            <ArrowDownTrayIcon className='w-5 h-5 mr-2' />
            Export
          </button>
          {/* <button
            onClick={() => setShowCreateDialog(true)}
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center'>
            <PlusCircleIcon className='w-5 h-5 mr-2' />
            New Team
          </button> */}
          < TeamCreationModal />
        </div>
      </div>

      {/* Create Team Dialog */}
      {/* <CreateTeamDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
      /> */}
    </div>
  );
};

export default TeamsHeader;
