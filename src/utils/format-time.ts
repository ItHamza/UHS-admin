export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(":");
  const parsedHours = parseInt(hours, 10);
  const suffix = parsedHours >= 12 ? "PM" : "AM";
  const formattedHours = parsedHours % 12 || 12;
  return `${formattedHours}:${minutes} ${suffix}`;
};
