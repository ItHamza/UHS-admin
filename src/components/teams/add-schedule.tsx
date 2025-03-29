import { GenerateScheduleAction } from "@/actions/schedule";
import { useState } from "react";
import toast from "react-hot-toast";
import Loader from "../ui/loader";
import { formatTimeTo24Hrs } from "@/utils/format-time";

interface AddScheduleModalProps {
  teamId: string;
  onClose: () => void;
  onSubmit: (schedule: any) => void;
}

const AddScheduleModal: React.FC<AddScheduleModalProps> = ({
  teamId,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [numberOfDays, setNumberOfDays] = useState(1);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");

  const [scheduleType, setScheduleType] = useState("free_time");
  const [loading, setLoading] = useState(false);
  const scheduleTypes = [
    "working",
    "free_time",
    "break",
    "transport",
    "cancelled",
    "pending",
    "blocked",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await GenerateScheduleAction({
        start_date: startDate,
        number_of_days: numberOfDays,
        start_time: formatTimeTo24Hrs(startTime),
        end_time: formatTimeTo24Hrs(endTime),
        team_id: teamId,
        schedule_type: scheduleType,
      });
      toast.success("Schedules added successfully");
      //   onSubmit({
      //     title,
      //     start_date: startDate,
      //     number_of_days: numberOfDays,
      //     start_time: startTime,
      //     end_time: endTime,
      //     description,
      //     team_id: teamId,
      //     schedule_type: scheduleType,
      //   });
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='fixed inset-0 bg-gray-800/40 bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-md'>
        <div className='p-6'>
          <h2 className='text-xl font-semibold mb-4'>Generate New Schedule</h2>

          <form onSubmit={handleSubmit}>
            <div className='grid grid-cols-2 gap-4 mb-4'>
              <div>
                <label
                  htmlFor='startDate'
                  className='block text-sm font-medium text-gray-700 mb-1'>
                  Start Date
                </label>
                <input
                  id='startDate'
                  type='date'
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                  required
                />
              </div>
              <div>
                <label
                  htmlFor='numberOfDays'
                  className='block text-sm font-medium text-gray-700 mb-1'>
                  Number of Days
                </label>
                <input
                  id='numberOfDays'
                  type='number'
                  min='1'
                  value={numberOfDays}
                  onChange={(e) => setNumberOfDays(Number(e.target.value))}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                  required
                />
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4 mb-4'>
              <div>
                <label
                  htmlFor='startTime'
                  className='block text-sm font-medium text-gray-700 mb-1'>
                  Start Time
                </label>
                <input
                  id='startTime'
                  type='time'
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                  required
                />
              </div>
              <div>
                <label
                  htmlFor='endTime'
                  className='block text-sm font-medium text-gray-700 mb-1'>
                  End Time
                </label>
                <input
                  id='endTime'
                  type='time'
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                  required
                />
              </div>
            </div>

            <div className='mb-4'>
              <label
                htmlFor='scheduleType'
                className='block text-sm font-medium text-gray-700 mb-1'>
                Schedule Type
              </label>
              <select
                id='scheduleType'
                value={scheduleType}
                onChange={(e) => setScheduleType(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                required>
                {scheduleTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            <div className='mt-6 flex justify-end space-x-3'>
              <button
                type='button'
                onClick={onClose}
                className='px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none'>
                Cancel
              </button>
              {!loading ? (
                <button
                  type='submit'
                  className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none'>
                  Add Schedule
                </button>
              ) : (
                <Loader />
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddScheduleModal;
