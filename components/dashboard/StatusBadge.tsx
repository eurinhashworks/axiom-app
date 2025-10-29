import React from 'react';
import { IdeaStatus } from '../../types';

interface StatusBadgeProps {
  status: IdeaStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusStyles: { [key in IdeaStatus]: { text: string; bg: string; } } = {
    DRAFT: { text: 'text-gray-800 dark:text-gray-200', bg: 'bg-gray-200 dark:bg-gray-700' },
    ANALYZING: { text: 'text-blue-800 dark:text-blue-200', bg: 'bg-blue-200 dark:bg-blue-800' },
    ANALYZED: { text: 'text-purple-800 dark:text-purple-200', bg: 'bg-purple-200 dark:bg-purple-800' },
    EVALUATED: { text: 'text-yellow-800 dark:text-yellow-200', bg: 'bg-yellow-200 dark:bg-yellow-800' },
    ROADMAP_GENERATED: { text: 'text-green-800 dark:text-green-200', bg: 'bg-green-200 dark:bg-green-800' },
  };

  const { text, bg } = statusStyles[status] || statusStyles.DRAFT;
  const formattedStatus = status.replace('_', ' ').toLowerCase();

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize whitespace-nowrap ${bg} ${text}`}>
      {formattedStatus}
    </span>
  );
};

export default StatusBadge;
