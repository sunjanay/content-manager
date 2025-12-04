'use client';

import { Droppable, Draggable } from '@hello-pangea/dnd';
import { ContentItem, ContentStatus } from '@/lib/types';
import { ContentCard } from './ContentCard';

interface KanbanColumnProps {
  id: ContentStatus;
  title: string;
  items: ContentItem[];
  onCardClick: (item: ContentItem) => void;
}

export function KanbanColumn({ id, title, items, onCardClick }: KanbanColumnProps) {
  return (
    <div className="flex flex-col bg-gray-100 rounded-xl p-3 min-w-[280px] max-w-[320px] flex-shrink-0">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="font-semibold text-gray-700">{title}</h2>
        <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-sm">
          {items.length}
        </span>
      </div>

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              flex flex-col gap-2 min-h-[200px] p-1 rounded-lg transition-colors flex-1
              ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}
            `}
          >
            {items.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <ContentCard
                      item={item}
                      onClick={() => onCardClick(item)}
                      isDragging={snapshot.isDragging}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
