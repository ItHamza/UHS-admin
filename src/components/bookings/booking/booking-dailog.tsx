"use client"

import React, { useState, useEffect } from "react"
import { Check, X } from "lucide-react"
import toast from "react-hot-toast"

import type { BookingData, FinalBookingData, User, ServiceOption, LocationOption, Bundle } from "@/types/new-booking"
import { CustomerSelection } from "./customer-selection"
import { ServiceSelection } from "./service-selection"
import { LocationDetails } from "./location-detail"
import { ScheduleDetails } from "./schedule-detail"
import { BookingSummary } from "./booking-summary"

// Import your action functions
import ServicesAction from "@/actions/service-action"
import AreaAction from "@/actions/area"
import DistrictAction from "@/actions/district"
import { PropertyAction } from "@/actions/property"
import ResidenceAction from "@/actions/residence"
import BlockBookingAction from "@/actions/block"
import ConfirmBookingAction from "@/actions/confirmBooking"
import { UserCreateAction, UsersActions } from "@/actions/users"
import SpecializedSubCategoriesAction from "@/actions/specialized-sub-categories"
import BundlesAction from "@/actions/bundles"
import moment from "moment"
import PricingAction from "@/actions/pricing"
import { BookingConfirmation } from "./booking-confirmation"
import { BundleSelection } from "./bundle-selection"
import { TimeSlotSelection } from "./time-slot-selection"
import { DeepBookingAction, SpecialisedBookingAction } from "@/actions/booking"

interface BookingDialogProps {
  isOpen: boolean
  onClose: () => void
}

const initialBookingData: BookingData = {
  service: "",
  subService: "",
  area: "",
  district: "",
  property: "",
  residenceType: "",
  frequency: "",
  duration: "",
  startDate: "",
  total_amount: 0,
  bundle: "",
  timeSlot: "",
  userName: "",
  phoneNumber: "",
  email: "",
  apartmentNumber: "",
  userPresent: true,
  specialInstructions: "",
  selectedSpecializedCategory: "",
  selectedSpecializedCategoryName: "",
  selectedSpecializedSubCategories: [],
  selectedSpecializedSubCategoryName: "",
  selectedSubServiceName: "",
}

const initialFinalBookingData: FinalBookingData = {
  userPhone: "",
  no_of_cleaners: 2,
  cleaning_supplies: true,
  userId: "",
  timeslots: [],
  teamId: "",
  areaId: "",
  districtId: "",
  propertyId: "",
  residenceTypeId: "",
  total_amount: 0,
  startDate: "",
  endDate: "",
  frequency: "",
  renewal_slots: [],
  status: "",
  payment_status: ""
}

export const frequencyNumberMapping: Record<string, number> = {
  one_time: 1,
  once: 1,
  twice: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
}

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

export const BookingDialog: React.FC<BookingDialogProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [bookingData, setBookingData] = useState<BookingData>(initialBookingData)
  const [finalBookingData, setFinalBookingData] = useState<FinalBookingData>(initialFinalBookingData)

  // Data states
  const [users, setUsers] = useState<User[]>([])
  const [services, setServices] = useState<ServiceOption[]>([])
  const [subServices, setSubServices] = useState<ServiceOption[]>([])
  const [specialServices, setSpecialServices] = useState<ServiceOption[]>([])
  const [areas, setAreas] = useState<LocationOption[]>([])
  const [districts, setDistricts] = useState<LocationOption[]>([])
  const [properties, setProperties] = useState<LocationOption[]>([])
  const [residenceTypes, setResidenceTypes] = useState<any[]>([])
  const [frequencies, setFrequencies] = useState<any[]>([])
  const [bundles, setBundles] = useState<Bundle[]>([])
  const [calendar, setCalendar] = useState<Date[]>([])
  const [specializedSubCategories, setSpecializedSubCategories] = useState<any[]>([])
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<any[]>([])
  const [renewalSlots, setRenewalSlots] = useState<any[]>([])



  // UI states
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [isCreatingNewUser, setIsCreatingNewUser] = useState(false)
  const [query, setQuery] = useState("")
  const [showSummary, setShowSummary] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [timeLeft, setTimeLeft] = useState(600)
  const [selectedBundleDetail, setSelectedBundleDetail] = useState<any>(null)
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  
  

  const totalSteps = getMaxSteps()

  function getMaxSteps(): number {
    const isRegularService = bookingData.selectedSubServiceName.toLowerCase().includes("regular")
    return isRegularService ? 7 : 7 // Always show 7 steps in progress, but skip 5&6 for non-regular
  }

  // Fetch functions
  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await UsersActions()
      setUsers(response)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Failed to fetch users")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchServices = async () => {
    try {
      setIsLoading(true)
      const response = await ServicesAction({})
      setServices(response.data)
    } catch (error) {
      console.error("Error fetching services:", error)
      toast.error("Failed to fetch services")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSubServices = async (parentId: string) => {
    try {
      setIsLoading(true)
      const response = await ServicesAction({ parentId })
      setSubServices(response.data)
    } catch (error) {
      console.error("Error fetching sub-services:", error)
      toast.error("Failed to fetch sub-services")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSpecialServices = async (parentId: string) => {
    try {
      setIsLoading(true)
      const response = await ServicesAction({ parentId })
      setSpecialServices(response.data)
      setSpecializedSubCategories([])
      if (response.data.length === 0) {
        await fetchAreas()
      }
    } catch (error) {
      console.error("Error fetching special services:", error)
      toast.error("Failed to fetch special services")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAreas = async () => {
    try {
      setIsLoading(true)
      const response = await AreaAction()
      setAreas(response)
    } catch (error) {
      console.error("Error fetching areas:", error)
      toast.error("Failed to fetch areas")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchDistricts = async (areaId: string) => {
    try {
      setIsLoading(true)
      const response = await DistrictAction(areaId)
      setDistricts(response)
      setFinalBookingData((prev) => ({ ...prev, areaId }))
    } catch (error) {
      console.error("Error fetching districts:", error)
      toast.error("Failed to fetch districts")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchProperties = async (districtId: string) => {
    try {
      setIsLoading(true)
      const response = await PropertyAction(districtId)
      setProperties(response)
      setFinalBookingData((prev) => ({ ...prev, districtId }))
    } catch (error) {
      console.error("Error fetching properties:", error)
      toast.error("Failed to fetch properties")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchResidenceTypes = async () => {
    try {
      setIsLoading(true)
      const response = await ResidenceAction()
      setResidenceTypes(response)
    } catch (error) {
      console.error("Error fetching residence types:", error)
      toast.error("Failed to fetch residence types")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchFrequencies = async () => {
    const response = [
      { id: "one_time", label: "One Time" },
      { id: "once", label: "Once a week" },
      { id: "twice", label: "2 Times A Week" },
      { id: "three", label: "3 Times A Week" },
      { id: "four", label: "4 Times A Week" },
      { id: "five", label: "5 Times A Week" },
      { id: "six", label: "6 Times A Week" },
    ]
    setFrequencies(response)
  }

  const fetchSpecializedSubCategories = async (categoryId: string) => {
    try {
      setIsLoading(true)
      const category = categoryId.split(" ")[0].toLowerCase()
      const response = await SpecializedSubCategoriesAction(category)
      setSpecializedSubCategories(response.data.items)
    } catch (error) {
      console.error("Error fetching specialized sub-categories:", error)
      toast.error("Failed to fetch specialized sub-categories")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchBundles = async () => {
    try {
      setIsLoading(true)
      const formattedDate = moment(bookingData.startDate).format("YYYY-MM-DD")
      const residenceSelected = residenceTypes.filter((r) => r.id === bookingData.residenceType)

      const duration: number = residenceDurationMap[residenceSelected.length > 0 ? residenceSelected[0].type : ""] || 60

      const propertySelected = properties.filter((p) => p.id === bookingData.property).at(0)

      if (!propertySelected) {
        toast.error("Property not found")
        setIsLoading(false)
        return
      }

      const propertyLocation = {
        lat: propertySelected.latitude,
        lng: propertySelected.longitude,
        district_id: bookingData.district,
      }

      const payload = {
        startDate: formattedDate,
        location: propertyLocation,
        frequency: bookingData.frequency,
        servicePeriod: Number.parseInt(bookingData.duration) || 1,
        serviceType: residenceSelected[0]?.type || "",
        duration: duration,
      }

      const endDate = moment(formattedDate)
        .add(Number.parseInt(bookingData.duration) || 1, "months")
        .format("YYYY-MM-DD")

      setFinalBookingData((prev) => ({
        ...prev,
        propertyId: bookingData.property,
        residenceTypeId: bookingData.residenceType,
        startDate: formattedDate,
        endDate: endDate,
        frequency: bookingData.frequency,
        // total_amount: Number(match?.total_amount || 0),
      }))

      const response = await BundlesAction({
        startDate: payload.startDate,
        location: payload.location as {
          lat: any
          lng: any
          district_id: string
        },
        frequency: payload.frequency,
        servicePeriod: payload.servicePeriod,
        duration: payload.duration,
        serviceType: payload.serviceType,
        serviceId: bookingData.subService,
      })

      setBundles(response.data || [])
      if (Object.keys(response.data).length === 0) {
        toast.error(response.message || "Bundles are not available for this date")
      }
    } catch (error: any) {
      toast.error(error?.message || "something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPricing = async () => {
    const pricingResponse = await PricingAction()
      const match = pricingResponse.find(
        (p: any) =>
          p.frequency.includes(bookingData.frequency) &&
          p.service?.parent_id === bookingData.service &&
          p.residence_type_id === bookingData.residenceType,
      )
      setFinalBookingData((prev) => ({
        ...prev,
        total_amount: Number(match?.total_amount || 0),
        no_of_cleaners: match.service?.no_of_cleaners,
        cleaning_supplies: match.service?.cleaning_supply_included
      }))
  }

  // Time slot selection logic
  const handleTimeSlotSelect = (day: string, index: number): void => {
    if (!selectedBundleDetail || !selectedBundleDetail.booking) {
      console.error("No selectedBundleDetail or booking data")
      return
    }

    const timeslots: any[] = [...selectedTimeSlots]
    const renewalSlotTemp: any[] = [...renewalSlots]

    selectedBundleDetail.booking.forEach((bk: any) => {
      if (bk.day === day) {
        const timeSlotFiltered = bk.timeSlots.filter(
          (ts: any) => ts.startTime === bk.timeSlots[index].startTime && ts.endTime === bk.timeSlots[index].endTime,
        )[0]

        const existIndex = timeslots.findIndex((v) => v.date === timeSlotFiltered.date)

        if (existIndex !== -1) {
          timeslots[existIndex] = {
            start_time: `${timeSlotFiltered.startTime}:00`,
            end_time: `${timeSlotFiltered.endTime}:00`,
            schedule_id: timeSlotFiltered.scheduleId,
            date: timeSlotFiltered.date,
          }
        } else {
          timeslots.push({
            start_time: `${timeSlotFiltered.startTime}:00`,
            end_time: `${timeSlotFiltered.endTime}:00`,
            schedule_id: timeSlotFiltered.scheduleId,
            date: timeSlotFiltered.date,
          })
        }
      }
    })

    selectedBundleDetail.renewableSlots.forEach((bk: any) => {
      if (bk.day === day) {
        const timeSlotFiltered = bk.timeSlots.filter(
          (ts: any) => ts.startTime === bk.timeSlots[index].startTime && ts.endTime === bk.timeSlots[index].endTime,
        )[0]

        const existIndex = renewalSlotTemp.findIndex((v) => v.date === timeSlotFiltered.date)

        if (existIndex !== -1) {
          renewalSlotTemp[existIndex] = {
            start_time: `${timeSlotFiltered.startTime}:00`,
            end_time: `${timeSlotFiltered.endTime}:00`,
            schedule_id: timeSlotFiltered.scheduleId,
            date: timeSlotFiltered.date,
          }
        } else {
          renewalSlotTemp.push({
            start_time: `${timeSlotFiltered.startTime}:00`,
            end_time: `${timeSlotFiltered.endTime}:00`,
            schedule_id: timeSlotFiltered.scheduleId,
            date: timeSlotFiltered.date,
          })
        }
      }
    })

    const sortedTimeslots = [...timeslots].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    })

    const sortedRenewalSlots = [...renewalSlotTemp].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    })

    setSelectedTimeSlots(sortedTimeslots)
    setRenewalSlots(sortedRenewalSlots)

    setFinalBookingData((prev) => ({
      ...prev,
      timeslots: sortedTimeslots,
      renewal_slots: sortedRenewalSlots,
    }))
  }

  // User management
  const createNewUser = async () => {
    try {
      setIsLoading(true)
      const newUser = await UserCreateAction({
        name: bookingData.userName,
        phone: bookingData.phoneNumber,
        whatsapp_number: bookingData.phoneNumber,
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
        lat: properties.find((p) => p.id === bookingData.property)?.latitude,
        lng: properties.find((p) => p.id === bookingData.property)?.longitude,
      })

      setUsers([...users, newUser])
      setSelectedUserId(newUser.id)
      setFinalBookingData((prev) => ({
        ...prev,
        userId: newUser.id,
        userPhone: `%2b${bookingData.phoneNumber.replace(/\D/g, "")}`,
      }))
      setIsCreatingNewUser(false)
      toast.success("User created successfully")
    } catch (error) {
      console.error("Error creating user:", error)
      toast.error("Failed to create user")
    } finally {
      setIsLoading(false)
    }
  }

  // Navigation
  const handleNext = async () => {
    const isRegularService = bookingData.selectedSubServiceName.toLowerCase().includes("regular")
    if (currentStep < totalSteps) {
      if (currentStep === 1 && isCreatingNewUser) {
        await createNewUser()
      }

      if (currentStep === 2) {
        await fetchAreas()
      }

      if (currentStep === 3) {
        await fetchFrequencies()
      }

      if (currentStep === 4 && isRegularService && bookingData.startDate && bookingData.frequency) {
          await fetchBundles();
          fetchPricing()
        } 

      // Skip steps 5 & 6 for non-regular services
      if (currentStep === 4 && !isRegularService) {
        fetchPricing()
        setCurrentStep(7) // Jump to confirmation
      } else {
        setCurrentStep((prev) => prev + 1)
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      if (currentStep === 2 && isCreatingNewUser) {
        setIsCreatingNewUser(false)
      } else if (currentStep === 7) {
        if (!bookingData.selectedSubServiceName.toLowerCase().includes("regular")) setCurrentStep(4) // Jump back from confirmation to schedule for non-regular services
        setCurrentStep((prev) => prev - 1)
      } else if (currentStep === 6) {
        setSelectedTimeSlots([])
        setCurrentStep((prev) => prev - 1)
      } else if (currentStep === 5) {
        setSelectedBundleDetail(null)
        setBookingData((prev) => ({
          ...prev,
          bundle: "",
        }))
        setBundles([])
        setCurrentStep((prev) => prev - 1)
      } else if (currentStep === 4) {
        setSelectedBundleDetail(null)
        setCurrentStep((prev) => prev - 1)
      } else {
        setCurrentStep((prev) => prev - 1)
      }
    }
  }

  const handleCancel = () => {
    if (currentStep === 1) {
      setShowCancelModal(true)
    } else {
      handlePrevious()
    }
  }

  const confirmCancel = () => {
    resetBookingData()
    setShowCancelModal(false)
    onClose()
  }

  const resetBookingData = () => {
    setBookingData(initialBookingData)
    setFinalBookingData(initialFinalBookingData)
    setCurrentStep(1)
    setSelectedUserId(null)
    setIsCreatingNewUser(false)
    setShowSummary(false)
    setBookingId(null)
    setSelectedBundleDetail(null)
    setSelectedTimeSlots([])
    setRenewalSlots([])
  }

  // Booking creation
  const handleCreateBooking = async () => {
    try {
      setIsLoading(true)

      if (bookingData.selectedSubServiceName.toLowerCase().includes("regular")) {
        // Block schedule for regular services
        const blockData = await BlockBookingAction({
          userPhone: bookingData.phoneNumber,
          no_of_cleaners: 2,
          userId: selectedUserId ?? "",
          timeslots: finalBookingData.timeslots,
          teamId: finalBookingData.teamId,
          areaId: bookingData.area,
          districtId: bookingData.district,
          propertyId: bookingData.property,
          residenceTypeId: bookingData.residenceType,
          total_amount: finalBookingData.total_amount,
          startDate: bookingData.startDate,
          endDate: finalBookingData.endDate,
          frequency: bookingData.frequency,
          userAvailableInApartment: bookingData.userPresent,
          specialInstructions: bookingData.specialInstructions,
          appartmentNumber: bookingData.apartmentNumber,
          serviceId: bookingData.subService,
          renewal_slots: finalBookingData.renewal_slots,
          status: "pending",
          payment_status: "unpaid",
        })

        setBookingId(blockData?.booking?.id)
        setShowSummary(true)
      } else if (bookingData.selectedSubServiceName.toLowerCase().includes("deep")) {
        console.log("deep", bookingData)
        const deepBooking = await DeepBookingAction({
          date: bookingData.startDate,
          recurrence_plan: "one_time",
          end_date: bookingData.startDate, // Default to same day if not provided
          user_id: selectedUserId ?? "",
          team_id: null,
          appartment_number: bookingData.apartmentNumber,
          service_id: bookingData.subService,
          area_id: bookingData.area,
          district_id: bookingData.district,
          property_id: bookingData.property,
          residence_type_id: bookingData.residenceType,
          special_instructions: bookingData.specialInstructions || "",
          status: "pending",
          payment_status: "unpaid",
          currency: 'QAR',
          user_available_in_apartment: bookingData.userPresent || false,
          
          total_amount: finalBookingData.total_amount,
          no_of_cleaners: finalBookingData.no_of_cleaners,
          cleaning_supplies: finalBookingData.cleaning_supplies,
          team_availability_ids: [], // Empty for deep cleaning/specialized services
          current_team_availability_id: null, // Not needed for these services
          is_renewed: false,
          has_renewed: false,
        })

        setBookingId(deepBooking?.booking?.id)
        toast.success("Deep Cleaning Booking created successfully!")
        window.location.reload()
      } else {
        const specialiseBooking = await SpecialisedBookingAction({
          date: bookingData.startDate ,
          end_date: bookingData.startDate ,
          recurrence_plan: 'one_time',
          user_id: selectedUserId ?? "",
          service_id: bookingData.service,
          area_id: bookingData.area,
          district_id: bookingData.district,
          property_id: bookingData.property,
          residence_type_id: bookingData.residenceType,
          special_instructions: bookingData.specialInstructions,
          user_available_in_apartment: bookingData.userPresent,
          appartment_number: bookingData.apartmentNumber,
          total_amount: calculateSpecializedTotal(),
          no_of_cleaners: finalBookingData.no_of_cleaners,
          cleaning_supply_included: true,
          currency: 'QAR',
          booking_items: bookingData.selectedSpecializedSubCategories.map((item) => ({
            sub_service_item_id: item.id,
            quantity: item.quantity,
          })),
        })

        console.log("specialise", specialiseBooking)
        // Direct booking for other services
        toast.success("Specialise Booking created successfully!")
        window.location.reload()
      }
    } catch (error: any) {
      console.error("Error creating booking:", error)
      toast.error(error.message || "Failed to create booking")
    } finally {
      setIsLoading(false)
    }
  }

  const calculateSpecializedTotal = () => {
    return bookingData.selectedSpecializedSubCategories.reduce(
      (total, item) => total + Number(item.price_per_unit) * item.quantity,
      0,
    )
  }

  const handleConfirmBooking = async () => {
    try {
      setIsLoading(true)
      await ConfirmBookingAction({
        userPhone: bookingData.phoneNumber,
        specialInstructions: bookingData.specialInstructions,
        appartmentNumber: bookingData.apartmentNumber,
        userAvailableInApartment: bookingData.userPresent,
        bookingId: bookingId as string,
      })

      toast.success("Booking confirmed successfully!")
      window.location.reload()
    } catch (error) {
      console.error("Error confirming booking:", error)
      toast.error("Failed to confirm booking")
    } finally {
      setIsLoading(false)
    }
  }

  // Validation
  const isNextButtonDisabled = () => {
    if (isLoading) return true

    switch (currentStep) {
      case 1:
        if (isCreatingNewUser) {
          return !bookingData.userName || !bookingData.phoneNumber || !bookingData.email
        }
        return !selectedUserId
      case 2:
        if (bookingData.selectedSubServiceName.toLowerCase().includes("special")) {
          return (
            !bookingData.service ||
            !bookingData.subService ||
            !bookingData.selectedSpecializedCategory ||
            bookingData.selectedSpecializedSubCategories.length === 0
          )
        }
        return !bookingData.service || !bookingData.subService
      case 3:
        return !bookingData.area || !bookingData.district || !bookingData.property || !bookingData.residenceType
      case 4:
        if (bookingData.selectedSubServiceName.toLowerCase().includes("regular")) {
          const isFrequencyRecurring = bookingData.frequency !== "one_time" && bookingData.frequency !== ""
          return !bookingData.frequency || (isFrequencyRecurring && !bookingData.duration) || !bookingData.startDate
        }
        return !bookingData.startDate
      case 5:
        return !bookingData.bundle
        // For regular services, require bundle selection
      case 6:
        const requiredSlots = frequencyNumberMapping[bookingData.frequency] || 1
        return selectedTimeSlots.length < requiredSlots
      default:
        return false
    }
  }

  // Effects
  useEffect(() => {
    if (isOpen) {
      fetchUsers()
      fetchServices()
    }
  }, [isOpen])

  useEffect(() => {
    if (bookingId) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer)
            return 0
          }
          return prevTime - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [bookingId])

  // Event handlers
  const handleUserChange = (user: User) => {
    setFinalBookingData((prev) => ({
      ...prev,
      userId: user.id,
      userPhone: `%2b${user.phone.replace(/\D/g, "")}`,
    }))

    // Auto-fill location data if available
    if (user.area) {
      setBookingData((prev) => ({ ...prev, area: user.area ?? "" }))
      fetchDistricts(user.area)
    }
    if (user.districtId) {
      setBookingData((prev) => ({ ...prev, district: user.districtId ?? "" }))
      fetchProperties(user.districtId)
    }
    if (user.propertyId) {
      setBookingData((prev) => ({ ...prev, property: user.propertyId ?? "" }))
      fetchResidenceTypes()
    }
    if (user.residenceTypeId) {
      setBookingData((prev) => ({ ...prev, residenceType: user.residenceTypeId ?? "" }))
    }
    if (user.apartment_number) {
      setBookingData((prev) => ({ ...prev, apartmentNumber: user.apartment_number ?? "" }))
    }
  }

  const handleBundleSelect = (bundleId: string, bundleDetail: any, teamId: string) => {
    setSelectedBundleDetail(bundleDetail)
    setSelectedTeamId(teamId)
    setFinalBookingData((prev) => ({
      ...prev,
      teamId: teamId,
    }))
  }

  if (!isOpen) return null

  const isRegularService = bookingData.selectedSubServiceName.toLowerCase().includes("regular")

  return (
    <>
      <div className="fixed inset-0 bg-gray-500/40 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl z-50 w-full max-w-3xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Book a Service</h2>
              <button onClick={handleCancel} className="text-white hover:text-gray-200 transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            {!showSummary && (
              <div className="mt-3 flex items-center">
                {Array.from({ length: totalSteps }).map((_, index) => {
                  // Skip steps 5 & 6 visually for non-regular services
                  if (!isRegularService && (index === 4 || index === 5)) {
                    return (
                      <React.Fragment key={index}>
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium border-2 bg-gray-400 text-white border-gray-400 opacity-50">
                          {index + 1}
                        </div>
                        {index < totalSteps - 1 && <div className="h-1 flex-1 mx-1 bg-gray-400 opacity-50" />}
                      </React.Fragment>
                    )
                  }

                  return (
                    <React.Fragment key={index}>
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium border-2 ${
                          index + 1 === currentStep
                            ? "bg-white text-blue-700 border-white"
                            : index + 1 < currentStep
                              ? "bg-green-400 text-white border-white"
                              : "bg-blue-500 text-white border-white border-opacity-50"
                        }`}
                      >
                        {index + 1 < currentStep ? "✓" : index + 1}
                      </div>
                      {index < totalSteps - 1 && (
                        <div
                          className={`h-1 flex-1 mx-1 ${
                            index + 1 < currentStep ? "bg-green-400" : "bg-blue-500 bg-opacity-50"
                          }`}
                        />
                      )}
                    </React.Fragment>
                  )
                })}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {showSummary ? (
              <BookingSummary
                bookingData={bookingData}
                finalBookingData={finalBookingData}
                users={users}
                services={services}
                subServices={subServices}
                areas={areas}
                districts={districts}
                properties={properties}
                residenceTypes={residenceTypes}
                selectedBundleDetail={selectedBundleDetail}
                timeLeft={timeLeft}
                onConfirm={handleConfirmBooking}
                isLoading={isLoading}
              />
            ) : (
              <>
                {currentStep === 1 && (
                  <CustomerSelection
                    users={users}
                    selectedUserId={selectedUserId}
                    setSelectedUserId={setSelectedUserId}
                    bookingData={bookingData}
                    setBookingData={setBookingData}
                    isCreatingNewUser={isCreatingNewUser}
                    setIsCreatingNewUser={setIsCreatingNewUser}
                    query={query}
                    setQuery={setQuery}
                    onUserChange={handleUserChange}
                  />
                )}

                {currentStep === 2 && (
                  <ServiceSelection
                    bookingData={bookingData}
                    setBookingData={setBookingData}
                    services={services}
                    subServices={subServices}
                    specialServices={specialServices}
                    specializedSubCategories={specializedSubCategories}
                    onServiceChange={fetchSubServices}
                    onSubServiceChange={(subServiceId, subServiceName) => {
                      setBookingData((prev) => ({
                        ...prev,
                        subService: subServiceId,
                        selectedSubServiceName: subServiceName,
                      }))
                      fetchSpecialServices(subServiceId)
                    }}
                    onSpecialServiceChange={fetchSpecialServices}
                    onSpecializedSubCategoryChange={(categoryId, categoryName) => {
                      setBookingData((prev) => ({
                        ...prev,
                        selectedSpecializedCategory: categoryId,
                        selectedSpecializedCategoryName: categoryName,
                      }))
                      fetchSpecializedSubCategories(categoryName)
                    }}
                  />
                )}

                {currentStep === 3 && (
                  <LocationDetails
                    bookingData={bookingData}
                    setBookingData={setBookingData}
                    areas={areas}
                    districts={districts}
                    properties={properties}
                    residenceTypes={residenceTypes}
                    onAreaChange={fetchDistricts}
                    onDistrictChange={fetchProperties}
                    onPropertyChange={fetchResidenceTypes}
                  />
                )}

                {currentStep === 4 && (
                  <ScheduleDetails
                    bookingData={bookingData}
                    setBookingData={setBookingData}
                    frequencies={frequencies}
                    calendar={calendar}
                    isLoading={isLoading}
                  />
                )}

                {currentStep === 5 && isRegularService && (
                  <BundleSelection
                    bookingData={bookingData}
                    setBookingData={setBookingData}
                    bundles={bundles}
                    selectedBundleDetail={selectedBundleDetail}
                    setSelectedBundleDetail={setSelectedBundleDetail}
                    onBundleSelect={handleBundleSelect}
                    isLoading={isLoading}
                  />
                )}

                {currentStep === 6 && isRegularService && (
                  <TimeSlotSelection
                    bookingData={bookingData}
                    setBookingData={setBookingData}
                    selectedBundleDetail={selectedBundleDetail}
                    selectedTimeSlots={selectedTimeSlots}
                    setSelectedTimeSlots={setSelectedTimeSlots}
                    renewalSlots={renewalSlots}
                    setRenewalSlots={setRenewalSlots}
                    onTimeSlotSelect={handleTimeSlotSelect}
                    frequencyNumberMapping={frequencyNumberMapping}
                  />
                )}

                {currentStep === 7 && (

                  <BookingConfirmation
                    bookingData={bookingData}
                    finalBookingData={finalBookingData}
                    users={users}
                    services={services}
                    subServices={subServices}
                    areas={areas}
                    districts={districts}
                    properties={properties}
                    residenceTypes={residenceTypes}
                    selectedBundleDetail={selectedBundleDetail}
                    selectedTimeSlots={selectedTimeSlots}
                    frequencies={frequencies}
                    onConfirm={handleCreateBooking}
                    isLoading={isLoading}
                  />
                )}
              </>
            )}
          </div>

          {/* Footer */}
          {!showSummary && (
            <div className="p-4 border-t bg-gray-50 flex justify-between">
              <button onClick={handleCancel} className="px-4 py-2 text-gray-600 hover:text-gray-800 transition">
                {currentStep === 1 ? "Cancel" : "Back"}
              </button>

              {currentStep !== totalSteps ? (
                <button
                  onClick={handleNext}
                  disabled={isNextButtonDisabled()}
                  className={`px-6 py-2 flex items-center gap-2 bg-blue-600 text-white rounded-lg transition ${
                    isNextButtonDisabled() ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
                  }`}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Next"
                  )}
                </button>
                ) : isRegularService ? (
                <button
                  onClick={handleCreateBooking}
                  disabled={isLoading}
                  className={`bg-green-600 text-white px-6 py-2 flex items-center gap-2 rounded-lg transition ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Blocking Schedule...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Block Schedule
                    </>
                  )}
                </button>
                ) : (
                <button
                  onClick={handleCreateBooking}
                  disabled={isLoading}
                  className={`bg-green-600 text-white px-6 py-2 flex items-center gap-2 rounded-lg transition ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creating Booking...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Confirm & Create Booking
                    </>
                  )}
                </button>
                )}
            </div>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Cancel Booking?</h3>
            <p className="text-gray-600 mb-5">
              Are you sure you want to cancel your booking? All your information will be lost.
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                No, Continue
              </button>
              <button
                onClick={confirmCancel}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
