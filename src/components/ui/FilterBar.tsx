'use client';

import { useContentStore } from '@/hooks/useContentStore';
import { STATUS_COLUMNS } from '@/lib/constants';
import { ContentStatus } from '@/lib/types';

export function FilterBar() {
  const pillars = useContentStore((state) => state.pillars);
  const filters = useContentStore((state) => state.filters);
  const setFilters = useContentStore((state) => state.setFilters);
  const clearFilters = useContentStore((state) => state.clearFilters);

  const hasFilters = filters.pillar || filters.status || filters.search;

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <input
        type="text"
        placeholder="Search..."
        value={filters.search}
        onChange={(e) => setFilters({ search: e.target.value })}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-48"
      />

      <select
        value={filters.pillar || ''}
        onChange={(e) => setFilters({ pillar: e.target.value || null })}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">All Pillars</option>
        {pillars.map((pillar) => (
          <option key={pillar.id} value={pillar.name}>
            {pillar.name}
          </option>
        ))}
      </select>

      <select
        value={filters.status || ''}
        onChange={(e) => setFilters({ status: (e.target.value as ContentStatus) || null })}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">All Statuses</option>
        {STATUS_COLUMNS.map((col) => (
          <option key={col.id} value={col.id}>
            {col.label}
          </option>
        ))}
      </select>

      {hasFilters && (
        <button
          onClick={clearFilters}
          className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
