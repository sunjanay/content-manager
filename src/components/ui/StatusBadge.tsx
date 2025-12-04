import { ContentStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: ContentStatus;
  className?: string;
}

const STATUS_STYLES: Record<ContentStatus, string> = {
  idea: 'bg-gray-100 text-gray-700',
  filmed: 'bg-blue-100 text-blue-700',
  edited: 'bg-yellow-100 text-yellow-700',
  posted: 'bg-green-100 text-green-700',
};

const STATUS_LABELS: Record<ContentStatus, string> = {
  idea: 'Idea',
  filmed: 'Filmed',
  edited: 'Edited',
  posted: 'Posted',
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  return (
    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${STATUS_STYLES[status]} ${className}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
