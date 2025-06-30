"use client";

import React, { useState, useEffect } from "react";
import { ArrowDownTrayIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import { Check } from "lucide-react";
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
import { noFocusStyle } from "@/utils/styles";
import { Combobox } from "@headlessui/react";

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

// Helper function to format time (same as TimeSlots component)
const formatTime = (time: string) => {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
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
    date: string;
  }[];
  teamId: string;
  areaId: string;
  districtId: string;
  propertyId: string;
  residenceTypeId: string;
  startDate: string;
  endDate: string;
  frequency: string;
  renewal_slots: {
    schedule_id: string;
    start_time: string;
    end_time: string;
    date: string;
  }[];
}

interface BookingDialogProps {
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

const BookingDialog: React.FC<BookingDialogProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<BookingData>({
    service: "",
    subService: "",
    area: "",
    district: "",
    property: "",
    residenceType: "",
    frequency: "",
    duration: "",
    startDate: "",
    bundle: "",
    timeSlot: "",
    userName: "",
    phoneNumber: "",
    email: "",
    apartmentNumber: "",
    userPresent: true,
    specialInstructions: "",
  });
  const [calendar, setCalendar] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isCreatingNewUser, setIsCreatingNewUser] = useState(false);

  const [finalBookingData, setFinalBookingData] = useState<FinalBookingData>({
    userPhone: "",
    no_of_cleaners: 2,
    userId: "",
    timeslots: [],
    teamId: "",
    areaId: "",
    districtId: "",
    propertyId: "",
    residenceTypeId: "",
    startDate: "",
    endDate: "",
    frequency: "",
    renewal_slots: [],
  });

  const [services, setServices] = useState<any[]>([]);
  const [subServices, setSubServices] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [frequencies, setFrequencies] = useState<any[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const [residenceTypes, setResidenceTypes] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState(600);
  const [showSummary, setShowSummary] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // TimeSlots component state structure
  const [selectedBundleDetail, setSelectedBundleDetail] = useState<any>(null);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<any[]>([]);
  const [renewalSlots, setRenewalSlots] = useState<any[]>([]);
  const [bundles, setBundles] = useState<any[]>([]);

  const totalSteps = 6;

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await UsersActions();
      setUsers(response);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers =
    query === ""
      ? users
      : users.filter((u) =>
          `${u.name} ${u.phone}`.toLowerCase().includes(query.toLowerCase())
        );

  const createNewUser = async () => {
    try {
      setIsLoading(true);
      const newUser = await UserCreateAction({
        name: bookingData.userName,
        phone: bookingData.phoneNumber,
        email: bookingData.email,
        is_active: true,
        is_blocked: false,
        role: "user",
        area: bookingData.area,
        property: bookingData.property,
        district: bookingData.district,
        residenceType: bookingData.residenceType,
        districtId: bookingData.district,
        propertyId: bookingData.property,
        residenceTypeId: bookingData.residenceType,
        apartment_number: bookingData.apartmentNumber,
        lat: properties.filter((p) => p.id === bookingData.property)[0]
          .latitude,
        lng: properties.filter((p) => p.id === bookingData.property)[0]
          .longitude,
      });
      setUsers([...users, newUser]);
      setSelectedUserId(newUser.id);
      setFinalBookingData((prev) => ({
        ...prev,
        userId: newUser.id,
        userPhone: `%2b${bookingData.phoneNumber.replace(/\D/g, "")}`,
      }));
      setIsCreatingNewUser(false);
    } catch (error) {
      console.error("Error creating user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCalendar = async (
    startDate: string,
    endDate: string,
    booking_id: string,
    team_id: string,
    user_id: string
  ) => {
    try {
      setIsLoading(true);
      const response = await CalendarAction(
        startDate,
        endDate,
        booking_id,
        team_id,
        user_id
      );
      const unavailableDates = Object.entries(response.data)
        .filter(([_, isAvailable]) => !isAvailable)
        .map(([dateString]) => new Date(dateString));

      setCalendar(unavailableDates);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching properties:", error);
      setIsLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const services = await ServicesAction({});
      setServices(services.data);
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubServices = async (parentId: string) => {
    try {
      setIsLoading(true);
      const subService = await ServicesAction({
        parentId: parentId,
      });
      setSubServices(subService.data);
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchArea = async () => {
    try {
      setIsLoading(true);
      const area = await AreaAction();
      setAreas(area);
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchResidenceTypes = async () => {
    try {
      setIsLoading(true);
      const residences = await ResidenceAction();
      setResidenceTypes(residences);
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDistrict = async (area: string) => {
    try {
      setIsLoading(true);
      const district = await DistrictAction(area);
      setDistricts(district);

      setFinalBookingData((prev) => ({
        ...prev,
        areaId: area,
      }));
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProperty = async (district: string) => {
    try {
      setIsLoading(true);
      const property = await PropertyAction(district);
      setProperties(property);

      setFinalBookingData((prev) => ({
        ...prev,
        districtId: district,
      }));
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFrequencies = async () => {
    try {
      setIsLoading(true);
      const response: any[] = [
        { id: "one_time", label: "One Time" },
        { id: "once", label: "Once a week" },
        { id: "twice", label: "2 Times A Week" },
        { id: "three", label: "3 Times A Weeek" },
        { id: "four", label: "4 Times A Week" },
        { id: "five", label: "5 Times A Weeek" },
        { id: "six", label: "6 Times A Week" },
      ];
      setFrequencies(response);
    } catch (error) {
      console.error("Error fetching frequencies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBundles = async () => {
    try {
      setIsLoading(true);
      const formattedDate = moment(bookingData.startDate).format("YYYY-MM-DD");
      const residenceSelected = residenceTypes.filter(
        (r) => r.id === bookingData.residenceType
      );

      const duration: number =
        residenceDurationMap[
          residenceSelected.length > 0 ? residenceSelected[0].type : ""
        ] || 60;

      const propertySelected = properties
        .filter((p) => p.id === bookingData.property)
        .at(0);

      if (!propertySelected) {
        console.error("Property not found");
        setIsLoading(false);
        return;
      }

      const propertyLocation = {
        lat: propertySelected.latitude,
        lng: propertySelected.longitude,
        district_id: bookingData.district,
      };

      const payload = {
        startDate: formattedDate,
        location: propertyLocation,
        frequency: bookingData.frequency,
        servicePeriod: parseInt(bookingData.duration) || 1,
        serviceType: residenceSelected[0]?.type || "",
        duration: duration,
      };

      const endDate = moment(formattedDate)
        .add(parseInt(bookingData.duration) || 1, "months")
        .format("YYYY-MM-DD");

      setFinalBookingData((prev) => ({
        ...prev,
        propertyId: bookingData.property,
        residenceTypeId: bookingData.residenceType,
        startDate: formattedDate,
        endDate: endDate,
        frequency: bookingData.frequency,
      }));

      const response = await BundlesAction({
        startDate: payload.startDate,
        location: payload.location as {
          lat: any;
          lng: any;
          district_id: string;
        },
        frequency: payload.frequency,
        servicePeriod: payload.servicePeriod,
        duration: payload.duration,
        serviceType: payload.serviceType,
        serviceId: bookingData.subService,
      });

      console.log("Bundle response:", response.data);
      setBundles(response.data || []);
    } catch (error) {
      console.error("Error fetching bundles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Using the exact logic from TimeSlots component
  const handleTimeSlotSelect = (day: string, index: number): void => {
    console.log("handleTimeSlotSelect called:", {
      day,
      index,
      selectedBundleDetail,
    });

    if (!selectedBundleDetail || !selectedBundleDetail.booking) {
      console.error("No selectedBundleDetail or booking data");
      return;
    }

    let timeslots: any[] = [...selectedTimeSlots]; // Create a copy of the array
    let renewalSlotTemp: any[] = [...renewalSlots];

    selectedBundleDetail.booking.forEach((bk: any) => {
      if (bk.day === day) {
        const timeSlotFiltered = bk.timeSlots.filter(
          (ts: any) =>
            ts.startTime === bk.timeSlots[index].startTime &&
            ts.endTime === bk.timeSlots[index].endTime
        )[0];

        const existIndex = timeslots.findIndex(
          (v) => v.date === timeSlotFiltered.date
        );

        if (existIndex !== -1) {
          timeslots[existIndex] = {
            start_time: timeSlotFiltered.startTime + ":00",
            end_time: timeSlotFiltered.endTime + ":00",
            schedule_id: timeSlotFiltered.scheduleId,
            date: timeSlotFiltered.date,
          };
        } else {
          timeslots.push({
            start_time: timeSlotFiltered.startTime + ":00",
            end_time: timeSlotFiltered.endTime + ":00",
            schedule_id: timeSlotFiltered.scheduleId,
            date: timeSlotFiltered.date,
          });
        }
      }
    });

    selectedBundleDetail.renewableSlots.forEach((bk: any) => {
      if (bk.day === day) {
        const timeSlotFiltered = bk.timeSlots.filter(
          (ts: any) =>
            ts.startTime === bk.timeSlots[index].startTime &&
            ts.endTime === bk.timeSlots[index].endTime
        )[0];

        const existIndex = renewalSlotTemp.findIndex(
          (v) => v.date === timeSlotFiltered.date
        );

        if (existIndex !== -1) {
          renewalSlotTemp[existIndex] = {
            start_time: timeSlotFiltered.startTime + ":00",
            end_time: timeSlotFiltered.endTime + ":00",
            schedule_id: timeSlotFiltered.scheduleId,
            date: timeSlotFiltered.date,
          };
        } else {
          renewalSlotTemp.push({
            start_time: timeSlotFiltered.startTime + ":00",
            end_time: timeSlotFiltered.endTime + ":00",
            schedule_id: timeSlotFiltered.scheduleId,
            date: timeSlotFiltered.date,
          });
        }
      }
    });

    // Sort the timeslots by date in ascending order
    const sortedTimeslots = [...timeslots].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    const sortedRenewalSlots = [...renewalSlotTemp].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    console.log(
      "booking and renewal slots",
      sortedTimeslots,
      sortedRenewalSlots
    );

    setSelectedTimeSlots(sortedTimeslots);
    setRenewalSlots(sortedRenewalSlots);

    // Update final booking data
    setFinalBookingData((prev) => ({
      ...prev,
      timeslots: sortedTimeslots,
      renewal_slots: sortedRenewalSlots,
    }));
  };

  const getSliceEndIndex = () => {
    return frequencyNumberMapping[bookingData.frequency] || 1;
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      fetchServices();
      fetchArea();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedUserId) {
      const selectedUser = users.filter((us) => us.id === selectedUserId)[0];
      if (selectedUser?.area) {
        setBookingData((prev) => ({
          ...prev,
          area: selectedUser.area,
        }));
      }
      if (selectedUser?.area && selectedUser.districtId) {
        setBookingData((prev) => ({
          ...prev,
          district: selectedUser.districtId,
        }));
      }
      if (
        selectedUser?.area &&
        selectedUser.districtId &&
        selectedUser.propertyId
      ) {
        setBookingData((prev) => ({
          ...prev,
          property: selectedUser.propertyId,
        }));
      }
      if (
        selectedUser?.area &&
        selectedUser.districtId &&
        selectedUser.propertyId &&
        selectedUser.residenceTypeId
      ) {
        setBookingData((prev) => ({
          ...prev,
          residenceType: selectedUser.residenceTypeId,
        }));
      }
      if (selectedUser?.apartment_number) {
        setBookingData((prev) => ({
          ...prev,
          apartmentNumber: selectedUser.apartment_number,
        }));
      }
    }
  }, [selectedUserId]);

  const blockSchedule = async () => {
    try {
      setIsLoading(true);

      const data: any = {
        userPhone: bookingData.phoneNumber,
        no_of_cleaners: 2,
        userId: selectedUserId,
        timeslots: selectedTimeSlots,
        teamId: selectedBundleDetail?.teamId || selectedTeamId,
        areaId: bookingData.area,
        districtId: bookingData.district,
        propertyId: bookingData.property,
        residenceTypeId: bookingData.residenceType,
        startDate: bookingData.startDate,
        endDate: finalBookingData.endDate,
        frequency: bookingData.frequency,
        userAvailableInApartment: bookingData.userPresent,
        specialInstructions: bookingData.specialInstructions,
        appartmentNumber: bookingData.apartmentNumber,
        serviceId: bookingData.subService,
        renewal_slots: renewalSlots,
      };

      const blockData = await BlockBookingAction(data);
      setBookingId(blockData?.booking?.id);
      setIsLoading(false);
      setShowSummary(true);
    } catch (error: any) {
      setIsLoading(false);
      console.log("error", error);
      toast.error(error.message || "something went wrong");
    }
  };

  useEffect(() => {
    if (!bookingId) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [bookingId]);

  useEffect(() => {
    if (bookingData.frequency && bookingData.duration) {
      if (isFrequencyRecurring && bookingData.duration) {
        const endDate = moment()
          .add(parseInt(bookingData.duration), "months")
          .format("YYYY-MM-DD");
      }
    }
  }, [bookingData.frequency, bookingData.duration]);

  const formatTimeDisplay = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setBookingData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));

    if (name === "phoneNumber") {
      setFinalBookingData((prev) => ({
        ...prev,
        userPhone: `%2b${value.replace(/\D/g, "")}`,
      }));
    }
  };

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setIsLoading(true);
      fetchFrequencies();

      if (currentStep === 1 && isCreatingNewUser) {
        await createNewUser();
      } else if (
        currentStep === 4 &&
        bookingData.startDate &&
        bookingData.frequency
      ) {
        await fetchBundles();
      }

      setIsLoading(false);
      setCurrentStep((prev) => prev + 1);
    } else {
      await blockSchedule();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      if (currentStep === 2 && isCreatingNewUser) {
        setIsCreatingNewUser(false);
      } else {
        setCurrentStep((prev) => prev - 1);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const response = await ConfirmBookingAction({
        userPhone: bookingData.phoneNumber,
        specialInstructions: bookingData.specialInstructions,
        appartmentNumber: bookingData.apartmentNumber,
        userAvailableInApartment: bookingData.userPresent,
        bookingId: bookingId as string,
      });
      console.log("Service booked successfully:", response);
      window.location.reload();
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleCancel = () => {
    if (currentStep === 1) {
      setShowCancelModal(true);
    } else {
      if (currentStep === 5) {
        setSelectedTimeSlots([]);
        setRenewalSlots([]);
      }
      setCurrentStep((prev) => prev - 1);
    }
  };

  const confirmCancel = () => {
    setBookingData({
      service: "",
      subService: "",
      area: "",
      district: "",
      property: "",
      residenceType: "",
      frequency: "",
      duration: "",
      startDate: "",
      bundle: "",
      timeSlot: "",
      userName: "",
      phoneNumber: "",
      email: "",
      apartmentNumber: "",
      userPresent: true,
      specialInstructions: "",
    });
    setFinalBookingData({
      userPhone: "",
      no_of_cleaners: 2,
      userId: "",
      timeslots: [],
      teamId: "",
      areaId: "",
      districtId: "",
      propertyId: "",
      residenceTypeId: "",
      startDate: "",
      endDate: "",
      frequency: "",
      renewal_slots: [],
    });
    setSelectedTimeSlots([]);
    setRenewalSlots([]);
    setSelectedBundleDetail(null);
    setCurrentStep(1);
    setShowCancelModal(false);
    onClose();
    setIsCreatingNewUser(false);
    setSelectedUserId(null);
  };

  const isFrequencyRecurring =
    bookingData.frequency !== "one_time" && bookingData.frequency !== "";

  const isNextButtonDisabled = () => {
    if (isLoading) return true;

    switch (currentStep) {
      case 1:
        if (isCreatingNewUser) {
          return (
            !bookingData.userName ||
            !bookingData.phoneNumber ||
            !bookingData.email
          );
        }
        return !selectedUserId;
      case 2:
        return !bookingData.service || !bookingData.subService;
      case 3:
        return (
          !bookingData.area ||
          !bookingData.district ||
          !bookingData.property ||
          !bookingData.residenceType
        );
      case 4:
        return (
          !bookingData.frequency ||
          (isFrequencyRecurring && !bookingData.duration) ||
          !bookingData.startDate
        );
      case 5:
        return !bookingData.bundle;
      case 6:
        const requiredSlots = getSliceEndIndex();
        console.log("selectedlst", selectedTimeSlots);
        return false;
      default:
        return false;
    }
  };

  // Render time slot section (updated for actual data structure)
  const renderTimeSlotSection = (
    day: string,
    dayLabel: string,
    index: number
  ) => {
    // Find the booking day that matches the current day
    const bookingDay = selectedBundleDetail?.booking?.find(
      (b: any) => b.day === day
    );

    if (
      !bookingDay ||
      !bookingDay.timeSlots ||
      bookingDay.timeSlots.length === 0
    ) {
      return (
        <div
          className='bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8'
          key={index}>
          <h3 className='text-base sm:text-lg md:text-[18px] font-semibold mb-4 sm:mb-6 text-gray-800'>
            {dayLabel}*
          </h3>
          <p className='text-gray-500'>
            No time slots available for {dayLabel}
          </p>
          <pre className='mt-2 text-xs text-gray-400'>
            Available booking days:{" "}
            {selectedBundleDetail?.booking?.map((b: any) => b.day).join(", ")}
          </pre>
        </div>
      );
    }

    return (
      <div
        className='bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8'
        key={index}>
        <div className='flex justify-between items-center mb-2 sm:mb-4'>
          <h3 className='text-base sm:text-lg md:text-[18px] font-semibold text-gray-800'>
            {dayLabel}* ({bookingDay.timeSlots.length} slots)
          </h3>
          {selectedTimeSlots.some(
            (slot) =>
              new Date(slot.date).toDateString() ===
              new Date(bookingDay.date).toDateString()
          ) ? (
            <div className='flex items-center text-green-600'>
              <Check className='w-4 h-4 mr-1' />
              <span className='text-xs font-medium'>Selected</span>
            </div>
          ) : (
            <div className='text-xs text-orange-500 font-medium'>
              Please select
            </div>
          )}
        </div>
        <p className='text-xs text-gray-500 mb-4'>
          Select one time slot for {dayLabel}
        </p>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'>
          {bookingDay.timeSlots.map((slot: any, idx: number) => {
            // Check if this specific slot is selected (one per day)
            const isSelected = selectedTimeSlots.some(
              (selected: any) =>
                selected.start_time === slot.startTime + ":00" &&
                selected.end_time === slot.endTime + ":00" &&
                selected.date === slot.date
            );

            return (
              <button
                key={idx}
                className={`p-3 sm:p-4 border rounded-xl text-center transition-all flex items-center justify-between duration-200 shadow-sm hover:shadow-md min-h-[60px] sm:min-h-[70px] ${
                  isSelected
                    ? "border-[#25388C] bg-white shadow-lg ring-2 ring-[#25388C] ring-opacity-20"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleTimeSlotSelect(day, idx)}>
                <div className='font-medium flex-1 text-sm sm:text-base md:text-[16px] text-gray-700 text-left'>
                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                  <div className='text-xs text-gray-500'>{slot.date}</div>
                </div>

                {isSelected && (
                  <div className='flex justify-end ml-2'>
                    <div className='w-4 h-4 sm:w-5 sm:h-5 bg-[#25388C] rounded-full flex items-center justify-center shadow-md flex-shrink-0'>
                      <Check className='w-2.5 h-2.5 sm:w-3 sm:h-3 text-white' />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <div className='fixed inset-0 bg-gray-500/40 z-50 flex items-center justify-center p-4 '>
        <div className='bg-white rounded-lg shadow-xl z-50 w-full max-w-md overflow-hidden'>
          <div className='p-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white'>
            <h2 className='text-xl font-semibold'>Book a Service</h2>
            {!showSummary && (
              <div className='mt-3 flex items-center'>
                {Array.from({ length: totalSteps }).map((_, index) => (
                  <React.Fragment key={index}>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium border-2
                        ${
                          index + 1 === currentStep
                            ? "bg-white text-blue-700 border-white"
                            : index + 1 < currentStep
                            ? "bg-green-400 text-white border-white"
                            : "bg-blue-500 text-white border-white border-opacity-50"
                        }`}>
                      {index + 1 < currentStep ? "✓" : index + 1}
                    </div>
                    {index < totalSteps - 1 && (
                      <div
                        className={`h-1 flex-1 mx-1 ${
                          index + 1 < currentStep
                            ? "bg-green-400"
                            : "bg-blue-500 bg-opacity-50"
                        }`}></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          <div className='p-6 max-h-96 overflow-y-auto'>
            {showSummary ? (
              <div className='space-y-5'>
                <div className='p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center'>
                  <p className='font-medium text-yellow-800'>
                    Your booking will expire in:
                  </p>
                  <p className='text-3xl font-bold text-red-600'>
                    {formatTimeDisplay(timeLeft)}
                  </p>
                  <p className='text-sm text-yellow-800'>
                    Please confirm your booking within the time limit
                  </p>
                </div>

                <h3 className='text-lg font-semibold border-b pb-2'>
                  Booking Summary
                </h3>
                <div className='space-y-3 text-gray-700'>
                  <div className='bg-gray-50 p-3 rounded-lg'>
                    <h4 className='font-medium text-gray-900'>
                      Customer Information
                    </h4>
                    <p>
                      <span className='text-gray-500'>Name:</span>{" "}
                      {bookingData.userName}
                    </p>
                    <p>
                      <span className='text-gray-500'>Phone:</span>{" "}
                      {bookingData.phoneNumber}
                    </p>
                    <p>
                      <span className='text-gray-500'>Email:</span>{" "}
                      {bookingData.email}
                    </p>
                  </div>

                  <div className='bg-gray-50 p-3 rounded-lg'>
                    <h4 className='font-medium text-gray-900'>
                      Service Details
                    </h4>
                    <p>
                      <span className='text-gray-500'>Service:</span>{" "}
                      {services.find((s) => s.id === bookingData.service)?.name}{" "}
                      -{" "}
                      {
                        subServices.find((s) => s.id === bookingData.subService)
                          ?.name
                      }
                    </p>
                    <p>
                      <span className='text-gray-500'>Location:</span>{" "}
                      {areas.find((a) => a.id === bookingData.area)?.name},{" "}
                      {
                        districts.find((a) => a.id === bookingData.district)
                          ?.name
                      }
                    </p>
                    <p>
                      <span className='text-gray-500'>Property:</span>{" "}
                      {
                        properties.find((a) => a.id === bookingData.property)
                          ?.name
                      }{" "}
                      -{" "}
                      {
                        residenceTypes.find(
                          (a) => a.id === bookingData.residenceType
                        )?.type
                      }
                    </p>
                  </div>

                  <div className='bg-gray-50 p-3 rounded-lg'>
                    <h4 className='font-medium text-gray-900'>Schedule</h4>
                    <p>
                      <span className='text-gray-500'>Frequency:</span>{" "}
                      {bookingData.frequency}
                    </p>
                    {isFrequencyRecurring && (
                      <p>
                        <span className='text-gray-500'>Duration:</span>{" "}
                        {bookingData.duration}{" "}
                        {bookingData.duration === "1" ? "month" : "months"}
                      </p>
                    )}
                    <p>
                      <span className='text-gray-500'>Start Date:</span>{" "}
                      {bookingData.startDate}
                    </p>
                    <p>
                      <span className='text-gray-500'>End Date:</span>{" "}
                      {finalBookingData.endDate}
                    </p>
                    <p>
                      <span className='text-gray-500'>Bundle:</span>{" "}
                      {selectedBundleDetail?.dayCombination?.join(", ")}
                    </p>
                  </div>

                  <div className='bg-gray-50 p-3 rounded-lg'>
                    <h4 className='font-medium text-gray-900'>
                      Additional Details
                    </h4>
                    <p>
                      <span className='text-gray-500'>Apartment:</span>{" "}
                      {bookingData.apartmentNumber}
                    </p>
                    <p>
                      <span className='text-gray-500'>
                        Present during service:
                      </span>{" "}
                      {bookingData.userPresent ? "Yes" : "No"}
                    </p>
                    {bookingData.specialInstructions && (
                      <p>
                        <span className='text-gray-500'>
                          Special Instructions:
                        </span>{" "}
                        {bookingData.specialInstructions}
                      </p>
                    )}
                  </div>
                </div>

                {!isLoading ? (
                  <button
                    onClick={handleSubmit}
                    className='w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium shadow-md flex items-center justify-center outline-none focus:outline-none'>
                    <span>Confirm Booking</span>
                  </button>
                ) : (
                  <div className='w-6 h-6 border-6 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
                )}
              </div>
            ) : (
              <>
                {/* Step 1: Select or Create User */}
                {currentStep === 1 && (
                  <div className='space-y-5'>
                    <h3 className='text-lg font-medium text-gray-900'>
                      {isCreatingNewUser
                        ? "Create New User"
                        : "Select Customer"}
                    </h3>

                    {!isCreatingNewUser ? (
                      <>
                        <div className='space-y-3'>
                          <label className='block font-medium text-gray-700'>
                            Select Existing Customer
                          </label>
                          <Combobox
                            value={selectedUserId}
                            onChange={(userId) => {
                              setSelectedUserId(userId);
                              const selectedUser = users.find(
                                (u) => u.id === userId
                              );
                              if (selectedUser) {
                                setBookingData((prev) => ({
                                  ...prev,
                                  userName: selectedUser.name,
                                  phoneNumber: selectedUser.phone,
                                  email: selectedUser.email,
                                }));
                                setFinalBookingData((prev) => ({
                                  ...prev,
                                  userId: selectedUser.id,
                                  userPhone: `%2b${selectedUser.phone.replace(
                                    /\D/g,
                                    ""
                                  )}`,
                                }));
                              }
                            }}>
                            <Combobox.Input
                              onChange={(e) => setQuery(e.target.value)}
                              displayValue={(userId) => {
                                const u = users.find((u) => u.id === userId);
                                return u ? `${u.name} - ${u.phone}` : "";
                              }}
                              className={`w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition ${noFocusStyle}`}
                              placeholder='Select a customer'
                              required
                            />
                            <Combobox.Options className='absolute z-10 mt-1 max-h-60 overflow-auto rounded-md bg-gray-100 py-1 text-base shadow-lg'>
                              {filteredUsers.map((user) => (
                                <Combobox.Option
                                  key={user.id}
                                  value={user.id}
                                  className='cursor-pointer px-4 py-2 hover:bg-gray-100'>
                                  {user.name} - {user.phone}
                                </Combobox.Option>
                              ))}
                            </Combobox.Options>
                          </Combobox>
                        </div>

                        <div className='text-center'>
                          <button
                            onClick={() => setIsCreatingNewUser(true)}
                            className='text-blue-600 hover:text-blue-800 font-medium'>
                            + Create New Customer
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className='space-y-3'>
                          <label className='block font-medium text-gray-700'>
                            Full Name
                          </label>
                          <input
                            type='text'
                            name='userName'
                            value={bookingData.userName}
                            onChange={handleChange}
                            className={`w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition ${noFocusStyle}`}
                            placeholder='John Doe'
                            required
                          />
                        </div>

                        <div className='space-y-3'>
                          <label className='block font-medium text-gray-700'>
                            Phone Number
                          </label>
                          <input
                            type='tel'
                            name='phoneNumber'
                            value={bookingData.phoneNumber}
                            onChange={handleChange}
                            className={`w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition ${noFocusStyle}`}
                            placeholder='971501234567'
                            required
                          />
                        </div>

                        <div className='space-y-3'>
                          <label className='block font-medium text-gray-700'>
                            Email
                          </label>
                          <input
                            type='email'
                            name='email'
                            value={bookingData.email}
                            onChange={handleChange}
                            className={`w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition ${noFocusStyle}`}
                            placeholder='john@example.com'
                            required
                          />
                        </div>
                        <div className='space-y-5'>
                          <h3 className='text-lg font-medium text-gray-900'>
                            Location Details
                          </h3>

                          {/* Apartment Number */}
                          <div className='space-y-3'>
                            <label className='block font-medium text-gray-700'>
                              Apartment Number
                            </label>
                            <input
                              type='text'
                              name='apartmentNumber'
                              value={bookingData.apartmentNumber}
                              onChange={handleChange}
                              className={`w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition ${noFocusStyle}`}
                              placeholder='e.g., 101, Villa 2A'
                              required
                            />
                          </div>

                          {/* Area Selection */}
                          <div className='space-y-3'>
                            <label className='block font-medium text-gray-700'>
                              Select Area
                            </label>
                            <select
                              name='area'
                              value={bookingData.area}
                              onChange={(e) => {
                                handleChange(e);
                                setBookingData((prev) => ({
                                  ...prev,
                                  district: "",
                                  property: "",
                                  residenceType: "",
                                }));
                                fetchDistrict(e.target.value);
                              }}
                              className={`w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition ${noFocusStyle}`}
                              required>
                              <option value=''>Select an area</option>
                              {areas.map((area) => (
                                <option key={area.id} value={area.id}>
                                  {area.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* District Selection */}
                          {bookingData.area && (
                            <div className='space-y-3'>
                              <label className='block font-medium text-gray-700'>
                                Select District
                              </label>
                              <select
                                name='district'
                                value={bookingData.district}
                                onChange={(e) => {
                                  handleChange(e);
                                  setBookingData((prev) => ({
                                    ...prev,
                                    property: "",
                                    residenceType: "",
                                  }));
                                  fetchProperty(e.target.value);
                                }}
                                className={`w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition ${noFocusStyle}`}
                                required>
                                <option value=''>Select a district</option>
                                {districts.map((district) => (
                                  <option key={district.id} value={district.id}>
                                    {district.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          {/* Property Selection */}
                          {bookingData.district && (
                            <div className='space-y-3'>
                              <label className='block font-medium text-gray-700'>
                                Select Property
                              </label>
                              <select
                                name='property'
                                value={bookingData.property}
                                onChange={(e) => {
                                  handleChange(e);
                                  setBookingData((prev) => ({
                                    ...prev,
                                    residenceType: "",
                                  }));
                                  fetchResidenceTypes();
                                }}
                                className={`w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition ${noFocusStyle}`}
                                required>
                                <option value=''>Select a property</option>
                                {properties.map((property) => (
                                  <option key={property.id} value={property.id}>
                                    {property.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          {/* Residence Type Selection */}
                          {bookingData.property && (
                            <div className='space-y-3'>
                              <label className='block font-medium text-gray-700'>
                                Select Residence Type
                              </label>
                              <select
                                name='residenceType'
                                value={bookingData.residenceType}
                                onChange={handleChange}
                                className={`w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition ${noFocusStyle}`}
                                required>
                                <option value=''>Select residence type</option>
                                {residenceTypes.map((residence) => (
                                  <option
                                    key={residence.id}
                                    value={residence.id}>
                                    {residence.type}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Step 2: Select Service */}
                {currentStep === 2 && (
                  <div className='space-y-5'>
                    <h3 className='text-lg font-medium text-gray-900'>
                      Service Selection
                    </h3>
                    <div className='space-y-3'>
                      <label className='block font-medium text-gray-700'>
                        Select Service
                      </label>
                      <select
                        name='service'
                        value={bookingData.service}
                        onChange={(e) => {
                          handleChange(e);
                          setBookingData((prev) => ({
                            ...prev,
                            subService: "",
                          }));
                          fetchSubServices(e.target.value);
                        }}
                        className={`w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition ${noFocusStyle}`}
                        required>
                        <option value=''>Select a service</option>
                        {services.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {bookingData.service && (
                      <div className='space-y-3'>
                        <label className='block font-medium text-gray-700'>
                          Select Sub-Service
                        </label>
                        <select
                          name='subService'
                          value={bookingData.subService}
                          onChange={(e) => {
                            handleChange(e);
                            fetchArea();
                          }}
                          className={`w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition ${noFocusStyle}`}
                          required>
                          <option value=''>Select a sub-service</option>
                          {subServices?.map((subService) => (
                            <option key={subService.id} value={subService.id}>
                              {subService.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Location */}
                {currentStep === 3 && (
                  <div className='space-y-5'>
                    <h3 className='text-lg font-medium text-gray-900'>
                      Location Details
                    </h3>

                    {/* Apartment Number */}
                    <div className='space-y-3'>
                      <label className='block font-medium text-gray-700'>
                        Apartment Number
                      </label>
                      <input
                        type='text'
                        name='apartmentNumber'
                        value={bookingData.apartmentNumber}
                        onChange={handleChange}
                        className={`w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition ${noFocusStyle}`}
                        placeholder='e.g., 101, Villa 2A'
                        required
                      />
                    </div>

                    {/* Area Selection */}
                    <div className='space-y-3'>
                      <label className='block font-medium text-gray-700'>
                        Select Area
                      </label>
                      <select
                        name='area'
                        value={bookingData.area}
                        onChange={(e) => {
                          handleChange(e);
                          setBookingData((prev) => ({
                            ...prev,
                            district: "",
                            property: "",
                            residenceType: "",
                          }));
                          fetchDistrict(e.target.value);
                        }}
                        className={`w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition ${noFocusStyle}`}
                        required>
                        <option value=''>Select an area</option>
                        {areas.map((area) => (
                          <option key={area.id} value={area.id}>
                            {area.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* District Selection */}
                    {bookingData.area && (
                      <div className='space-y-3'>
                        <label className='block font-medium text-gray-700'>
                          Select District
                        </label>
                        <select
                          name='district'
                          value={bookingData.district}
                          onChange={(e) => {
                            handleChange(e);
                            setBookingData((prev) => ({
                              ...prev,
                              property: "",
                              residenceType: "",
                            }));
                            fetchProperty(e.target.value);
                          }}
                          className={`w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition ${noFocusStyle}`}
                          required>
                          <option value=''>Select a district</option>
                          {districts.map((district) => (
                            <option key={district.id} value={district.id}>
                              {district.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Property Selection */}
                    {bookingData.district && (
                      <div className='space-y-3'>
                        <label className='block font-medium text-gray-700'>
                          Select Property
                        </label>
                        <select
                          name='property'
                          value={bookingData.property}
                          onChange={(e) => {
                            handleChange(e);
                            setBookingData((prev) => ({
                              ...prev,
                              residenceType: "",
                            }));
                            fetchResidenceTypes();
                          }}
                          className={`w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition ${noFocusStyle}`}
                          required>
                          <option value=''>Select a property</option>
                          {properties.map((property) => (
                            <option key={property.id} value={property.id}>
                              {property.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Residence Type Selection */}
                    {bookingData.property && (
                      <div className='space-y-3'>
                        <label className='block font-medium text-gray-700'>
                          Select Residence Type
                        </label>
                        <select
                          name='residenceType'
                          value={bookingData.residenceType}
                          onChange={handleChange}
                          className={`w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition ${noFocusStyle}`}
                          required>
                          <option value=''>Select residence type</option>
                          {residenceTypes.map((residence) => (
                            <option key={residence.id} value={residence.id}>
                              {residence.type}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    {/* User Presence */}
                    <div className='space-y-3 pt-2'>
                      <label className='flex items-center'>
                        <input
                          type='checkbox'
                          name='userPresent'
                          checked={bookingData.userPresent}
                          onChange={handleChange}
                          className='rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2'
                        />
                        <span className='text-gray-700'>
                          Will the user be present during service?
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Step 4: Schedule */}
                {currentStep === 4 && (
                  <div className='space-y-5'>
                    <h3 className='text-lg font-medium text-gray-900'>
                      Schedule Details
                    </h3>

                    {/* Frequency Selection */}
                    <div className='space-y-3'>
                      <label className='block font-medium text-gray-700'>
                        Select Frequency
                      </label>
                      <select
                        name='frequency'
                        value={bookingData.frequency}
                        onChange={(e) => {
                          handleChange(e);

                          setBookingData((prev) => ({
                            ...prev,
                            duration:
                              e.target.value === "one_time"
                                ? "1"
                                : prev.duration,
                          }));
                        }}
                        className={`w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition ${noFocusStyle}`}
                        required>
                        <option value=''>Select frequency</option>
                        {frequencies.map((frequency) => (
                          <option key={frequency.id} value={frequency.id}>
                            {frequency.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Duration Selection (only for recurring services) */}
                    {isFrequencyRecurring && (
                      <div className='space-y-3'>
                        <label className='block font-medium text-gray-700'>
                          Select Duration (months)
                        </label>
                        <select
                          name='duration'
                          value={bookingData.duration}
                          onChange={handleChange}
                          className={`w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition ${noFocusStyle}`}
                          required>
                          <option value=''>Select duration</option>
                          {durations.map((duration) => (
                            <option key={duration} value={duration.toString()}>
                              {duration} {duration === 1 ? "month" : "months"}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Start Date Selection */}
                    <div className='space-y-3'>
                      <label className='block font-medium text-gray-700'>
                        Select Start Date
                      </label>
                      {bookingData.duration && !isLoading ? (
                        <CustomDatePicker
                          startDate={moment().toDate()}
                          maxDate={moment(new Date())
                            .add(parseInt(bookingData.duration) || 1, "months")
                            .toDate()}
                          setStartDate={(date: any) => {
                            setBookingData((prev) => ({
                              ...prev,
                              startDate: moment(date).format("YYYY-MM-DD"),
                            }));
                          }}
                          unavailableDates={calendar}
                          minDate={moment().toDate()}
                        />
                      ) : !bookingData.frequency ? (
                        <p>Select a frequency first</p>
                      ) : (
                        <div className='w-6 h-6 border-6 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 5: Bundle Selection */}
                {currentStep === 5 && (
                  <div className='space-y-5'>
                    <h3 className='text-lg font-medium text-gray-900'>
                      Select a Cleaning Package
                    </h3>

                    {bundles.length > 0 ? (
                      <div className='grid grid-cols-1 gap-3'>
                        <div className='text-xs text-gray-500 mb-2'>
                          Debug: Found {bundles.length} bundles
                        </div>
                        {bundles.map((bundle: any) => (
                          <div
                            key={bundle.bundleId}
                            className={`p-4 border rounded-lg cursor-pointer transition ${
                              bookingData.bundle === bundle.bundleId
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-300 hover:border-blue-300"
                            }`}
                            onClick={() => {
                              setBookingData((prev) => ({
                                ...prev,
                                bundle: bundle.bundleId,
                              }));

                              // Use the bundle data directly (no teams structure)
                              const foundBundleDetail = {
                                bundleId: bundle.bundleId,
                                dayCombination: bundle.dayCombination || [],
                                booking: bundle.booking || [],
                                renewableSlots: bundle.renewableSlots || [],
                              };

                              // Get teamId from first booking entry
                              const foundTeamId =
                                bundle.booking?.[0]?.teamId || null;

                              console.log(
                                "Selected bundle detail:",
                                foundBundleDetail
                              );
                              console.log("Team ID:", foundTeamId);

                              setSelectedBundleDetail(foundBundleDetail);
                              setSelectedTeamId(foundTeamId);
                              setFinalBookingData((prev) => ({
                                ...prev,
                                teamId: foundTeamId,
                              }));
                            }}>
                            <div className='flex justify-between items-center'>
                              <div>
                                <h4 className='font-medium text-gray-900'>
                                  {bundle.dayCombination?.join(", ") ||
                                    "No days specified"}
                                </h4>
                                <p className='text-xs text-gray-500'>
                                  Booking slots: {bundle.booking?.length || 0} |
                                  Renewal slots:{" "}
                                  {bundle.renewableSlots?.length || 0}
                                </p>
                              </div>
                              {bookingData.bundle === bundle.bundleId && (
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
                        {isLoading
                          ? "Loading bundles..."
                          : "No bundles available for the selected criteria"}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 6: Time Slot Selection - Same as TimeSlots component */}
                {currentStep === 6 && (
                  <div className='space-y-5'>
                    <div className='flex justify-between items-center mb-4'>
                      <div>
                        <h3 className='text-lg font-medium text-gray-900'>
                          Select Time Slots
                        </h3>
                        <p className='text-sm text-gray-600'>
                          Choose one time slot for each day of service
                        </p>
                      </div>
                      <div className='bg-blue-50 px-3 py-2 rounded-lg'>
                        <span className='text-sm font-medium text-blue-800'>
                          {selectedTimeSlots.length} / {getSliceEndIndex()}{" "}
                          selected
                        </span>
                      </div>
                    </div>

                    {selectedBundleDetail ? (
                      <div>
                        <p className='text-sm text-gray-600 mb-4'>
                          Selected Bundle:{" "}
                          {selectedBundleDetail.dayCombination?.join(", ")}
                        </p>

                        {selectedBundleDetail.booking &&
                        selectedBundleDetail.booking.length > 0 ? (
                          <div className='space-y-6 sm:space-y-8 px-2 sm:px-4 lg:px-0'>
                            {selectedBundleDetail.dayCombination
                              .slice(0, getSliceEndIndex())
                              .map((dc: any, idx: number) =>
                                renderTimeSlotSection(dc, dc, idx)
                              )}
                          </div>
                        ) : (
                          <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
                            <p className='text-yellow-800'>
                              No booking days found for this bundle.
                            </p>
                            <pre className='mt-2 text-xs text-yellow-700'>
                              {JSON.stringify(selectedBundleDetail, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className='text-center py-4 text-gray-500'>
                        {isLoading
                          ? "Loading time slots..."
                          : "Please select a bundle first"}
                      </div>
                    )}

                    {/* Special Instructions */}
                    <div className='space-y-3 pt-2'>
                      <label className='block font-medium text-gray-700'>
                        Special Instructions (Optional)
                      </label>
                      <textarea
                        name='specialInstructions'
                        value={bookingData.specialInstructions}
                        onChange={handleChange}
                        rows={3}
                        className={`w-full p-3 border border-gray-300 rounded-lg hover:border-gray-400 transition ${noFocusStyle}`}
                        placeholder='Any special instructions for the cleaning team...'
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className='p-4 border-t bg-gray-50 flex justify-between'>
            {showSummary ? (
              <button
                onClick={() => setShowSummary(false)}
                className='px-4 py-2 text-gray-600 hover:text-gray-800 transition'>
                Back to Edit
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  className='px-4 py-2 text-gray-600 hover:text-gray-800 transition'>
                  {currentStep === 1 ? "Cancel" : "Back"}
                </button>

                <button
                  onClick={handleNext}
                  disabled={isNextButtonDisabled()}
                  className={`px-6 py-2 flex items-center gap-4 bg-blue-600 text-white rounded-lg transition
                    ${
                      isNextButtonDisabled()
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-blue-700"
                    }`}>
                  {isLoading && (
                    <div className='w-6 h-6 border-6 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
                  )}{" "}
                  {currentStep === totalSteps ? "Block schedule" : "Next"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className='fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4'>
          <div className='bg-white rounded-lg max-w-sm w-full p-6 shadow-xl'>
            <h3 className='text-xl font-semibold text-gray-900 mb-3'>
              Cancel Booking?
            </h3>
            <p className='text-gray-600 mb-5'>
              Are you sure you want to cancel your booking? All your information
              will be lost.
            </p>
            <div className='flex space-x-3 justify-end'>
              <button
                onClick={() => setShowCancelModal(false)}
                className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition'>
                No, Continue
              </button>
              <button
                onClick={confirmCancel}
                className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition'>
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const BookingsHeader: React.FC = () => {
  const [showBookingDialog, setShowBookingDialog] = useState(false);

  return (
    <div className='p-6 bg-white rounded-lg shadow-sm'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-4'>
        <div>
          <h1 className='text-2xl font-bold'>Bookings</h1>
          <p className='text-gray-600'>
            Manage your bookings database and view detailed booking information
          </p>
        </div>
        <div className='flex space-x-3 mt-4 md:mt-0'>
          <button className='px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center'>
            <ArrowDownTrayIcon className='w-5 h-5 mr-2' />
            Export
          </button>
          <button
            onClick={() => setShowBookingDialog(true)}
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center'>
            <PlusCircleIcon className='w-5 h-5 mr-2' />
            New Booking
          </button>
        </div>
      </div>

      <BookingDialog
        isOpen={showBookingDialog}
        onClose={() => setShowBookingDialog(false)}
      />
    </div>
  );
};

export default BookingsHeader;
