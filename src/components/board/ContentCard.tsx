'use client';

import { ContentItem } from '@/lib/types';
import { PillarBadge } from '@/components/ui/PillarBadge';
import { format } from 'date-fns';

interface ContentCardProps {
  item: ContentItem;
  onClick: () => void;
  isDragging?: boolean;
}

export function ContentCard({ item, onClick, isDragging = false }: ContentCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-lg p-3 shadow-sm border border-gray-200 cursor-pointer
        hover:shadow-md hover:border-gray-300 transition-all
        ${isDragging ? 'shadow-lg rotate-2 scale-105' : ''}
      `}
    >
      <div className="flex flex-col gap-2">
        <PillarBadge pillarName={item.pillar} />

        <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
          {item.title}
        </h3>

        {item.postingDate && (
          <p className="text-xs text-gray-500">
            {format(new Date(item.postingDate), 'MMM d, yyyy')}
          </p>
        )}

        <div className="flex gap-1">
          {item.notes && (
            <span className="text-xs text-gray-400" title="Has notes">
              📝
            </span>
          )}
          {item.caption && (
            <span className="text-xs text-gray-400" title="Has caption">
              💬
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
