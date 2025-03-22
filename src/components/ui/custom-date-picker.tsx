/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface CustomDatePickerProps {
  startDate: Date | null;
  setStartDate: (date: Date | null) => void;
  minDate: Date;
  maxDate: Date;
  unavailableDates: Date[];
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  startDate,
  setStartDate,
  minDate,
  maxDate,
  unavailableDates,
}) => {
  // Function to check if a date is unavailable
  const isDateUnavailable = (date: Date) => {
    return unavailableDates.some(
      (unavailableDate) =>
        date.toDateString() === unavailableDate.toDateString()
    );
  };

  // Function to check if a date is outside the min/max range
  const isDateOutOfRange = (date: Date) => {
    return date < minDate || date > maxDate;
  };

  // Custom day class name to style dates
  const dayClassName = (date: Date) => {
    if (isDateOutOfRange(date)) {
      return "bg-gray-400 text-white cursor-not-allowed"; // Gray for out-of-range dates
    }
    if (isDateUnavailable(date)) {
      return "bg-red-500 text-white cursor-not-allowed"; // Red for unavailable dates
    }
    return "bg-green-500 text-white"; // Green for available dates
  };

  return (
    <DatePicker
      selected={startDate}
      onChange={(date) => setStartDate(date)}
      minDate={minDate}
      maxDate={maxDate}
      inline // Show the calendar inline
      dayClassName={dayClassName} // Apply custom class names to days
      filterDate={(date: any) => !isDateUnavailable(date)} // Disable unavailable dates
    />
  );
};

export default CustomDatePicker;
