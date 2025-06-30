import React, { useEffect, useState } from "react";
import { Booking } from "@/types/booking";
import { Clock, X, CreditCard, Calendar, MapPin, Loader2 } from "lucide-react";
import moment from "moment";
import CustomDatePicker from "../ui/custom-date-picker";
import CalendarAction from "@/actions/calendar";
import BundlesAction from "@/actions/bundles";
import {
  frequencyNumberMapping,
  residenceDurationMap,
  TimeSlot,
} from "./BookingsHeader";
import BlockBookingAction from "@/actions/block";
import toast from "react-hot-toast";
import ConfirmBookingAction from "@/actions/confirmBooking";
import Loader from "../ui/loader";
import { format } from "date-fns";
import { BookingByIdAction, ConfirmRenewAction } from "@/actions/booking";
import { Button } from "@headlessui/react";

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

interface ServiceDetail {
  id: string;
  name: string;
  description?: string;
  price?: number;
}

interface BookingService {
  service: ServiceDetail;
  teamAvailabilities: Array<{
    id: string;
    date: string;
    start_time: string;
    end_time: string;
  }>;
  total_amount?: number;
  recurrence_plan?: string;
  start_date?: string;
  end_date?: string;
}


const RenewModal: React.FC<RenewModalProps> = ({
  isOpen,
  onClose,
  bookingData,
  onRenew,
}) => {
  const SERVICE_DURATION = [1, 3, 6, 12];
  const [bundles, setBundles] = useState<any[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<Record<string, string>>(
    {}
  );

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
  const [loading, setLoading] = useState(false)

  const [blockingTimer, setBlockingTimer] = useState<number | null>(null);
  const [isBlockingTimerActive, setIsBlockingTimerActive] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string[]>([]);
  const [calendar, setCalendar] = useState<any[]>([]);

  const [services, setServices] = useState<BookingService[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  
  const [isConfirmRenew, setIsConfirmRenew] = useState(false);


  const startBlockingTimer = () => {
    setIsBlockingTimerActive(true);
    setBlockingTimer(600);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "PPP");
    } catch {
      return "Invalid Date";
    }
  };

    // Format time function
  const formatTime = (timeString: string): string => {
    if (!timeString) return "N/A";
    try {
      return format(new Date(`2000-01-01T${timeString}`), "h:mm a");
    } catch {
      return "Invalid Time";
    }
  };


  const fetchBookingServices = async (bookingId: string) => {
    try {
      setLoading(true);

      // If we already have renewBookingData with a renew_booking_id, use that
      const targetBookingId = bookingData?.renew_booking_id || bookingId;

      const response = await BookingByIdAction(targetBookingId);
      if (response) {
        // Transform the response into our expected format
        const serviceData: BookingService = {
          service: {
            id: response.service?.id || "",
            name: response.service?.name || "Unknown Service",
            description: response.service?.description,
            price: response.service?.price,
          },
          teamAvailabilities: response.teamAvailabilities || [],
          total_amount: response.total_amount,
          recurrence_plan: response.recurrence_plan,
          start_date: response.date,
          end_date: response.end_date,
        };

        setServices([serviceData]);
        setTotalAmount(parseFloat(response.total_amount) || 0);
      } else {
        toast.error("Failed to load booking details");
      }
    } catch (error) {
      console.error("Error fetching booking services:", error);
      toast.error("Error loading booking information");
    } finally {
      setLoading(false);
    }
  };

  const onConfirmRenew = async (): Promise<void> => {
    try {
      setIsConfirmRenew(true);
      // Use the renewal booking ID or the main booking ID
      const bookingId = bookingData?.renew_booking_id;

      const newData = { status: "pending", payment_status: 'pending', is_renewed: true, prev_booking_id: bookingData.id}
      if (!bookingId && !bookingData.id) {
        toast.error("Booking ID not found for renewal");
        return;
      }

      const response = await ConfirmRenewAction(bookingId, newData);
      if (response) {

        setIsConfirmRenew(false);
        location.reload()
      } else {
        throw new Error("No payment URL returned");
      }
    } catch (error: any) {
      console.error("Error renewal booking:", error);
      toast.error(error.message || "Failed to initiate renew booking");
      setIsConfirmRenew(false);
    }
  };

  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (isBlockingTimerActive && blockingTimer !== null && blockingTimer > 0) {
      timerId = setInterval(() => {
        setBlockingTimer((prev) => {
          if (prev !== null && prev <= 1) {
            clearInterval(timerId);
            setIsBlockingTimerActive(false);
            return 0;
          }
          return (prev as number) - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isBlockingTimerActive, blockingTimer]);

  const fetchBundles = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
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

          bundle.bookingDays.forEach((day: any) => {
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
      setLoading(true);
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
      setLoading(false);
    }
  };

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

  const fetchCalendar = async (startDate: string, endDate: string, booking_id: string, team_id: string, user_id: string) => {
    try {
      setLoading(true);
      const response = await CalendarAction(startDate, endDate, booking_id, team_id, user_id);
      const unavailableDates = Object.entries(response.data)
        .filter(([_, isAvailable]) => !isAvailable)
        .map(([dateString]) => new Date(dateString));

      setCalendar(unavailableDates);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching properties:", error);
      setLoading(false);
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

  const blockSchedule = async () => {
    try {
      setLoading(true);
      let timeslotsSelected: any[] = [];

      const selectedBundleId = selectedBundle?.id;

      const selectedSlotsArray = bundles[0].teams.flatMap((team: any) =>
        team.availableBundles
          .filter((av: any) => av.bundleId === selectedBundleId)
          .flatMap((av: any) =>
            Object.entries(selectedSlots).map(
              ([day, slotInfo]: [string, any]) => {
                const startTime = slotInfo.split("_")[1].split("-")[0];
                const endTime = slotInfo.split("_")[1].split("-")[1];

                const scheduleId = slotInfo.split("_")[0];
                const matchingTimeSlots = av.bookingDays
                  .filter((d: any) => d.day === day)
                  ?.flatMap((d: any) => d.timeSlots)
                  .filter(
                    (slot: any) =>
                      slot.startTime === startTime && slot.endTime === endTime
                  );

                timeslotsSelected = [
                  ...timeslotsSelected,
                  ...matchingTimeSlots,
                ];

                return matchingTimeSlots.map((matchSlot: any) => ({
                  schedule_id: scheduleId,
                  start_time: startTime,
                  end_time: endTime,
                  day: day,
                }));
              }
            )
          )
          .flat()
          .filter(Boolean)
      );

      const endDate =
        bookingData.frequency !== "one_time"
          ? moment(startDate).add(months, "months").format("YYYY-MM-DD")
          : moment(bookingData.startDate).add(1, "day").format("YYYY-MM-DD");

      const firstTimeslot = timeslotsSelected[0];
      const startTime = firstTimeslot ? firstTimeslot.startTime : "00:00";
      const endTime = firstTimeslot ? firstTimeslot.endTime : "00:00";

      const formattedEndDate =
        bookingData.frequency === "one_time"
          ? `${endDate}T${endTime}:00`
          : endDate;

      const data: any = {
        userPhone: bookingData.user.phone,
        no_of_cleaners: 2,
        userId: bookingData.user.id,
        timeslots:
          bookingData.frequency === "one_time"
            ? timeslotsSelected.slice(0, 1).map((ts) => ({
                start_time: ts.startTime + ":00",
                end_time: ts.endTime + ":00",
                schedule_id: ts.scheduleId,
              }))
            : timeslotsSelected.map((ts) => ({
                start_time: ts.startTime + ":00",
                end_time: ts.endTime + ":00",
                schedule_id: ts.scheduleId,
              })),
        teamId: selectedTeamId,
        areaId: bookingData.area.id,
        districtId: bookingData.district.id,
        propertyId: bookingData.property.id,
        residenceTypeId: bookingData.residence_type.id,
        startDate:
          bookingData.frequency === "one_time"
            ? moment(bookingData.startDate).format("YYYY-MM-DD") +
              "T" +
              startTime
            : moment(bookingData.startDate).format("YYYY-MM-DD"),
        endDate: formattedEndDate,
        frequency: bookingData.frequency,
        userAvailableInApartment: bookingData.user_available_in_apartment,
        specialInstructions: bookingData.instructions,
        appartmentNumber: bookingData.appartment_number,
        serviceId: bookingData.service.id,
      };
      const bookingId = await BlockBookingAction(data);
      startBlockingTimer();

      //   console.log("block data", data, selectedSlots);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      console.log("error", error);
      toast.error(error.message || "something went wrong");
    }
  };

  const handleRenew = async () => {
    try {
      setLoading(true);
      const response = await ConfirmBookingAction({
        userPhone: bookingData.user.phone,
        specialInstructions: bookingData.instructions,
        appartmentNumber: bookingData.appartment_number,
        userAvailableInApartment: bookingData.user_available_in_apartment,
      });
      console.log("Service booked successfully:", response);
      window.location.reload();
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    setStep((prev) => prev + 1);
    if (step === 1) {
      fetchBundles();
    } else if (step === 2 && selectedBundleId) {
      fetchTimeSlots(selectedBundleId as string);
    } else if (step === 3) {
      blockSchedule();
    }
  };

  const prevStep = () => setStep((prev) => prev - 1);

  useEffect(() => {
    fetchBookingServices(bookingData.id)
  }, []);

  const getSliceEndIndex = () => {
    return frequencyNumberMapping[bookingData.frequency] || 1;
  };

  if (!isOpen) return null;


  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-auto p-4'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6'>
        <div className='flex justify-between items-center'>
          <h2 className='text-2xl font-bold'>Renew Service</h2>
          <button onClick={onClose} className='text-gray-400 hover:text-gray-600 transition'>
            <X className='h-6 w-6' />
          </button>
        </div>

        <div className='space-y-6'>
          {/* Header */}
          <div className='bg-green-50 p-4 rounded-lg border border-green-200'>
            <h3 className='font-semibold text-green-800 mb-2 flex items-center'>
              <CreditCard className='h-5 w-5 mr-2' />
              Service Renewal
            </h3>
            <p className='text-sm text-green-700'>
              Review your service details below and proceed with renewal payment.
            </p>
          </div>

          {/* Services List */}
          <div className='space-y-4'>
            {services.map((serviceItem, index) => (
              <div key={index} className='border rounded-lg p-4 bg-white shadow-sm'>
                {/* Service Header */}
                <div className='flex justify-between items-start mb-4'>
                  <div>
                    <h4 className='text-lg font-semibold text-gray-900'>
                      {serviceItem.service.name}
                    </h4>
                    {serviceItem.service.description && (
                      <p className='text-sm text-gray-600 mt-1'>
                        {serviceItem.service.description}
                      </p>
                    )}
                  </div>
                  {serviceItem.service.price && (
                    <div className='text-right'>
                      <p className='text-lg font-bold text-primary'>
                        QAR {serviceItem.service.price}
                      </p>
                    </div>
                  )}
                </div>

                {/* Service Details Grid */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                  <div className='flex items-center text-sm'>
                    <Calendar className='h-4 w-4 mr-2 text-gray-500' />
                    <div>
                      <span className='font-medium'>Frequency: </span>
                      <span className='capitalize'>
                        {serviceItem.recurrence_plan?.replace("_", " ") || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className='flex items-center text-sm'>
                    <MapPin className='h-4 w-4 mr-2 text-gray-500' />
                    <div>
                      <span className='font-medium'>Service Period: </span>
                      <span>
                        {formatDate(serviceItem.start_date as string)} -{" "}
                        {formatDate(serviceItem.end_date as string)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Team Availabilities */}
                {serviceItem.teamAvailabilities &&
                  serviceItem.teamAvailabilities.length > 0 && (
                    <div>
                      <h5 className='font-medium text-gray-700 mb-3 flex items-center'>
                        <Clock className='h-4 w-4 mr-2' />
                        Scheduled Sessions
                      </h5>
                      <div className='space-y-3'>
                        {serviceItem.teamAvailabilities.map((availability) => (
                          <div
                            key={availability.id}
                            className='flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-md'>
                            <div className='flex items-center'>
                              <Calendar className='h-4 w-4 mr-2 text-gray-500' />
                              <span className='font-medium'>
                                {formatDate(availability.date)}
                              </span>
                            </div>
                            <div className='flex items-center mt-2 sm:mt-0'>
                              <Clock className='h-4 w-4 mr-2 text-gray-500' />
                              <span>
                                {formatTime(availability.start_time)} -{" "}
                                {formatTime(availability.end_time)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            ))}
          </div>

          {/* Total Amount */}
          <div className='bg-gray-100 p-4 rounded-lg border'>
            <div className='flex justify-between items-center'>
              <h4 className='text-lg font-medium'>Total Renewal Amount</h4>
              <p className='text-xl font-bold text-green-700'>QAR {totalAmount.toFixed(2)}</p>
            </div>
          </div>

          {/* Confirm Button */}
          <div className='sticky bottom-0 bg-white pt-4 border-t mt-6'>
            <Button
              onClick={onConfirmRenew}
              disabled={isConfirmRenew}
              className='w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base flex justify-center items-center'>
              {isConfirmRenew ? (
                <>
                  <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                  Confirming renew booking...
                </>
              ) : (
                <>
                  <CreditCard className='mr-2 h-5 w-5 -mt-0.5' />
                  Confirm Renew Booking (QAR {totalAmount.toFixed(2)})
                </>
              )}
            </Button>
          </div>


        </div>
      </div>
    </div>
  );
};

export default RenewModal;
