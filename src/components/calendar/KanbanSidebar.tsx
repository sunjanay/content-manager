'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { ContentItem, ContentStatus } from '@/lib/types';
import { STATUS_COLUMNS } from '@/lib/constants';
import { CalendarCard } from './CalendarCard';

interface KanbanSidebarProps {
  content: ContentItem[];
  onCardClick: (item: ContentItem) => void;
  onNewContent: () => void;
}

interface KanbanColumnProps {
  status: ContentStatus;
  label: string;
  items: ContentItem[];
  onCardClick: (item: ContentItem) => void;
}

function KanbanColumn({ status, label, items, onCardClick }: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `kanban-${status}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        flex-1 min-h-[120px] rounded-lg p-2 transition-colors
        ${isOver ? 'bg-blue-100 ring-2 ring-blue-300' : 'bg-gray-100'}
      `}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-700">{label}</h4>
        <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
          {items.length}
        </span>
      </div>
      <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100% - 28px)' }}>
        {items.map((item) => (
          <CalendarCard
            key={item.id}
            item={item}
            onClick={() => onCardClick(item)}
            compact
          />
        ))}
      </div>
    </div>
  );
}

const MIN_WIDTH = 200;
const MAX_WIDTH = 600;
const DEFAULT_WIDTH = 288; // w-72

export function KanbanSidebar({ content, onCardClick, onNewContent }: KanbanSidebarProps) {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [isDragging, setIsDragging] = useState(false);

  // Group content by status (only items without a posting date)
  const unscheduledContent = content.filter(item => !item.postingDate);

  const contentByStatus: Record<ContentStatus, ContentItem[]> = {
    idea: [],
    filmed: [],
    edited: [],
    posted: [],
  };

  unscheduledContent.forEach(item => {
    if (contentByStatus[item.status]) {
      contentByStatus[item.status].push(item);
    }
  });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    // Calculate width from the right edge of the viewport
    const newWidth = window.innerWidth - e.clientX;
    setWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, newWidth)));
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      className="flex-shrink-0 bg-gray-50 rounded-xl p-3 flex flex-col h-full relative"
      style={{ width }}
    >
      {/* Drag handle */}
      <div
        className={`
          absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize
          hover:bg-blue-300 transition-colors rounded-l-xl
          ${isDragging ? 'bg-blue-400' : 'bg-transparent'}
        `}
        onMouseDown={handleMouseDown}
        title="Drag to resize"
      />

      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">Production Pipeline</h3>
        <button
          onClick={onNewContent}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-lg font-bold"
          title="Add new content"
        >
          +
        </button>
      </div>
      <div className="flex flex-col gap-3 flex-1 overflow-y-auto min-h-0">
        {STATUS_COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            status={col.id}
            label={col.label}
            items={contentByStatus[col.id]}
            onCardClick={onCardClick}
          />
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-3 text-center">
        Drag to calendar when ready to schedule
      </p>
    </div>
  );
}
