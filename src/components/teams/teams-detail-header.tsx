import React from "react";

interface TeamsDetailHeaderProps {
  team: any;
  onClose: () => void;
}

const TeamsDetailHeader: React.FC<TeamsDetailHeaderProps> = ({
  team,
  onClose,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className='flex mt-15 md:mt-0 items-start justify-between px-4 py-6 sm:px-6 border-b border-gray-200'>
      <div>
        <div className='flex items-center'>
          <h2 className='text-lg font-medium items-center flex text-gray-900 mr-2'>
            {team.team_number}
          </h2>
        </div>
        <p className='mt-1 text-sm text-gray-500'>
          Created on {new Date(team.createdAt).toLocaleString()}
        </p>
        {team.createdAt !== team.updatedAt && (
          <p className='text-xs text-gray-500'>
            Last updated: {new Date(team.updatedAt).toLocaleString()}
          </p>
        )}
      </div>
      <div>
        <button
          type='button'
          className='-m-2 p-2 text-gray-400 hover:text-gray-500'
          onClick={onClose}>
          <span className='sr-only'>Close panel</span>
          <svg
            className='h-6 w-6'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            aria-hidden='true'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TeamsDetailHeader;
