'use client';

import { useDroppable } from '@dnd-kit/core';
import { format } from 'date-fns';
import { ContentItem } from '@/lib/types';
import { CalendarCard } from './CalendarCard';

interface CalendarDayProps {
  date: Date | null;
  dateKey: string;
  items: ContentItem[];
  isCurrentMonth: boolean;
  isToday: boolean;
  isUnscheduled?: boolean;
  onCardClick: (item: ContentItem) => void;
}

export function CalendarDay({
  date,
  dateKey,
  items,
  isCurrentMonth,
  isToday,
  isUnscheduled = false,
  onCardClick,
}: CalendarDayProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: dateKey,
  });

  if (isUnscheduled) {
    return (
      <div
        ref={setNodeRef}
        className={`
          bg-gray-50 rounded-xl p-3 flex flex-col h-full
          ${isOver ? 'bg-blue-50 ring-2 ring-blue-300' : ''}
        `}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-700">Unscheduled</h3>
          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
            {items.length}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2">
          {items.map((item) => (
            <CalendarCard
              key={item.id}
              item={item}
              onClick={() => onCardClick(item)}
            />
          ))}
          {items.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-4">
              Drag content here to unschedule
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      className={`
        border rounded-lg p-1 flex flex-col min-h-[100px] transition-colors
        ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
        ${isToday ? 'ring-2 ring-blue-500' : 'border-gray-200'}
        ${isOver ? 'bg-blue-50 ring-2 ring-blue-300' : ''}
      `}
    >
      {/* Day number */}
      <div className="flex items-center justify-between px-1 mb-1">
        <span
          className={`
            text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
            ${isToday ? 'bg-blue-600 text-white' : ''}
            ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-700'}
          `}
        >
          {date && format(date, 'd')}
        </span>
        {items.length > 0 && (
          <span className="text-xs text-gray-400">{items.length}</span>
        )}
      </div>

      {/* Content cards */}
      <div className="flex-1 overflow-y-auto space-y-2 px-0.5">
        {items.slice(0, 2).map((item) => (
          <CalendarCard
            key={item.id}
            item={item}
            onClick={() => onCardClick(item)}
          />
        ))}
        {items.length > 2 && (
          <button
            onClick={() => onCardClick(items[2])}
            className="text-xs text-gray-500 hover:text-gray-700 w-full text-left px-1"
          >
            +{items.length - 2} more
          </button>
        )}
      </div>
    </div>
  );
}
