'use client';

import { useDraggable } from '@dnd-kit/core';
import { ContentItem, PLATFORMS } from '@/lib/types';
import { useContentStore } from '@/hooks/useContentStore';
import { CSSProperties } from 'react';

interface CalendarCardProps {
  item: ContentItem;
  onClick: () => void;
  isDragging?: boolean;
  compact?: boolean;
}

export function CalendarCard({
  item,
  onClick,
  isDragging = false,
  compact = false,
}: CalendarCardProps) {
  const pillars = useContentStore((state) => state.pillars);
  const pillar = pillars.find((p) => p.name === item.pillar);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id,
  });

  const baseStyle: CSSProperties = {};

  if (transform) {
    baseStyle.transform = `translate3d(${transform.x}px, ${transform.y}px, 0)`;
  }

  // Get posted platforms
  const postedPlatforms = PLATFORMS.filter(p => item.platforms?.[p.id]?.posted);

  // Compact view for calendar day cells
  if (compact) {
    return (
      <div
        ref={setNodeRef}
        style={{
          ...baseStyle,
          backgroundColor: pillar?.color || '#f3f4f6',
          color: pillar?.textColor || '#374151',
        }}
        {...listeners}
        {...attributes}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className={`
          rounded px-2 py-1 cursor-pointer transition-all text-xs
          hover:ring-1 hover:ring-gray-400
          ${isDragging ? 'opacity-80 shadow-lg scale-105' : ''}
        `}
      >
        <p className="font-medium truncate">{item.title}</p>
        {postedPlatforms.length > 0 && (
          <div className="flex gap-1 mt-1">
            {postedPlatforms.map(p => (
              <img
                key={p.id}
                src={p.icon}
                alt={p.label}
                className="w-3 h-3 object-contain"
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Full view for unscheduled sidebar
  return (
    <div
      ref={setNodeRef}
      style={baseStyle}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`
        rounded-lg p-3 cursor-pointer transition-all border border-gray-200 bg-white
        hover:shadow-md
        ${isDragging ? 'opacity-80 shadow-lg scale-105 rotate-1' : 'shadow-sm'}
      `}
    >
      {/* Title */}
      <p className="text-sm font-semibold text-gray-900 line-clamp-2">{item.title}</p>

      {/* Pillar Badge */}
      {pillar && (
        <div className="mt-2">
          <span
            className="inline-block px-2 py-0.5 rounded text-xs font-medium"
            style={{ backgroundColor: pillar.color, color: pillar.textColor }}
          >
            {pillar.name}
          </span>
        </div>
      )}

      {/* Platform Icons - only show posted ones */}
      {postedPlatforms.length > 0 && (
        <div className="flex gap-1.5 mt-2">
          {postedPlatforms.map(p => (
            <img
              key={p.id}
              src={p.icon}
              alt={p.label}
              title={p.label}
              className="w-4 h-4 object-contain"
            />
          ))}
        </div>
      )}
    </div>
  );
}
