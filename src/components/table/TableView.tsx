'use client';

import { useContentStore } from '@/hooks/useContentStore';
import { ContentItem, ContentStatus, PLATFORMS, Platform } from '@/lib/types';
import { PillarBadge } from '@/components/ui/PillarBadge';
import { format } from 'date-fns';

interface TableViewProps {
  onRowClick: (item: ContentItem) => void;
}

export function TableView({ onRowClick }: TableViewProps) {
  const content = useContentStore((state) => state.content);
  const filters = useContentStore((state) => state.filters);
  const moveContent = useContentStore((state) => state.moveContent);
  const togglePlatform = useContentStore((state) => state.togglePlatform);

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

  const handleCheckboxChange = (item: ContentItem, field: 'filmed' | 'edited' | 'posted') => {
    const statusOrder: ContentStatus[] = ['idea', 'filmed', 'edited', 'posted'];
    const currentIndex = statusOrder.indexOf(item.status);
    const fieldIndex = statusOrder.indexOf(field);

    // If checking a box ahead of current status, move forward
    // If unchecking, move back one step
    if (fieldIndex > currentIndex) {
      moveContent(item.id, field);
    } else if (fieldIndex <= currentIndex) {
      const newIndex = Math.max(0, fieldIndex - 1);
      moveContent(item.id, statusOrder[newIndex]);
    }
  };

  const isChecked = (item: ContentItem, field: 'filmed' | 'edited' | 'posted'): boolean => {
    const statusOrder: ContentStatus[] = ['idea', 'filmed', 'edited', 'posted'];
    const currentIndex = statusOrder.indexOf(item.status);
    const fieldIndex = statusOrder.indexOf(field);
    return currentIndex >= fieldIndex;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Content Idea
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pillar
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Posting Date
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Filmed
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Edited
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Posted
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Platforms
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredContent.map((item) => (
            <tr
              key={item.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onRowClick(item)}
            >
              <td className="px-4 py-3">
                <div className="text-sm font-medium text-gray-900">{item.title}</div>
                {item.notes && (
                  <div className="text-xs text-gray-500 truncate max-w-xs">{item.notes}</div>
                )}
              </td>
              <td className="px-4 py-3">
                <PillarBadge pillarName={item.pillar} />
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {item.postingDate ? format(new Date(item.postingDate), 'MMM d, yyyy') : '—'}
              </td>
              <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={isChecked(item, 'filmed')}
                  onChange={() => handleCheckboxChange(item, 'filmed')}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </td>
              <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={isChecked(item, 'edited')}
                  onChange={() => handleCheckboxChange(item, 'edited')}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </td>
              <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={isChecked(item, 'posted')}
                  onChange={() => handleCheckboxChange(item, 'posted')}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </td>
              <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-1 justify-center">
                  {PLATFORMS.map((platform) => {
                    const isPosted = item.platforms?.[platform.id]?.posted || false;
                    return (
                      <button
                        key={platform.id}
                        onClick={() => togglePlatform(item.id, platform.id)}
                        className={`
                          w-7 h-7 rounded flex items-center justify-center transition-all
                          ${isPosted
                            ? 'ring-1 ring-offset-1 bg-gray-50'
                            : 'bg-gray-100 hover:bg-gray-200 opacity-40'
                          }
                        `}
                        style={isPosted ? {
                          '--tw-ring-color': platform.color,
                        } as React.CSSProperties : {}}
                        title={`${isPosted ? 'Posted to' : 'Mark as posted to'} ${platform.label}`}
                      >
                        <img src={platform.icon} alt={platform.label} className="w-4 h-4 object-contain" />
                      </button>
                    );
                  })}
                </div>
              </td>
            </tr>
          ))}
          {filteredContent.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                No content found. Add your first idea!
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
