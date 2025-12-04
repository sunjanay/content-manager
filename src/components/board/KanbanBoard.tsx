'use client';

import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { useContentStore } from '@/hooks/useContentStore';
import { ContentItem, ContentStatus } from '@/lib/types';
import { STATUS_COLUMNS } from '@/lib/constants';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  onCardClick: (item: ContentItem) => void;
}

export function KanbanBoard({ onCardClick }: KanbanBoardProps) {
  const content = useContentStore((state) => state.content);
  const filters = useContentStore((state) => state.filters);
  const moveContent = useContentStore((state) => state.moveContent);

  // Filter content
  const filteredContent = content.filter((item) => {
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

  // Group by status
  const groupedContent = STATUS_COLUMNS.reduce(
    (acc, col) => {
      acc[col.id] = filteredContent.filter((item) => item.status === col.id);
      return acc;
    },
    {} as Record<ContentStatus, ContentItem[]>
  );

  const handleDragEnd = (result: DropResult) => {
    const { destination, draggableId } = result;

    if (!destination) return;

    const newStatus = destination.droppableId as ContentStatus;
    moveContent(draggableId, newStatus);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 h-full">
        {STATUS_COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.label}
            items={groupedContent[column.id]}
            onCardClick={onCardClick}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
