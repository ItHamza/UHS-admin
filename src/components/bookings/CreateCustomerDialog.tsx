import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { UserCreateAction } from "@/actions/users";
import DistrictAction from "@/actions/district";
import { PropertyAction } from "@/actions/property";
import ResidenceAction from "@/actions/residence";

interface Area {
  id: string;
  name: string;
}

interface District {
  id: string;
  name: string;
}

interface Property {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface ResidenceType {
  id: string;
  type: string;
}

interface BookingData {
  userName: string;
  phoneNumber: string;
  email: string;
  apartmentNumber: string;
  area: string;
  district: string;
  property: string;
  residenceType: string;
}

interface ErrorState {
  userName?: string;
  phoneNumber?: string;
  email?: string;
  apartmentNumber?: string;
  area?: string;
  district?: string;
  property?: string;
  residenceType?: string;
}

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  areas: Area[];
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  isOpen,
  onClose,
  areas,
}) => {
  const [bookingData, setBookingData] = useState<BookingData>({
    userName: "",
    phoneNumber: "",
    email: "",
    apartmentNumber: "",
    area: "",
    district: "",
    property: "",
    residenceType: "",
  });

  const [districts, setDistricts] = useState<District[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [residenceTypes, setResidenceTypes] = useState<ResidenceType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<ErrorState>({});

  const validateForm = (): boolean => {
    const newErrors: ErrorState = {};

    if (!bookingData.userName.trim()) {
      newErrors.userName = "Full Name is required";
    }

    const phoneRegex = /^\+\d{1,3}\d{6,14}$/;
    if (!bookingData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone Number is required";
    } else if (!phoneRegex.test(bookingData.phoneNumber)) {
      newErrors.phoneNumber = "Invalid phone number format. Use +971XXXXXXXXX";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!bookingData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(bookingData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!bookingData.apartmentNumber.trim()) {
      newErrors.apartmentNumber = "Apartment Number is required";
    }

    if (!bookingData.area) {
      newErrors.area = "Area is required";
    }

    if (bookingData.area && !bookingData.district) {
      newErrors.district = "District is required";
    }

    if (bookingData.district && !bookingData.property) {
      newErrors.property = "Property is required";
    }

    if (bookingData.property && !bookingData.residenceType) {
      newErrors.residenceType = "Residence Type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchDistrict = async (areaId: string): Promise<void> => {
    try {
      const fetchedDistricts = await DistrictAction(areaId);
      setDistricts(fetchedDistricts);
      setProperties([]);
      setResidenceTypes([]);
    } catch (error) {
      toast.error("Failed to fetch districts");
    }
  };

  const fetchProperty = async (districtId: string): Promise<void> => {
    try {
      const fetchedProperties = await PropertyAction(districtId);
      setProperties(fetchedProperties);
      setResidenceTypes([]);
    } catch (error) {
      toast.error("Failed to fetch properties");
    }
  };

  const fetchResidenceTypes = async (): Promise<void> => {
    try {
      const fetchedResidenceTypes = await ResidenceAction();
      setResidenceTypes(fetchedResidenceTypes);
    } catch (error) {
      toast.error("Failed to fetch residence types");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setBookingData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof ErrorState]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const createNewUser = async (): Promise<void> => {
    if (!validateForm()) {
      toast.error("Please correct the form errors");
      return;
    }

    try {
      setIsLoading(true);
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
      });

      toast.success("Customer added successfully");
      onClose();
      window.location.reload();
    } catch (error) {
      toast.error("Failed to create customer");
      console.error("Error creating user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setBookingData({
        userName: "",
        phoneNumber: "",
        email: "",
        apartmentNumber: "",
        area: "",
        district: "",
        property: "",
        residenceType: "",
      });
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-gray-800/40 bg-opacity-50'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto'>
        <div className='flex justify-between items-center p-4 border-b'>
          <h2 className='text-xl font-semibold text-gray-900'>
            Add New Customer
          </h2>
          <button
            onClick={onClose}
            className='text-gray-600 hover:text-gray-900'>
            <X size={24} />
          </button>
        </div>

        <div className='p-4 space-y-4'>
          <div className='space-y-2'>
            <label className='block font-medium text-gray-700'>Full Name</label>
            <input
              type='text'
              name='userName'
              value={bookingData.userName}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg transition ${
                errors.userName
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              placeholder='John Doe'
              required
            />
            {errors.userName && (
              <p className='text-red-500 text-sm mt-1'>{errors.userName}</p>
            )}
          </div>

          <div className='space-y-2'>
            <label className='block font-medium text-gray-700'>
              Phone Number{" "}
              <span className='text-[12px]'>(with country code)</span>
            </label>
            <input
              type='tel'
              name='phoneNumber'
              value={bookingData.phoneNumber}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg transition ${
                errors.phoneNumber
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              placeholder='971501234567'
              required
            />
            {errors.phoneNumber && (
              <p className='text-red-500 text-sm mt-1'>{errors.phoneNumber}</p>
            )}
          </div>

          <div className='space-y-2'>
            <label className='block font-medium text-gray-700'>Email</label>
            <input
              type='email'
              name='email'
              value={bookingData.email}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg transition ${
                errors.email
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              placeholder='john@example.com'
              required
            />
            {errors.email && (
              <p className='text-red-500 text-sm mt-1'>{errors.email}</p>
            )}
          </div>

          <div className='space-y-2'>
            <label className='block font-medium text-gray-700'>
              Apartment Number
            </label>
            <input
              type='text'
              name='apartmentNumber'
              value={bookingData.apartmentNumber}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg transition ${
                errors.apartmentNumber
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              placeholder='e.g., 101, Villa 2A'
              required
            />
            {errors.apartmentNumber && (
              <p className='text-red-500 text-sm mt-1'>
                {errors.apartmentNumber}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <label className='block font-medium text-gray-700'>
              Select Area
            </label>
            <select
              name='area'
              value={bookingData.area}
              onChange={(e) => {
                handleChange(e);
                fetchDistrict(e.target.value);
                setBookingData((prev) => ({
                  ...prev,
                  district: "",
                  property: "",
                  residenceType: "",
                }));
              }}
              className={`w-full p-3 border rounded-lg transition ${
                errors.area
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              required>
              <option value=''>Select an area</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
            {errors.area && (
              <p className='text-red-500 text-sm mt-1'>{errors.area}</p>
            )}
          </div>

          {bookingData.area && (
            <div className='space-y-2'>
              <label className='block font-medium text-gray-700'>
                Select District
              </label>
              <select
                name='district'
                value={bookingData.district}
                onChange={(e) => {
                  handleChange(e);
                  fetchProperty(e.target.value);
                  setBookingData((prev) => ({
                    ...prev,
                    property: "",
                    residenceType: "",
                  }));
                }}
                className={`w-full p-3 border rounded-lg transition ${
                  errors.district
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                required>
                <option value=''>Select a district</option>
                {districts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>
              {errors.district && (
                <p className='text-red-500 text-sm mt-1'>{errors.district}</p>
              )}
            </div>
          )}

          {bookingData.district && (
            <div className='space-y-2'>
              <label className='block font-medium text-gray-700'>
                Select Property
              </label>
              <select
                name='property'
                value={bookingData.property}
                onChange={(e) => {
                  handleChange(e);
                  fetchResidenceTypes();
                  setBookingData((prev) => ({
                    ...prev,
                    residenceType: "",
                  }));
                }}
                className={`w-full p-3 border rounded-lg transition ${
                  errors.property
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                required>
                <option value=''>Select a property</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
              {errors.property && (
                <p className='text-red-500 text-sm mt-1'>{errors.property}</p>
              )}
            </div>
          )}

          {bookingData.property && (
            <div className='space-y-2'>
              <label className='block font-medium text-gray-700'>
                Select Residence Type
              </label>
              <select
                name='residenceType'
                value={bookingData.residenceType}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg transition ${
                  errors.residenceType
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                required>
                <option value=''>Select residence type</option>
                {residenceTypes.map((residence) => (
                  <option key={residence.id} value={residence.id}>
                    {residence.type}
                  </option>
                ))}
              </select>
              {errors.residenceType && (
                <p className='text-red-500 text-sm mt-1'>
                  {errors.residenceType}
                </p>
              )}
            </div>
          )}

          <div className='pt-4'>
            <button
              onClick={createNewUser}
              disabled={isLoading}
              className='w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed'>
              {isLoading ? "Creating..." : "Add Customer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCustomerModal;
