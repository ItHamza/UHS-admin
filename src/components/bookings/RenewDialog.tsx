import React, { useEffect, useState } from "react";
import { Booking } from "@/types/booking";
import { Clock, X, ChevronRight, ChevronLeft } from "lucide-react";
import moment from "moment";
import CustomDatePicker from "../ui/custom-date-picker";
import CalendarAction from "@/actions/calendar";
import BundlesAction from "@/actions/bundles";
import {
  frequencyNumberMapping,
  residenceDurationMap,
  TimeSlot,
} from "./BookingsHeader";

// Define types for new selections
interface Bundle {
  id: string;
  name: string;
  description: string;
  price: number;
}

interface RenewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: Booking;
  onRenew: (renewalDetails: {
    months: number;
    startDate: Date;
    bundle: Bundle;
    timeSlot: TimeSlot;
  }) => void;
}

const RenewModal: React.FC<RenewModalProps> = ({
  isOpen,
  onClose,
  bookingData,
  onRenew,
}) => {
  // Constants
  const SERVICE_DURATION = [1, 3, 6, 12];
  const [bundles, setBundles] = useState<any[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<Record<string, string>>(
    {}
  );

  // State management
  const [step, setStep] = useState<number>(1);
  const [months, setMonths] = useState<number | undefined>(1);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [selectedBundle, setSelectedBundle] = useState<Bundle | undefined>(
    undefined
  );
  const [selectedBundleId, setSelectedBundleId] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<
    TimeSlot | undefined
  >(undefined);
  const [timeslotsSelected, setTimeSlotsSelected] = useState<any>();
  const [loading, setLoading] = useState({
    calendar: false,
    booking: false,
    timeslot: false,
  });

  const fetchBundles = async () => {
    try {
      setLoading((prev) => ({ ...prev, booking: true }));
      const formattedDate = moment(startDate).format("YYYY-MM-DD");
      const residenceSelected = bookingData.residence_type;

      const duration: number =
        residenceDurationMap[residenceSelected.type] || 60;

      const propertyLocation = {
        lat: bookingData.property.latitude,
        lng: bookingData.property.longitude,
      };

      const payload = {
        startDate: formattedDate,
        location: propertyLocation,
        frequency: bookingData.frequency,
        servicePeriod: months || 1,
        serviceType: residenceSelected.type || "",
        duration: duration,
      };

      const response = await BundlesAction({
        startDate: payload.startDate,
        location: payload.location as { lat: any; lng: any },
        frequency: payload.frequency,
        servicePeriod: payload.servicePeriod,
        duration: payload.duration,
        serviceType: payload.serviceType,
      });

      setBundles(response.data);
    } catch (error) {
      console.error("Error fetching bundles:", error);
    } finally {
      setLoading((prev) => ({ ...prev, booking: false }));
    }
  };

  function filterTimeSlotsByBundleId(
    teamsData: any,
    bundleId: string
  ): TimeSlot[] {
    const filteredTimeSlots: TimeSlot[] = [];

    teamsData.forEach((team: any) => {
      team.availableBundles.forEach((bundle: any) => {
        if (bundle.bundleId === bundleId) {
          setSelectedTeamId(team.teamId);

          bundle.days.forEach((day: any) => {
            filteredTimeSlots.push({
              day: day.day,
              date: day.date,
              timeSlots: day.timeSlots.map((slot: any) => ({
                id: `${slot.scheduleId}_${slot.startTime}-${slot.endTime}`,
                startTime: slot.startTime,
                endTime: slot.endTime,
              })),
            });
          });
        }
      });
    });

    return filteredTimeSlots;
  }

  const fetchTimeSlots = async (bundleId: string) => {
    try {
      setLoading((prev) => ({ ...prev, booking: true }));
      if (!bundles || bundles.length === 0) {
        console.error("No bundles available");
        return;
      }

      const timeslotsRes = filterTimeSlotsByBundleId(
        bundles[0].teams,
        bundleId
      );
      setTimeSlots(timeslotsRes);
    } catch (error) {
      console.error("Error fetching time slots:", error);
    } finally {
      setLoading((prev) => ({ ...prev, booking: false }));
    }
  };

  const [selectedDay, setSelectedDay] = useState<string[]>([]);

  const handleTimeSlotSelection = (slot: any, day: string, date: string) => {
    let newSelections = { ...selectedSlots };

    const hasExistingSelection = newSelections[day] !== undefined;
    const isSameSlot = newSelections[day] === slot.id;

    if (isSameSlot) {
      delete newSelections[day];
      setSelectedDay(selectedDay.filter((d) => d !== day));
    } else {
      newSelections[day] = slot.id;
      if (!selectedDay.includes(day)) {
        setSelectedDay([...selectedDay, day]);
      }
    }

    setSelectedSlots(newSelections);

    const selectedSlotsList = Object.entries(newSelections)
      .map(([dateStr, slotId]) => {
        const matchingDay = timeSlots.find((d) => d.day === dateStr);
        if (!matchingDay) return "";

        const matchingSlot = matchingDay.timeSlots.find((s) => s.id === slotId);
        if (!matchingSlot) return "";

        return `${matchingDay.day} - ${matchingSlot.startTime} to ${matchingSlot.endTime}`;
      })
      .filter(Boolean)
      .join(", ");
    setTimeSlotsSelected(selectedSlotsList);
  };

  const [calendar, setCalendar] = useState<any[]>([]);
  const fetchCalendar = async (startDate: string, endDate: string) => {
    try {
      setLoading((prev) => ({ ...prev, calendar: true }));
      const response = await CalendarAction(startDate, endDate);
      const unavailableDates = Object.entries(response.data)
        .filter(([_, isAvailable]) => !isAvailable)
        .map(([dateString]) => new Date(dateString));

      setCalendar(unavailableDates);
      setLoading((prev) => ({ ...prev, calendar: false }));
    } catch (error) {
      console.error("Error fetching properties:", error);
      setLoading((prev) => ({ ...prev, calendar: false }));
    }
  };

  const computeMinDate = () => {
    return bookingData?.end_date
      ? new Date(
          new Date(bookingData.end_date).setDate(
            new Date(bookingData.end_date).getDate() + 1
          )
        )
      : new Date();
  };

  const computeMaxDate = () => {
    return months
      ? new Date(
          new Date(bookingData?.end_date || new Date()).setMonth(
            new Date(bookingData?.end_date || new Date()).getMonth() + months
          )
        )
      : new Date(
          new Date(bookingData?.end_date || new Date()).setMonth(
            new Date(bookingData?.end_date || new Date()).getMonth() + 1
          )
        );
  };

  const handleRenew = () => {
    if (months && startDate && selectedBundle && selectedTimeSlot) {
      onRenew({
        months,
        startDate,
        bundle: selectedBundle,
        timeSlot: selectedTimeSlot,
      });
      onClose();
    }
  };

  const nextStep = () => {
    setStep((prev) => prev + 1);
    if (step === 1) {
      fetchBundles();
    } else if (step === 2 && selectedBundleId) {
      fetchTimeSlots(selectedBundleId as string);
    }
  };
  const prevStep = () => setStep((prev) => prev - 1);

  useEffect(() => {
    if (months) {
      const endDate = moment(bookingData.end_date)
        .add(1, "days")
        .format("YYYY-MM-DD");
      fetchCalendar(
        moment(bookingData.date).add(1, "days").format("YYYY-MM-DD"),
        endDate
      );
    }
  }, [months]);

  const getSliceEndIndex = () => {
    return frequencyNumberMapping[bookingData.frequency] || 1;
  };

  if (!isOpen) return null;

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Duration Selection */}
              <div className='space-y-2'>
                <label className='block text-sm font-medium text-gray-700'>
                  Duration (Months)
                </label>
                <div className='relative'>
                  <select
                    value={months?.toString() || ""}
                    onChange={(e) => setMonths(parseInt(e.target.value))}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'>
                    <option value='' disabled>
                      Select Duration
                    </option>
                    {SERVICE_DURATION.map((sd) => (
                      <option key={sd} value={sd.toString()}>
                        {sd} {sd === 1 ? "Month" : "Months"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Start Date Selection */}
              <div className='space-y-2'>
                <label className='block text-sm font-medium text-gray-700'>
                  Start Date
                </label>
                {!loading.calendar ? (
                  <CustomDatePicker
                    startDate={
                      bookingData.end_date
                        ? moment(bookingData.end_date).add(1, "days").toDate()
                        : null
                    }
                    minDate={moment(computeMinDate()).toDate()}
                    maxDate={moment(computeMaxDate()).toDate()}
                    setStartDate={(e) => setStartDate(e as Date)}
                    unavailableDates={calendar}
                  />
                ) : (
                  <div className='text-gray-500'>Loading calendar...</div>
                )}
              </div>
            </div>
            <div className='flex justify-end mt-4'>
              <button
                onClick={nextStep}
                disabled={!months || !startDate}
                className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'>
                Next: Select Bundle{" "}
                <ChevronRight className='inline-block ml-2' />
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold mb-4'>Select Bundle</h3>
            <div className='grid md:grid-cols-3 gap-4'>
              {bundles.length > 0 ? (
                <div className='grid grid-cols-1 gap-3'>
                  {bundles[0].bundles.map((bundle: any) => (
                    <div
                      key={bundle.id}
                      className={`p-4 border rounded-lg cursor-pointer transition ${
                        selectedBundleId === bundle.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 hover:border-blue-300"
                      }`}
                      onClick={() => {
                        setSelectedBundle(bundle);
                        setSelectedBundleId(bundle.id);
                      }}>
                      <div className='flex justify-between items-center'>
                        <div>
                          <h4 className='font-medium text-gray-900'>
                            {bundle.title}
                          </h4>
                          {/* <p className='text-gray-600'>
                                  {bundle.duration} mins
                                </p> */}
                        </div>
                        {selectedBundleId === bundle.id && (
                          <div className='w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white'>
                            ✓
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center py-4 text-gray-500'>
                  {loading.booking
                    ? "Loading bundles..."
                    : "No bundles available for the selected criteria"}
                </div>
              )}
            </div>
            <div className='flex justify-between mt-4 gap-2'>
              <button
                onClick={prevStep}
                className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50'>
                <ChevronLeft className='inline-block mr-2' /> Previous
              </button>
              <button
                onClick={nextStep}
                disabled={!selectedBundleId}
                className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'>
                Next: Select Time Slot{" "}
                <ChevronRight className='inline-block ml-2' />
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold mb-4'>Select Time Slot</h3>
            <div className='grid md:grid-cols-3 gap-4'>
              {timeSlots.length > 0 ? (
                <div className='space-y-4'>
                  {timeSlots.slice(0, getSliceEndIndex()).map((day) => (
                    <div
                      key={`${day.day}-${day.date}`}
                      className='border rounded-lg p-3'>
                      <h4 className='font-medium text-gray-900 mb-2'>
                        {day.day}
                      </h4>
                      <div className='grid grid-cols-2 gap-2'>
                        {day.timeSlots.map((slot) => (
                          <button
                            key={slot.id}
                            type='button'
                            onClick={() =>
                              handleTimeSlotSelection(slot, day.day, day.date)
                            }
                            className={`py-2 px-3 rounded-md text-sm font-medium transition ${
                              selectedSlots[day.day] === slot.id
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                            }`}>
                            {slot.startTime} - {slot.endTime}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center py-4 text-gray-500'>
                  {loading.timeslot
                    ? "Loading time slots..."
                    : "No time slots available for the selected bundle"}
                </div>
              )}
            </div>
            <div className='flex justify-between mt-4 gap-2 items-center'>
              <button
                onClick={prevStep}
                className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50'>
                <ChevronLeft className='inline-block mr-2' /> Previous
              </button>
              <button
                onClick={nextStep}
                disabled={!selectedSlots}
                className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'>
                Next: Review Details{" "}
                <ChevronRight className='inline-block ml-2' />
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold mb-4'>Renewal Summary</h3>

            <div className='border p-4 rounded-lg space-y-4 bg-gray-50'>
              <div className='grid grid-cols-2 gap-2'>
                <div>
                  <span className='text-sm text-gray-500'>
                    Current End Date
                  </span>
                  <p className='font-medium'>
                    {moment(bookingData.end_date).format("YYYY-MM-DD")}
                  </p>
                </div>
                <div>
                  <span className='text-sm text-gray-500'>New Start Date</span>
                  <p className='font-medium'>
                    {startDate
                      ? moment(startDate).format("YYYY-MM-DD")
                      : "Not selected"}
                  </p>
                </div>
                <div>
                  <span className='text-sm text-gray-500'>
                    Renewal Duration
                  </span>
                  <p className='font-medium'>
                    {months} {months === 1 ? "Month" : "Months"}
                  </p>
                </div>
                <div>
                  <span className='text-sm text-gray-500'>New End Date</span>
                  <p className='font-medium'>
                    {startDate && months
                      ? moment(startDate)
                          .add(months, "months")
                          .format("YYYY-MM-DD")
                      : "Not calculated"}
                  </p>
                </div>
                <div>
                  <span className='text-sm text-gray-500'>Selected Bundle</span>
                  <p className='font-medium'>
                    {" "}
                    {selectedBundle?.id
                      .split("bundle-")[1]
                      .split("-gap")[0]
                      .replaceAll("-", ", ")}
                  </p>
                </div>
                <div>
                  <span className='text-sm text-gray-500'>
                    Selected Time Slot
                  </span>
                  <p className='font-medium'>{timeslotsSelected}</p>
                </div>
              </div>
            </div>
            <div className='flex justify-between mt-4'>
              <button
                onClick={prevStep}
                className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50'>
                <ChevronLeft className='inline-block mr-2' /> Previous
              </button>
              <button
                onClick={handleRenew}
                className='px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700'>
                Confirm Renewal
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className='fixed inset-0 z-50  bg-black/50 overflow-scroll '>
      <div className='bg-white rounded-lg shadow-xl w-[600px] max-w-full p-6'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-semibold'>Renew Service</h2>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700'>
            <X className='h-6 w-6' />
          </button>
        </div>

        {renderStepContent()}
      </div>
    </div>
  );
};

export default RenewModal;
