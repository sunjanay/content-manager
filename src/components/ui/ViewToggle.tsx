'use client';

import { useContentStore } from '@/hooks/useContentStore';

export function ViewToggle() {
  const view = useContentStore((state) => state.view);
  const setView = useContentStore((state) => state.setView);

  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => setView('calendar')}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          view === 'calendar'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Calendar
      </button>
      <button
        onClick={() => setView('table')}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          view === 'table'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Table
      </button>
    </div>
  );
}
