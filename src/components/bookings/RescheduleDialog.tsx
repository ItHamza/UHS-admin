import React, { useState, useEffect } from "react";
import {
  format,
  addDays,
  parseISO,
  isAfter,
  isBefore,
  isSameDay,
} from "date-fns";
import moment from "moment";
import { Booking } from "@/types/booking";
import CustomDatePicker from "@/components/ui/custom-date-picker"; // Adjust import path as needed
import CalendarAction from "@/actions/calendar";
import RescheduleTimeslotsAction from "@/actions/reschedule-timeslots";
import toast from "react-hot-toast";
import Loader from "../ui/loader";
import ReschedulesAction from "@/actions/reschedule";
import { formatTimeTo24Hrs } from "@/utils/format-time";

interface Service {
  id: string;
  name: string;
}

interface TeamAvailability {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  team: {
    id: string;
    name: string;
  };
}

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

enum RescheduleStep {
  SELECT_SERVICE,
  SELECT_SERVICE_DATE,
  SELECT_DATE,
  SELECT_TIMESLOT,
  REVIEW_SUMMARY,
}

// Utility Functions
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }
  return format(date, "do MMMM yyyy");
};

const formatTime = (timeString: string) => {
  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours, 10);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${suffix}`;
};

const ReschedulePackageModal: React.FC<{
  pkg: Booking;
  onClose: () => void;
}> = ({ pkg, onClose }) => {
  // State Management
  const [currentStep, setCurrentStep] = useState<RescheduleStep>(
    RescheduleStep.SELECT_SERVICE
  );
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedAvailability, setSelectedAvailability] =
    useState<TeamAvailability | null>(null);
  const [teamAvailabilities, setTeamAvailabilities] = useState<
    TeamAvailability[]
  >([]);
  const [services, setServices] = useState<any[]>([]);
  const [newStartDate, setNewStartDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeSlotLoading, setTimeSlotLoading] = useState(false);
  const [disableConfirm, setDisableConfirm] = useState(false);

  // Fetch Services and Availabilities
  useEffect(() => {
    const fetchServicesAndAvailabilities = async () => {
      try {
        setLoading(true);

        setServices(pkg.services);
        setTeamAvailabilities(pkg.services);
      } catch (error) {
        console.error("Error fetching services and availabilities:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchServicesAndAvailabilities();
  }, []);
  useEffect(() => {
    if (selectedAvailability) {
      fetchCalendar();
    }
  }, [selectedAvailability]);

  // Handlers
  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
  };

  const handleServiceDateSelect = (availability: TeamAvailability) => {
    setSelectedAvailability(availability);
  };

  const fetchTimeSlots = async (date: Date) => {
    if (!selectedAvailability || !date) return;

    try {
      if (selectedAvailability.team.id && date) {
        setTimeSlotLoading(true);
        // Call the server action with necessary data
        const response = await RescheduleTimeslotsAction(
          selectedAvailability.team.id,
          format(date, "yyyy-MM-dd"),
          pkg.serviceMinutes
        );

        // Transform the response into time slots format
        const slots = response.map((slot: any) => ({
          id: `${slot.id}_${slot.start_time}-${slot.end_time}`,
          time: `${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}`,
          available: slot.is_available,
        }));

        setAvailableTimeSlots(slots);
        setCurrentStep(RescheduleStep.SELECT_TIMESLOT);
      }
    } catch (error: any) {
      console.error("Error fetching time slots:", error);
      // Set a fallback or empty state
      toast.error(error.message);
      setAvailableTimeSlots([]);
    } finally {
      setTimeSlotLoading(false);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setNewStartDate(date);
    if (date) {
      fetchTimeSlots(date);
    }
  };

  const handleTimeSlotSelect = (slotId: string) => {
    setSelectedTimeSlot(slotId);
    setCurrentStep(RescheduleStep.REVIEW_SUMMARY);
  };

  const handleBackButton = () => {
    switch (currentStep) {
      case RescheduleStep.SELECT_SERVICE_DATE:
        setCurrentStep(RescheduleStep.SELECT_SERVICE);
        break;
      case RescheduleStep.SELECT_DATE:
        setCurrentStep(RescheduleStep.SELECT_SERVICE);
        break;
      case RescheduleStep.SELECT_TIMESLOT:
        setCurrentStep(RescheduleStep.SELECT_DATE);
        break;
      case RescheduleStep.REVIEW_SUMMARY:
        setCurrentStep(RescheduleStep.SELECT_TIMESLOT);
        break;
    }
  };

  const handleNextButton = () => {
    switch (currentStep) {
      case RescheduleStep.SELECT_SERVICE:
        if (selectedService) {
          setCurrentStep(RescheduleStep.SELECT_DATE);
        }
        break;
      case RescheduleStep.SELECT_DATE:
        if (availableTimeSlots.length > 0) {
          setCurrentStep(RescheduleStep.SELECT_TIMESLOT);
        }
        break;
    }
  };

  const handleReschedule = async () => {
    try {
      setDisableConfirm(true);
      if (!selectedAvailability || !newStartDate || !selectedTimeSlot) {
        alert("Please complete all selections");
        return;
      }

      const selectedTime =
        availableTimeSlots.find((slot) => slot.id === selectedTimeSlot)?.time ||
        "";
      const timeSplit = selectedTime.split("-");
      const startTime = formatTimeTo24Hrs(timeSplit[0].trim());
      const endTime = formatTimeTo24Hrs(timeSplit[1].trim());
      const scheduleId = selectedTimeSlot.split("_").at(0) || "";
      const rescheduleRes = await ReschedulesAction(
        selectedAvailability.id,
        scheduleId,
        startTime,
        endTime
      );
      toast.success("Reschedule successfully");
      setDisableConfirm(false);
      onClose();
      window.location.reload();
    } catch (error: any) {
      toast.error("Unable to reschedule");
      setDisableConfirm(false);
      onClose();
    }
  };

  // Render Functions
  const renderServiceSelection = () => (
    <div className='p-4'>
      <label className='text-sm font-medium mb-2 block'>
        Select a service date reschedule
      </label>
      {loading ? (
        <div className='space-y-2'>
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className='animate-pulse bg-gray-200 h-20 rounded-md'
            />
          ))}
        </div>
      ) : services.length === 0 ? (
        <p className='text-sm text-gray-500'>No services found</p>
      ) : (
        <div className='space-y-2 max-h-[300px] overflow-y-auto'>
          {services.map((service) => (
            <div
              key={service.id}
              className={`
                p-3 border rounded-md cursor-pointer transition-colors
                ${
                  selectedService?.id === service.id
                    ? "border-blue-500 bg-blue-50"
                    : "hover:bg-gray-50"
                }
              `}
              onClick={() => {
                handleServiceSelect(service);
                handleServiceDateSelect(service);
              }}>
              <div className='flex justify-between items-center'>
                <div>
                  <p className='font-medium'>
                    {moment(service.date).format("DD MMM YYYY")},{" "}
                    {formatTime(service.start_time)} -{" "}
                    {formatTime(service.end_time)}
                  </p>
                </div>
                {selectedService?.id === service.id && (
                  <div className='h-4 w-4 rounded-full bg-blue-500' />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderServiceDateSelection = () => (
    <div className='p-4'>
      <label className='text-sm font-medium mb-2 block'>
        Select a service date to reschedule
      </label>
      {loading ? (
        <div className='space-y-2'>
          {[1, 2].map((item) => (
            <div
              key={item}
              className='animate-pulse bg-gray-200 h-20 rounded-md'
            />
          ))}
        </div>
      ) : teamAvailabilities.length === 0 ? (
        <p className='text-sm text-gray-500'>No service dates found</p>
      ) : (
        <div className='space-y-2 max-h-[300px] overflow-y-auto'>
          {teamAvailabilities.map((availability) => (
            <div
              key={availability.id}
              className={`
                p-3 border rounded-md cursor-pointer transition-colors
                ${
                  selectedAvailability?.id === availability.id
                    ? "border-blue-500 bg-blue-50"
                    : "hover:bg-gray-50"
                }
              `}
              onClick={() => handleServiceDateSelect(availability)}>
              <div className='flex justify-between items-center'>
                <div>
                  <p className='font-medium'>{availability.team.name}</p>
                  <p className='text-sm text-gray-500'>
                    {formatDate(availability.date)}
                  </p>
                  <p className='text-sm text-gray-500'>
                    {formatTime(availability.start_time)} -{" "}
                    {formatTime(availability.end_time)}
                  </p>
                </div>
                {selectedAvailability?.id === availability.id && (
                  <div className='h-4 w-4 rounded-full bg-blue-500' />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const isDateDisabled = (date: Date): boolean => {
    if (!selectedAvailability) return true;

    const selectedServiceDate = parseISO(selectedAvailability.date);
    const minDate = addDays(selectedServiceDate, 1);

    // Get the last service date
    const lastServiceDate =
      teamAvailabilities.length > 0
        ? parseISO(teamAvailabilities[teamAvailabilities.length - 1].date)
        : new Date(pkg.endDate);

    const maxDate = addDays(lastServiceDate, -1);

    const isLastDate = isSameDay(date, lastServiceDate);

    // If it's the last date, allow the next 7 days
    if (isLastDate) {
      const next7Days = addDays(date, 7);
      if (isBefore(date, next7Days)) {
        return false;
      }
    }

    // Check if date is out of bounds
    if (isBefore(date, minDate) || isAfter(date, maxDate)) {
      return true;
    }

    // Check if the date is a service date or day after a service
    for (const availability of teamAvailabilities) {
      const serviceDate = parseISO(availability.date);

      // Disable the service date itself
      if (isSameDay(date, serviceDate)) {
        return true;
      }

      // Disable the day immediately after the service date
      if (isSameDay(date, addDays(serviceDate, 1))) {
        return true;
      }
    }

    return false;
  };

  const [calendar, setCalendar] = useState<any[]>([]);
  const fetchCalendar = async () => {
    try {
      setLoading(true);
      const response = await CalendarAction(
        selectedAvailability?.date as string,
        pkg.end_date
      );
      const unavailableDates = Object.entries(response.data)
        .filter(([_, isAvailable]) => !isAvailable) // Filter out unavailable dates
        .map(([dateString]) => new Date(dateString));
      setCalendar(unavailableDates);
      setLoading(false);
      setCurrentStep(RescheduleStep.SELECT_DATE);
    } catch (error) {
      console.error("Error fetching properties:", error);
      setLoading(false);
    }
  };

  const renderDateSelection = () => {
    if (!selectedAvailability) return null;

    const selectedServiceDate = parseISO(selectedAvailability.date);
    const minSelectableDate = addDays(selectedServiceDate, 1);

    // Get the last service date
    const lastServiceDate =
      teamAvailabilities.length > 0
        ? parseISO(teamAvailabilities[teamAvailabilities.length - 1].date)
        : new Date(pkg.endDate);

    let maxSelectableDate = addDays(lastServiceDate, -1);

    // Extend the availability by 7 days if the selected date is the last service date
    if (isSameDay(selectedServiceDate, lastServiceDate)) {
      maxSelectableDate = addDays(lastServiceDate, 7);
    }

    // Store available and unavailable dates
    let availableDates: string[] = [];
    let unavailableDates: Date[] = [];
    let counter = 0;
    let currentDate = minSelectableDate;

    while (isBefore(currentDate, maxSelectableDate)) {
      if (!isDateDisabled(currentDate)) {
        if (counter < 5) {
          availableDates.push(format(currentDate, "d MMM"));
          counter++;
        }
      } else {
        unavailableDates.push(currentDate);
      }
      currentDate = addDays(currentDate, 1);
    }

    // Format available dates for display
    let availableDatesStr =
      availableDates.length > 0
        ? availableDates.slice(0, 5).join(", ") +
          (availableDates.length > 5 ? "..." : "")
        : "No available dates found";

    // Determine default view date
    const defaultMonth = newStartDate || minSelectableDate;

    return (
      <div className='w-full'>
        <div className='text-sm text-gray-500 mb-4'>
          <p>
            Selected service: {selectedAvailability.team.name} on{" "}
            {formatDate(selectedAvailability.date)}
          </p>
          <p className='mt-1'>
            Please select a new date. Available dates include:{" "}
            {availableDatesStr}
          </p>
          <p className='mt-1 text-xs'>
            Note: Dates with scheduled services and the day immediately after
            each service are unavailable.
          </p>
        </div>

        <div className='flex items-center flex-col gap-4 justify-center w-full'>
          {!loading ? (
            <CustomDatePicker
              startDate={moment(selectedAvailability.date).toDate()}
              setStartDate={(d: any) => {
                handleDateSelect(d);
              }}
              minDate={minSelectableDate}
              maxDate={maxSelectableDate}
              unavailableDates={[...calendar, ...unavailableDates]}
            />
          ) : (
            <div>Loading calendar...</div>
          )}
          {timeSlotLoading && <Loader />}
        </div>
      </div>
    );
  };

  const renderTimeSlotSelection = () => {
    if (!selectedAvailability || !newStartDate) return null;
    return (
      <div>
        <div className='text-sm text-gray-500 mb-4'>
          <p>Selected service: {selectedAvailability?.team.name}</p>
          <p>New date: {format(newStartDate as Date, "do MMMM yyyy")}</p>
          <p className='mt-1'>Please select a preferred time slot:</p>
        </div>

        {timeSlotLoading ? (
          // Shimmer effect while loading
          <div className='grid grid-cols-2 gap-3 mt-4'>
            {[...Array(6)].map((_, index) => (
              <div
                key={`shimmer-${index}`}
                className='animate-pulse p-3 h-12 bg-gray-200 rounded-md'
              />
            ))}
          </div>
        ) : availableTimeSlots.length === 0 ? (
          // No time slots available
          <div className='text-center py-8'>
            <p className='text-gray-500'>
              No available time slots for this date
            </p>
            <p className='text-gray-500'>Choose Another Date</p>
          </div>
        ) : (
          // Display available time slots
          <div className='grid grid-cols-2 gap-3 mt-4'>
            {availableTimeSlots.map((slot) => (
              <div
                key={slot.id}
                className={`p-3 border rounded-md cursor-pointer transition-colors text-center ${
                  selectedTimeSlot === slot.id
                    ? "border-blue-500 bg-blue-50"
                    : slot.available
                    ? "hover:bg-gray-50"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
                onClick={() => {
                  if (slot.available) {
                    handleTimeSlotSelect(slot.id);
                  }
                }}>
                {formatTime(slot.time)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderSummary = () => {
    if (!selectedAvailability || !newStartDate || !selectedTimeSlot)
      return null;

    const selectedTime =
      availableTimeSlots.find((slot) => slot.id === selectedTimeSlot)?.time ||
      "";

    return (
      <div>
        <div className='bg-gray-50 p-4 rounded-md mb-6'>
          <h4 className='font-medium mb-3'>Reschedule Summary</h4>

          <div className='space-y-2'>
            <div className='flex'>
              <div className='w-1/3 text-gray-500'>Service:</div>
              <div className='w-2/3 font-medium'>
                {selectedAvailability.team.name}
              </div>
            </div>

            <div className='flex'>
              <div className='w-1/3 text-gray-500'>Original Date:</div>
              <div className='w-2/3'>
                {formatDate(selectedAvailability.date)}
              </div>
            </div>

            <div className='flex'>
              <div className='w-1/3 text-gray-500'>Original Time:</div>
              <div className='w-2/3'>
                {formatTime(selectedAvailability.start_time)} -{" "}
                {formatTime(selectedAvailability.end_time)}
              </div>
            </div>

            <hr className='my-2' />

            <div className='flex'>
              <div className='w-1/3 text-gray-500'>New Date:</div>
              <div className='w-2/3 font-medium'>
                {format(newStartDate, "do MMMM yyyy")}
              </div>
            </div>

            <div className='flex'>
              <div className='w-1/3 text-gray-500'>New Time:</div>
              <div className='w-2/3 font-medium'>
                {formatTime(selectedTime)}
              </div>
            </div>
          </div>
        </div>

        <p className='text-sm text-gray-500 mb-6'>
          Please review the changes above. Click &apos;Confirm Reschedule&apos;
          to proceed with these changes or go back to make adjustments.
        </p>
      </div>
    );
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[800px] overflow-y-auto p-6'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-semibold'>Reschedule Package</h2>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700'>
            ✕
          </button>
        </div>

        <div className='mb-4'>
          <label className='text-sm font-medium'>Current Package Dates</label>
          <p className='text-sm mt-1'>
            {formatDate(pkg.date)} - {formatDate(pkg.end_date)}
          </p>
        </div>

        {currentStep === RescheduleStep.SELECT_SERVICE &&
          renderServiceSelection()}
        {/* {currentStep === RescheduleStep.SELECT_SERVICE_DATE &&
          renderDateSelection()} */}
        {currentStep === RescheduleStep.SELECT_DATE && renderDateSelection()}
        {currentStep === RescheduleStep.SELECT_TIMESLOT &&
          renderTimeSlotSelection()}
        {currentStep === RescheduleStep.REVIEW_SUMMARY && renderSummary()}

        <div className='flex justify-between space-x-2 mt-4'>
          <button
            onClick={handleBackButton}
            className={`
              px-4 py-2 rounded-md 
              ${
                currentStep === RescheduleStep.SELECT_SERVICE
                  ? "hidden"
                  : "border hover:bg-gray-100"
              }
            `}>
            Previous
          </button>

          <div className='flex-grow' />

          {currentStep !== RescheduleStep.REVIEW_SUMMARY && (
            <button
              onClick={handleNextButton}
              disabled={
                (currentStep === RescheduleStep.SELECT_SERVICE &&
                  !selectedService) ||
                (currentStep === RescheduleStep.SELECT_SERVICE_DATE &&
                  !selectedAvailability)
              }
              className={`
                px-4 py-2 rounded-md text-white
                ${
                  (currentStep === RescheduleStep.SELECT_SERVICE &&
                    !selectedService) ||
                  (currentStep === RescheduleStep.SELECT_SERVICE_DATE &&
                    !selectedAvailability)
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }
              `}>
              Next
            </button>
          )}

          {currentStep === RescheduleStep.REVIEW_SUMMARY && (
            <button
              onClick={handleReschedule}
              disabled={disableConfirm}
              className={`
                px-4 py-2 rounded-md text-white
                ${
                  disableConfirm
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }
              `}>
              Confirm Reschedule
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReschedulePackageModal;
