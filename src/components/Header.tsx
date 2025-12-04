'use client';

import { ViewToggle } from './ui/ViewToggle';
import { FilterBar } from './ui/FilterBar';

interface HeaderProps {
  onNewContent: () => void;
  onImport: () => void;
}

export function Header({ onNewContent, onImport }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Content Pipeline</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={onImport}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
            >
              Import CSV
            </button>
            <button
              onClick={onNewContent}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
            >
              + New Content
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center flex-wrap gap-4">
          <FilterBar />
          <ViewToggle />
        </div>
      </div>
    </header>
  );
}
