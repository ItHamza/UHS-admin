import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { UserUpdateDetailAction } from "@/actions/users";
import DistrictAction from "@/actions/district";
import { PropertyAction } from "@/actions/property";
import ResidenceAction from "@/actions/residence";
import AreaAction from "@/actions/area";


interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  type: "residential" | "commercial";
  services: string[];
  totalBookings: number;
  lastServiceDate: string;
  totalSpent: number;
  notes: string;
  status: "Active" | "Inactive";
  joinDate: string;
  residence_type: any;
  [key: string]: any;
}

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

interface formData {
  id: string;
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

interface EditCustomerModalProps {
  customer: Customer | null
  isOpen: boolean;
  onClose: () => void;
}

const EditCustomerModal: React.FC<EditCustomerModalProps> = ({
  customer,
  isOpen,
  onClose,
}) => {
  const [formData, setformData] = useState<formData>({
    id: "",
    userName: "",
    phoneNumber: "",
    email: "",
    apartmentNumber: "",
    area: "",
    district: "",
    property: "",
    residenceType: "",
  });

  const [areas, setAreas] = useState<Area[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [residenceTypes, setResidenceTypes] = useState<ResidenceType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<ErrorState>({});

  const validateForm = (): boolean => {
    const newErrors: ErrorState = {};

    if (!formData.userName.trim()) {
      newErrors.userName = "Full Name is required";
    }

    const phoneRegex = /^\+\d{1,3}\d{6,14}$/;
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone Number is required";
    } else if (!phoneRegex.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Invalid phone number format. Use +971XXXXXXXXX";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.apartmentNumber.trim()) {
      newErrors.apartmentNumber = "Apartment Number is required";
    }

    if (!formData.area) {
      newErrors.area = "Area is required";
    }

    if (formData.area && !formData.district) {
      newErrors.district = "District is required";
    }

    if (formData.district && !formData.property) {
      newErrors.property = "Property is required";
    }

    if (formData.property && !formData.residenceType) {
      newErrors.residenceType = "Residence Type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchDistrict = async (areaId: string): Promise<void> => {
    try {
      debugger;
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
    setformData((prev) => ({
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

  const handleSaveCustomer = async (): Promise<void> => {
    if (!validateForm()) {
      toast.error("Please correct the form errors");
      return;
    }

    try {
      setIsLoading(true);
      const newUser = await UserUpdateDetailAction({
        id: formData.id,
        name: formData.userName,
        phone: formData.phoneNumber,
        email: formData.email,
        is_active: true,
        is_blocked: false,
        role: "user",
        area: formData.area,
        property: formData.property,
        district: formData.district,
        residenceType: formData.residenceType,
        districtId: formData.district,
        propertyId: formData.property,
        residenceTypeId: formData.residenceType,
        apartment_number: formData.apartmentNumber,
      });

      toast.success("Customer updated successfully");
      onClose();
      window.location.reload();
    } catch (error) {
      toast.error("Failed to update customer");
      console.error("Error updating user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchArea = async () => {
    try {
      const area = await AreaAction();
      setAreas(area);
    } catch (error: any) {
      console.log("error", error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (customer) {
      fetchArea();

      const [area, district, property] = customer.address.split(',');

      setformData({
        id: customer.base_id,
        userName: customer.name || "",
        phoneNumber: customer.phone || "",
        email: customer.email || "",
        apartmentNumber: customer.apartmentNumber || "",
        area: area?.trim() || "",
        district: district?.trim() || "",
        property: property?.trim() || "",
        residenceType: customer.residenceType || "",
      });
      
    }
  }, [customer]);

  useEffect(() => {
    if (formData.area) {
      fetchDistrict(formData.area);
    }
  }, [formData.area]);

  useEffect(() => {
    if (formData.district) {
      fetchProperty(formData.district);
    }
  }, [formData.district]);

  useEffect(() => {
    if (formData.property) {
      console.log(formData)
      console.log(customer)
      fetchResidenceTypes();
    }
  }, [formData.property]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-gray-800/40 bg-opacity-50'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto'>
        <div className='flex justify-between items-center p-4 border-b'>
          <h2 className='text-xl font-semibold text-gray-900'>
            Edit Customer
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
              value={formData.userName}
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
              value={formData.phoneNumber}
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
              value={formData.email}
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
              value={formData.apartmentNumber}
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
              value={formData.area}
              onChange={(e) => {
                handleChange(e);
                fetchDistrict(e.target.value);
                setformData((prev) => ({
                  ...prev,
                  district: "",
                  property: "",
                  
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

          {formData.area && (
            <div className='space-y-2'>
              <label className='block font-medium text-gray-700'>
                Select District
              </label>
              <select
                name='district'
                value={formData.district}
                onChange={(e) => {
                  handleChange(e);
                  fetchProperty(e.target.value);
                  setformData((prev) => ({
                    ...prev,
                    property: "",
                    
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

          {formData.district && (
            <div className='space-y-2'>
              <label className='block font-medium text-gray-700'>
                Select Property
              </label>
              <select
                name='property'
                value={formData.property}
                onChange={(e) => {
                  handleChange(e);
                  fetchResidenceTypes();
                  setformData((prev) => ({
                    ...prev,
                    
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

          {formData.property && (
            <div className='space-y-2'>
              <label className='block font-medium text-gray-700'>
                Select Residence Type
              </label>
              <select
                name='residenceType'
                value={formData.residenceType}
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
              onClick={handleSaveCustomer}
              disabled={isLoading}
              className='w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed'>
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCustomerModal;
