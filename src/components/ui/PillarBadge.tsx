'use client';

import { useContentStore } from '@/hooks/useContentStore';

interface PillarBadgeProps {
  pillarName: string;
  className?: string;
}

export function PillarBadge({ pillarName, className = '' }: PillarBadgeProps) {
  const pillars = useContentStore((state) => state.pillars);
  const pillar = pillars.find((p) => p.name === pillarName);

  if (!pillar) {
    return (
      <span className={`px-2 py-1 rounded-lg text-xs font-medium bg-gray-200 text-gray-700 ${className}`}>
        {pillarName}
      </span>
    );
  }

  return (
    <span
      className={`px-2 py-1 rounded-lg text-xs font-medium ${className}`}
      style={{ backgroundColor: pillar.color, color: pillar.textColor }}
    >
      {pillar.name}
    </span>
  );
}
