import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { X, Loader2 } from "lucide-react";
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
  address: string; // "areaId, districtId, propertyId" OR names (you prefer this parsing path)
  user_number?: string;
  apartmentNumber?: string;
  area?: string;
  district?: string;
  property?: string;
  residenceType?: string;
  building_name?: string;
  building_number?: string;
  street_no?: string;
  zone?: string;
  [key: string]: any;
}
interface Area { id: string; name: string }
interface District { id: string; name: string }
interface Property { id: string; name: string }
interface ResidenceType { id: string; type: string }

interface FormData {
  id: string;
  user_number: string;
  userName: string;
  phoneNumber: string;
  email: string;
  apartmentNumber: string;
  area: string;
  district: string;
  property: string;
  residenceType: string;
  building_name: string;
  building_number: string;
  street_no: string;
  zone: string;
}
interface ErrorState {
  user_number?: string;
  userName?: string;
  phoneNumber?: string;
  email?: string;
  apartmentNumber?: string;
  area?: string;
  district?: string;
  property?: string;
  residenceType?: string;
  building_name?: string;
  building_number?: string;
  street_no?: string;
  zone?: string;
}

interface EditCustomerModalProps {
  customer: Customer | null
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

/** === Memoized field components (focus-safe) === */
type SelectOpt = { id: string; name: string };

const FieldError = ({ msg }: { msg?: string }) =>
  msg ? <p className="text-red-600 text-sm mt-1" role="alert">{msg}</p> : null;

const Label = ({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) => (
  <label htmlFor={htmlFor} className="block font-medium text-gray-800">{children}</label>
);

const MemoInput = React.memo(function Input({
  id, name, type = "text", value, onChange, placeholder, error, required, inputMode,
}: {
  id: string;
  name: keyof FormData;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <div>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        inputMode={inputMode}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        className={`w-full p-3 border rounded-lg transition ${
          error ? "border-red-500" : "border-gray-300 hover:border-gray-400"
        }`}
        placeholder={placeholder}
        required={required}
      />
      <FieldError msg={error} />
    </div>
  );
});

const MemoSelect = React.memo(function Select({
  name, value, onChange, options, loading, placeholder, error, required,
}: {
  name: keyof FormData;
  value: string;
  onChange: (v: string) => void;
  options: SelectOpt[];
  loading?: boolean;
  placeholder: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <div>
      <div className="relative">
        <select
          id={name}
          name={name}
          aria-invalid={!!error}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={loading}
          className={`w-full p-3 border rounded-lg bg-white pr-10 ${
            error ? "border-red-500" : "border-gray-300 hover:border-gray-400"
          } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
          required={required}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={String(o.id)} value={String(o.id)}>
              {o.name}
            </option>
          ))}
        </select>
        {loading && (
          <div className="absolute inset-y-0 right-3 flex items-center" aria-hidden>
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
      </div>
      <FieldError msg={error} />
    </div>
  );
});

/** === Component === */
export default function EditCustomerModal({ customer, isOpen, onClose, onSaved }: EditCustomerModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const isHydratingRef = useRef(false);

  // focus only when opening
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    // focus first input just once on open
    const first = modalRef.current?.querySelector<HTMLInputElement | HTMLSelectElement>("input, select");
    first?.focus();
  }, [isOpen]);

  const [formData, setFormData] = useState<FormData>({
    id: "",
    user_number: "",
    userName: "",
    phoneNumber: "",
    email: "",
    apartmentNumber: "",
    area: "",
    district: "",
    property: "",
    residenceType: "",
    building_name: "",
    building_number: "",
    street_no: "",
    zone: "",
  });

  const [errors, setErrors] = useState<ErrorState>({});
  const [isSaving, setIsSaving] = useState(false);

  const [areas, setAreas] = useState<Area[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [residenceTypes, setResidenceTypes] = useState<ResidenceType[]>([]);

  const [loadingAreas, setLoadingAreas] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [loadingResidenceTypes, setLoadingResidenceTypes] = useState(false);

  const isPropertyOthers = useMemo(() => {
    const prop = properties.find((p) => String(p.id) === String(formData.property));
    return prop?.name === "Others";
  }, [properties, formData.property]);

  const setField = useCallback((name: keyof ErrorState, value: string) => {
    setFormData((prev) => (prev[name] === value ? prev : { ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, [errors]);

  const validate = useCallback((): boolean => {
    const newErrors: ErrorState = {};
    if (!formData.userName.trim()) newErrors.userName = "Full name is required";
    if (!formData.user_number.trim()) newErrors.user_number = "Customer code is required";

    const phoneRegex = /^\+\d{7,15}$/;
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
    else if (!phoneRegex.test(formData.phoneNumber)) newErrors.phoneNumber = "Invalid number. Use +974501234567";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email format";

    if (!formData.apartmentNumber.trim()) newErrors.apartmentNumber = "Apartment/Villa is required";
    if (!formData.area) newErrors.area = "Area is required";
    if (formData.area && !formData.district) newErrors.district = "District is required";
    if (formData.district && !formData.property) newErrors.property = "Property is required";
    if (formData.property && !formData.residenceType) newErrors.residenceType = "Residence type is required";

    if (isPropertyOthers) {
      if (!formData.building_name.trim()) newErrors.building_name = "Building name is required";
      if (!formData.building_number.trim()) newErrors.building_number = "Building number is required";
      if (!formData.street_no.trim()) newErrors.street_no = "Street number is required";
      if (!formData.zone.trim()) newErrors.zone = "Zone number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, isPropertyOthers]);

  /** Prefill (address logic kept) */
  const prefillFromCustomer = useCallback(async (c: Customer) => {
    isHydratingRef.current = true;
    try {
      // derive from explicit ids or address CSV
      const [addrArea, addrDistrict, addrProperty] = (c.address || "")
        .split(",")
        .map((s) => s?.trim() || "");

      // set base fields once
      setFormData((prev) => ({
        ...prev,
        id: c.id,
        user_number: c.user_number || "",
        userName: c.name || "",
        phoneNumber: c.phone || "",
        email: c.email || "",
        apartmentNumber: c.apartmentNumber || "",
        area: c.area || addrArea || "",
        district: c.district || addrDistrict || "",
        property: c.property || addrProperty || "",
        residenceType: c.residenceType || "",
        building_name: c.building_name || "",
        building_number: c.building_number || "",
        street_no: c.street_no || "",
        zone: c.zone || "",
      }));

      setLoadingAreas(true);
      const a = await AreaAction();
      setAreas(a || []);
      setLoadingAreas(false);

      if (c.area || addrArea) {
        setLoadingDistricts(true);
        const d = await DistrictAction(c.area || addrArea);
        setDistricts(d || []);
        setLoadingDistricts(false);
      }

      if (c.district || addrDistrict) {
        setLoadingProperties(true);
        const p = await PropertyAction(c.district || addrDistrict);
        setProperties(p || []);
        setLoadingProperties(false);
      }

      if (c.property || addrProperty) {
        setLoadingResidenceTypes(true);
        const r = await ResidenceAction();
        setResidenceTypes(r || []);
        setLoadingResidenceTypes(false);
      }
    } catch (e) {
      toast.error("Failed to prefill customer data");
    } finally {
      isHydratingRef.current = false;
    }
  }, []);

  // on open
  useEffect(() => {
    if (!isOpen || !customer) return;
    prefillFromCustomer(customer);
  }, [isOpen, customer, prefillFromCustomer]);

  // lazy-load areas if needed (no race with prefill)
  useEffect(() => {
    if (!isOpen) return;
    if (areas.length > 0) return;
    if (isHydratingRef.current) return;
    let mounted = true;
    (async () => {
      try {
        setLoadingAreas(true);
        const res = await AreaAction();
        if (mounted) setAreas(res || []);
      } catch (e: any) {
        toast.error(e?.message || "Failed to load areas");
      } finally {
        setLoadingAreas(false);
      }
    })();
    return () => { mounted = false; };
  }, [isOpen, areas.length]);

  /** dependent fetches – ONLY fetch*/
  useEffect(() => {
    const areaId = formData.area?.trim();
    if (!areaId) { setDistricts([]); setProperties([]); setResidenceTypes([]); return; }
    let alive = true;
    (async () => {
      try {
        setLoadingDistricts(true);
        const d = await DistrictAction(areaId);
        if (alive) setDistricts(d || []);
      } catch {
        toast.error("Failed to fetch districts");
      } finally {
        if (alive) setLoadingDistricts(false);
      }
    })();
    return () => { alive = false; };
  }, [formData.area]);

  useEffect(() => {
    const districtId = formData.district?.trim();
    if (!districtId) { setProperties([]); setResidenceTypes([]); return; }
    let alive = true;
    (async () => {
      try {
        setLoadingProperties(true);
        const p = await PropertyAction(districtId);
        if (alive) setProperties(p || []);
      } catch {
        toast.error("Failed to fetch properties");
      } finally {
        if (alive) setLoadingProperties(false);
      }
    })();
    return () => { alive = false; };
  }, [formData.district]);

  useEffect(() => {
    const propId = formData.property?.trim();
    if (!propId) { setResidenceTypes([]); return; }
    let alive = true;
    (async () => {
      try {
        setLoadingResidenceTypes(true);
        const r = await ResidenceAction();
        if (alive) setResidenceTypes(r || []);
      } catch {
        toast.error("Failed to fetch residence types");
      } finally {
        if (alive) setLoadingResidenceTypes(false);
      }
    })();
    return () => { alive = false; };
  }, [formData.property]);

  const residenceTypeOptions = useMemo<SelectOpt[]>(
    () => (residenceTypes || []).map((r) => ({ id: String(r.id), name: r.type })),
    [residenceTypes]
  );

  /** submit */
  const onSave = useCallback(async () => {
    if (!validate()) { toast.error("Please correct the form errors"); return; }
    try {
      setIsSaving(true);
      await UserUpdateDetailAction({
        id: formData.id,
        user_number: formData.user_number,
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
        building_name: isPropertyOthers ? formData.building_name : undefined,
        building_number: isPropertyOthers ? formData.building_number : undefined,
        street_no: isPropertyOthers ? formData.street_no : undefined,
        zone: isPropertyOthers ? formData.zone : undefined,
      });
      toast.success("Customer updated successfully");
      onSaved?.();
      onClose();
    } catch (e) {
      console.error("Error updating user", e);
      toast.error("Failed to update customer");
    } finally {
      setIsSaving(false);
    }
  }, [formData, isPropertyOthers, onClose, onSaved, validate]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-customer-title"
      // onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div ref={modalRef} className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto focus:outline-none">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 id="edit-customer-title" className="text-xl font-semibold text-gray-900">Edit Customer</h2>
          <button onClick={onClose} aria-label="Close" className="text-gray-600 hover:text-gray-900 p-1 rounded-lg focus:ring">
            <X size={22} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <Label htmlFor="user_number">Customer Code</Label>
            <MemoInput id="user_number" name="user_number" value={formData.user_number} onChange={(v) => setField("user_number", v)} placeholder="ABC 12" error={errors.user_number} required />
          </div>

          <div>
            <Label htmlFor="userName">Full Name</Label>
            <MemoInput id="userName" name="userName" value={formData.userName} onChange={(v) => setField("userName", v)} placeholder="John Doe" error={errors.userName} required />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <span className="text-xs text-gray-500">Use country code (e.g. +971501234567)</span>
            </div>
            <MemoInput id="phoneNumber" name="phoneNumber" type="tel" inputMode="tel" value={formData.phoneNumber} onChange={(v) => setField("phoneNumber", v)} placeholder="+971501234567" error={errors.phoneNumber} required />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <MemoInput id="email" name="email" type="email" value={formData.email} onChange={(v) => setField("email", v)} placeholder="john@example.com" error={errors.email} required />
          </div>

          <div>
            <Label htmlFor="apartmentNumber">Apartment / Villa</Label>
            <MemoInput id="apartmentNumber" name="apartmentNumber" value={formData.apartmentNumber} onChange={(v) => setField("apartmentNumber", v)} placeholder="e.g., 101, Villa 2A" error={errors.apartmentNumber} required />
          </div>

          <div>
            <Label htmlFor="area">Select Area</Label>
            <MemoSelect
              name="area"
              value={formData.area}
              onChange={(v) => {
                if (v === formData.area) return;
                setField("area", v);
                // clear children ONLY on user change
                setFormData((prev) => ({ ...prev, district: "", property: "", residenceType: "" }));
              }}
              options={areas}
              loading={loadingAreas}
              placeholder={loadingAreas ? "Loading areas..." : "Select an area"}
              error={errors.area}
              required
            />
          </div>

          {formData.area && (
            <div>
              <Label htmlFor="district">Select District</Label>
              <MemoSelect
                name="district"
                value={formData.district}
                onChange={(v) => {
                  if (v === formData.district) return;
                  setField("district", v);
                  setFormData((prev) => ({ ...prev, property: "", residenceType: "" }));
                }}
                options={districts}
                loading={loadingDistricts}
                placeholder={loadingDistricts ? "Loading districts..." : "Select a district"}
                error={errors.district}
                required
              />
            </div>
          )}

          {formData.district && (
            <div>
              <Label htmlFor="property">Select Property</Label>
              <MemoSelect
                name="property"
                value={formData.property}
                onChange={(v) => {
                  if (v === formData.property) return;
                  setField("property", v);
                  setFormData((prev) => ({ ...prev, residenceType: "" }));
                }}
                options={properties}
                loading={loadingProperties}
                placeholder={loadingProperties ? "Loading properties..." : "Select a property"}
                error={errors.property}
                required
              />
            </div>
          )}

          {formData.property && (
            <div>
              <Label htmlFor="residenceType">Select Residence Type</Label>
              <MemoSelect
                name="residenceType"
                value={formData.residenceType}
                onChange={(v) => setField("residenceType", v)}
                options={residenceTypeOptions}
                loading={loadingResidenceTypes}
                placeholder={loadingResidenceTypes ? "Loading types..." : "Select residence type"}
                error={errors.residenceType}
                required
              />
            </div>
          )}

          {isPropertyOthers && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="building_name">Building Name</Label>
                <MemoInput id="building_name" name="building_name" value={formData.building_name} onChange={(v) => setField("building_name", v)} placeholder="e.g., Al Noor Tower" error={errors.building_name} required />
              </div>
              <div>
                <Label htmlFor="building_number">Building Number</Label>
                <MemoInput id="building_number" name="building_number" value={formData.building_number} onChange={(v) => setField("building_number", v)} placeholder="e.g., 12" error={errors.building_number} required inputMode="numeric" />
              </div>
              <div>
                <Label htmlFor="street_no">Street Number</Label>
                <MemoInput id="street_no" name="street_no" value={formData.street_no} onChange={(v) => setField("street_no", v)} placeholder="e.g., 230" error={errors.street_no} required inputMode="numeric" />
              </div>
              <div>
                <Label htmlFor="zone">Zone Number</Label>
                <MemoInput id="zone" name="zone" value={formData.zone} onChange={(v) => setField("zone", v)} placeholder="e.g., 67" error={errors.zone} required inputMode="numeric" />
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={onSave}
              disabled={isSaving || loadingAreas || loadingDistricts || loadingProperties || loadingResidenceTypes}
              className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
