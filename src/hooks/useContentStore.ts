import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ContentItem, ContentStatus, Pillar, FilterState, ViewMode, Platform, DEFAULT_PLATFORMS } from '@/lib/types';
import { DEFAULT_PILLARS, STORAGE_KEY } from '@/lib/constants';
import { generateId, getCurrentTimestamp } from '@/lib/utils';
import { SEED_DATA } from '@/lib/seedData';

interface ContentStore {
  content: ContentItem[];
  pillars: Pillar[];
  view: ViewMode;
  filters: FilterState;

  // Content actions
  addContent: (item: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt' | 'platforms'>) => void;
  updateContent: (id: string, updates: Partial<ContentItem>) => void;
  deleteContent: (id: string) => void;
  moveContent: (id: string, newStatus: ContentStatus) => void;
  togglePlatform: (id: string, platform: Platform) => void;
  importContent: (items: ContentItem[]) => void;

  // View actions
  setView: (view: ViewMode) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  clearFilters: () => void;

  // Pillar actions
  addPillar: (pillar: Omit<Pillar, 'id'>) => void;
}

export const useContentStore = create<ContentStore>()(
  persist(
    (set) => ({
      content: SEED_DATA.state.content as ContentItem[],
      pillars: SEED_DATA.state.pillars as Pillar[],
      view: 'calendar',
      filters: {
        pillar: null,
        status: null,
        search: '',
        platform: null,
      },

      addContent: (item) =>
        set((state) => ({
          content: [
            ...state.content,
            {
              ...item,
              id: generateId(),
              platforms: DEFAULT_PLATFORMS,
              createdAt: getCurrentTimestamp(),
              updatedAt: getCurrentTimestamp(),
            },
          ],
        })),

      updateContent: (id, updates) =>
        set((state) => ({
          content: state.content.map((item) =>
            item.id === id
              ? { ...item, ...updates, updatedAt: getCurrentTimestamp() }
              : item
          ),
        })),

      deleteContent: (id) =>
        set((state) => ({
          content: state.content.filter((item) => item.id !== id),
        })),

      moveContent: (id, newStatus) =>
        set((state) => ({
          content: state.content.map((item) =>
            item.id === id
              ? { ...item, status: newStatus, updatedAt: getCurrentTimestamp() }
              : item
          ),
        })),

      togglePlatform: (id, platform) =>
        set((state) => ({
          content: state.content.map((item) => {
            if (item.id !== id) return item;

            const currentStatus = item.platforms?.[platform] || { posted: false, postedDate: null };
            const newPosted = !currentStatus.posted;

            return {
              ...item,
              platforms: {
                ...item.platforms,
                [platform]: {
                  posted: newPosted,
                  postedDate: newPosted ? getCurrentTimestamp().split('T')[0] : null,
                },
              },
              updatedAt: getCurrentTimestamp(),
            };
          }),
        })),

      importContent: (items) =>
        set((state) => ({
          content: [...state.content, ...items.map(item => ({
            ...item,
            platforms: item.platforms || DEFAULT_PLATFORMS,
          }))],
        })),

      setView: (view) => set({ view }),

      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),

      clearFilters: () =>
        set({
          filters: { pillar: null, status: null, search: '', platform: null },
        }),

      addPillar: (pillar) =>
        set((state) => ({
          pillars: [...state.pillars, { ...pillar, id: generateId() }],
        })),
    }),
    {
      name: STORAGE_KEY,
    }
  )
);
