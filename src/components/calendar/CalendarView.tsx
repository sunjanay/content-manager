'use client';

import { useState, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  addMonths,
  subMonths,
  isSameMonth,
  isToday,
} from 'date-fns';
import { useContentStore } from '@/hooks/useContentStore';
import { ContentItem, ContentStatus } from '@/lib/types';
import { CalendarDay } from './CalendarDay';
import { CalendarCard } from './CalendarCard';
import { KanbanSidebar } from './KanbanSidebar';

interface CalendarViewProps {
  onCardClick: (item: ContentItem) => void;
  onNewContent: (status?: ContentStatus) => void;
}

export function CalendarView({ onCardClick, onNewContent }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeItem, setActiveItem] = useState<ContentItem | null>(null);

  const content = useContentStore((state) => state.content);
  const filters = useContentStore((state) => state.filters);
  const updateContent = useContentStore((state) => state.updateContent);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Filter content
  const filteredContent = useMemo(() => {
    return content.filter((item) => {
      if (filters.pillar && item.pillar !== filters.pillar) return false;
      if (filters.status && item.status !== filters.status) return false;
      if (filters.search) {
        const search = filters.search.toLowerCase();
        const matchesSearch =
          item.title.toLowerCase().includes(search) ||
          item.notes.toLowerCase().includes(search) ||
          item.caption.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }
      return true;
    });
  }, [content, filters]);

  // Get calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  // Group content by date
  const contentByDate = useMemo(() => {
    const grouped: Record<string, ContentItem[]> = {};

    filteredContent.forEach((item) => {
      const dateKey = item.postingDate || 'unscheduled';
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(item);
    });

    return grouped;
  }, [filteredContent]);

  const handleDragStart = (event: DragStartEvent) => {
    const item = content.find((c) => c.id === event.active.id);
    setActiveItem(item || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over) return;

    const itemId = active.id as string;
    const targetDate = over.id as string;

    // Handle drop targets
    if (targetDate.startsWith('kanban-')) {
      // Dropped on a kanban column - update status, clear date
      const newStatus = targetDate.replace('kanban-', '') as ContentStatus;
      updateContent(itemId, { status: newStatus, postingDate: null });
    } else {
      // Dropped on calendar - schedule it
      updateContent(itemId, { postingDate: targetDate });
    }
  };

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-full gap-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <div className="flex gap-1">
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ←
              </button>
              <button
                onClick={goToToday}
                className="px-3 py-1 text-sm hover:bg-gray-100 rounded-lg transition-colors"
              >
                Today
              </button>
              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                →
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-4 flex-1 min-h-0">
          {/* Calendar Grid */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-gray-500 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 flex-1 gap-1 auto-rows-fr">
              {calendarDays.map((day) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayContent = contentByDate[dateKey] || [];
                const isCurrentMonth = isSameMonth(day, currentMonth);

                return (
                  <CalendarDay
                    key={dateKey}
                    date={day}
                    dateKey={dateKey}
                    items={dayContent}
                    isCurrentMonth={isCurrentMonth}
                    isToday={isToday(day)}
                    onCardClick={onCardClick}
                  />
                );
              })}
            </div>
          </div>

          {/* Kanban Sidebar */}
          <KanbanSidebar
            content={filteredContent}
            onCardClick={onCardClick}
            onNewContent={onNewContent}
          />
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeItem ? (
          <CalendarCard item={activeItem} onClick={() => {}} isDragging />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
