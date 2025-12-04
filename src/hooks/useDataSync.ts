'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useContentStore } from './useContentStore';
import { STORAGE_KEY } from '@/lib/constants';

const SYNC_DEBOUNCE_MS = 2000; // Sync every 2 seconds after changes

export function useDataSync() {
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncedRef = useRef<string | null>(null);
  const content = useContentStore((state) => state.content);
  const pillars = useContentStore((state) => state.pillars);

  // Save to remote database
  const syncToRemote = useCallback(async () => {
    const localData = localStorage.getItem(STORAGE_KEY);
    if (!localData) return;

    // Don't sync if data hasn't changed since last sync
    if (localData === lastSyncedRef.current) return;

    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: localData,
      });

      if (response.ok) {
        lastSyncedRef.current = localData;
        console.log('Data synced to remote');
      }
    } catch (error) {
      console.error('Failed to sync to remote:', error);
    }
  }, []);

  // Load from remote database on initial mount
  const loadFromRemote = useCallback(async () => {
    try {
      const response = await fetch('/api/content');
      if (!response.ok) return;

      const data = await response.json();
      if (data.state && data.state.content) {
        // Only load if remote has data and local is empty or this is first visit
        const localData = localStorage.getItem(STORAGE_KEY);
        if (!localData) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          window.location.reload();
        }
      }
    } catch (error) {
      console.error('Failed to load from remote:', error);
    }
  }, []);

  // Initial load from remote
  useEffect(() => {
    loadFromRemote();
  }, [loadFromRemote]);

  // Debounced sync when content or pillars change
  useEffect(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(() => {
      syncToRemote();
    }, SYNC_DEBOUNCE_MS);

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [content, pillars, syncToRemote]);

  return { syncToRemote, loadFromRemote };
}
