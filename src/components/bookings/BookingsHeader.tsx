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
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<Record<string, string>>(
    {}
  );
  const [bundles, setBundles] = useState<any[]>([]);

  const totalSteps = 6; // Reduced from 7 since we removed the user details step

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await UsersActions(); // Replace with your actual user fetch action
      setUsers(response);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = query === ""
    ? users
    : users.filter((u) =>
      `${u.name} ${u.phone}`.toLowerCase().includes(query.toLowerCase())
    );


  const createNewUser = async () => {
    try {
      setIsLoading(true);
      // Replace with your actual user creation action
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

  const fetchCalendar = async (startDate: string, endDate: string) => {
    try {
      setIsLoading(true);
      const response = await CalendarAction(startDate, endDate);
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
        location: payload.location as { lat: any; lng: any },
        frequency: payload.frequency,
        servicePeriod: payload.servicePeriod,
        duration: payload.duration,
        serviceType: payload.serviceType,
      });
      console.log("payload", response);
      setBundles(response.data);
    } catch (error) {
      console.error("Error fetching bundles:", error);
    } finally {
      setIsLoading(false);
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

          setFinalBookingData((prev) => ({
            ...prev,
            teamId: team.teamId,
          }));

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
      setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const getSliceEndIndex = () => {
    return frequencyNumberMapping[bookingData.frequency] || 1;
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

    setFinalBookingData((prev) => {
      const filteredTimeslots = prev.timeslots.filter((t) => {
        return !t.schedule_id.includes(date);
      });

      if (!isSameSlot) {
        const newTimeslot = {
          schedule_id: slot.id,
          start_time: slot.startTime,
          end_time: slot.endTime,
          date: date,
          day: day,
        };

        return {
          ...prev,
          timeslots: [...filteredTimeslots, newTimeslot],
        };
      }

      return {
        ...prev,
        timeslots: filteredTimeslots,
      };
    });

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

    setBookingData((prev) => ({
      ...prev,
      timeSlot: selectedSlotsList,
    }));
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
      if (selectedUser.area) {
        setBookingData((prev) => ({
          ...prev,
          area: selectedUser.area,
        }));
      }
      if (selectedUser.area && selectedUser.districtId) {
        setBookingData((prev) => ({
          ...prev,
          district: selectedUser.districtId,
        }));
      }
      if (
        selectedUser.area &&
        selectedUser.districtId &&
        selectedUser.propertyId
      ) {
        setBookingData((prev) => ({
          ...prev,
          property: selectedUser.propertyId,
        }));
      }
      if (
        selectedUser.area &&
        selectedUser.districtId &&
        selectedUser.propertyId &&
        selectedUser.residenceTypeId
      ) {
        setBookingData((prev) => ({
          ...prev,
          residenceType: selectedUser.residenceTypeId,
        }));
      }
      if (selectedUser.apartment_number) {
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
      let timeslotsSelected: any[] = [];

      const selectedBundleId = bookingData.bundle;

      const selectedSlotsArray = bundles[0].teams.flatMap((team: any) =>
        team.availableBundles
          .filter((av: any) => av.bundleId === selectedBundleId)
          .flatMap((av: any) =>
            Object.entries(selectedSlots).map(
              ([day, slotInfo]: [string, any]) => {
                const startTime = slotInfo.split("_")[1].split("-")[0];
                const endTime = slotInfo.split("_")[1].split("-")[1];

                const scheduleId = slotInfo.split("_")[0];
                const matchingTimeSlots = av.days
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
          ? moment(bookingData.startDate)
              .add(parseInt(bookingData.duration), "months")
              .format("YYYY-MM-DD")
          : moment(bookingData.startDate).add(1, "day").format("YYYY-MM-DD");

      const firstTimeslot = timeslotsSelected[0];
      const startTime = firstTimeslot ? firstTimeslot.startTime : "00:00";
      const endTime = firstTimeslot ? firstTimeslot.endTime : "00:00";

      const formattedEndDate =
        bookingData.frequency === "one_time"
          ? `${endDate}T${endTime}:00`
          : endDate;

      const data: any = {
        userPhone: bookingData.phoneNumber,
        no_of_cleaners: 2,
        userId: selectedUserId,
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
        areaId: bookingData.area,
        districtId: bookingData.district,
        propertyId: bookingData.property,
        residenceTypeId: bookingData.residenceType,
        startDate:
          bookingData.frequency === "one_time"
            ? moment(bookingData.startDate).format("YYYY-MM-DD") +
              "T" +
              startTime
            : moment(bookingData.startDate).format("YYYY-MM-DD"),
        endDate: formattedEndDate,
        frequency: bookingData.frequency,
        userAvailableInApartment: bookingData.userPresent,
        specialInstructions: bookingData.specialInstructions,
        appartmentNumber: bookingData.apartmentNumber,
        serviceId: bookingData.subService,
      };

      const bookingId = await BlockBookingAction(data);
      setBookingId("bookingId");
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
    if (bookingData.bundle) {
      fetchTimeSlots(bookingData.bundle);
    }
  }, [bookingData.bundle]);

  useEffect(() => {
    if (bookingData.frequency && bookingData.duration) {
      if (isFrequencyRecurring && bookingData.duration) {
        const endDate = moment()
          .add(parseInt(bookingData.duration), "months")
          .format("YYYY-MM-DD");
        fetchCalendar(moment().format("YYYY-MM-DD"), endDate);
      }
    }
  }, [bookingData.frequency, bookingData.duration]);
  const formatTime = (seconds: number) => {
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
      } else if (currentStep === 4 && bookingData.bundle) {
        await fetchTimeSlots(bookingData.bundle);
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
        setSelectedSlots({});
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
    });
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
        return (
          finalBookingData.timeslots.length === 0 ||
          !bookingData.apartmentNumber
        );
      default:
        return false;
    }
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
                    {formatTime(timeLeft)}
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
                      {
                        services.filter((s) => s.id === bookingData.service)[0]
                          .name
                      }{" "}
                      -{" "}
                      {
                        subServices.filter(
                          (s) => s.id === bookingData.subService
                        )[0].name
                      }
                    </p>
                    <p>
                      <span className='text-gray-500'>Location:</span>{" "}
                      {areas.filter((a) => a.id === bookingData.area)[0].name},{" "}
                      {
                        districts.filter(
                          (a) => a.id === bookingData.district
                        )[0].name
                      }
                    </p>
                    <p>
                      <span className='text-gray-500'>Property:</span>{" "}
                      {
                        properties.filter(
                          (a) => a.id === bookingData.property
                        )[0].name
                      }{" "}
                      -{" "}
                      {
                        residenceTypes.filter(
                          (a) => a.id === bookingData.residenceType
                        )[0].type
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
                      {bookingData.bundle
                        .split("bundle-")[1]
                        .split("-gap")[0]
                        .replaceAll("-", ", ")}
                    </p>
                    <p>{bookingData.timeSlot}</p>
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
                          <Combobox value={selectedUserId} onChange={(userId) => {
                            setSelectedUserId(userId);
                            const selectedUser = users.find((u) => u.id === userId);
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
                                userPhone: `%2b${selectedUser.phone.replace(/\D/g, "")}`,
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
                              placeholder="Select a customer"
                              required
                            />
                            <Combobox.Options className="absolute z-10 mt-1 max-h-60 overflow-auto rounded-md bg-gray-100 py-1 text-base shadow-lg">
                              {filteredUsers.map((user) => (
                                <Combobox.Option key={user.id} value={user.id} className="cursor-pointer px-4 py-2 hover:bg-gray-100">
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
                        {bundles[0].bundles.map((bundle: any) => (
                          <div
                            key={bundle.id}
                            className={`p-4 border rounded-lg cursor-pointer transition ${
                              bookingData.bundle === bundle.id
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-300 hover:border-blue-300"
                            }`}
                            onClick={() => {
                              setBookingData((prev) => ({
                                ...prev,
                                bundle: bundle.id,
                              }));
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
                              {bookingData.bundle === bundle.id && (
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

                {/* Step 6: Time Slot Selection */}
                {currentStep === 6 && (
                  <div className='space-y-5'>
                    <h3 className='text-lg font-medium text-gray-900'>
                      Select Time Slots
                    </h3>

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
                                    handleTimeSlotSelection(
                                      slot,
                                      day.day,
                                      day.date
                                    )
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
                        {isLoading
                          ? "Loading time slots..."
                          : "No time slots available for the selected bundle"}
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
