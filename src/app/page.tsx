'use client';

import { useState } from 'react';
import { useContentStore } from '@/hooks/useContentStore';
import { useDataSync } from '@/hooks/useDataSync';
import { ContentItem, ContentStatus } from '@/lib/types';
import { Header } from '@/components/Header';
import { CalendarView } from '@/components/calendar/CalendarView';
import { TableView } from '@/components/table/TableView';
import { ContentModal } from '@/components/modals/ContentModal';
import { ImportModal } from '@/components/modals/ImportModal';

export default function Home() {
  const view = useContentStore((state) => state.view);

  // Auto-sync data with remote database
  useDataSync();

  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<ContentStatus | null>(null);

  const handleNewContent = (status?: ContentStatus) => {
    setSelectedItem(null);
    setDefaultStatus(status || null);
    setIsContentModalOpen(true);
  };

  const handleCardClick = (item: ContentItem) => {
    setSelectedItem(item);
    setIsContentModalOpen(true);
  };

  const handleCloseContentModal = () => {
    setIsContentModalOpen(false);
    setSelectedItem(null);
    setDefaultStatus(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onNewContent={handleNewContent}
        onImport={() => setIsImportModalOpen(true)}
      />

      <main className="flex-1 p-6 overflow-hidden">
        {view === 'calendar' ? (
          <CalendarView onCardClick={handleCardClick} onNewContent={handleNewContent} />
        ) : (
          <TableView onRowClick={handleCardClick} />
        )}
      </main>

      <ContentModal
        item={selectedItem}
        isOpen={isContentModalOpen}
        onClose={handleCloseContentModal}
        defaultStatus={defaultStatus}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
}
