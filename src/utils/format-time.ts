export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(":");
  const parsedHours = parseInt(hours, 10);
  const suffix = parsedHours >= 12 ? "PM" : "AM";
  const formattedHours = parsedHours % 12 || 12;
  return `${formattedHours}:${minutes} ${suffix}`;
};

export function formatTimeTo24Hrs(timeString: string): string {
  // Split the time string into components
  const [time, modifier] = timeString.split(" ");
  let [hours, minutes] = time.split(":");

  // Convert hours to a number
  let hoursNum = parseInt(hours, 10);

  // Handle PM times
  if (modifier === "PM" && hoursNum !== 12) {
    hoursNum += 12;
  }

  // Handle AM times (e.g., "12:30 AM" should be "00:30")
  if (modifier === "AM" && hoursNum === 12) {
    hoursNum = 0;
  }

  // Format hours and minutes to two digits
  const formattedHours = hoursNum.toString().padStart(2, "0");
  const formattedMinutes = minutes.padStart(2, "0");

  // Return the time in 24-hour format
  return `${formattedHours}:${formattedMinutes}`;
}
