'use client';

import { useState, useRef } from 'react';
import { useContentStore } from '@/hooks/useContentStore';
import { parseCSV } from '@/lib/csvParser';
import { ContentItem } from '@/lib/types';
import { STORAGE_KEY } from '@/lib/constants';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportModal({ isOpen, onClose }: ImportModalProps) {
  const importContent = useContentStore((state) => state.importContent);
  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const [parsedItems, setParsedItems] = useState<ContentItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const items = await parseCSV(text);
      setParsedItems(items);
      setStep('preview');
    } catch {
      setError('Failed to parse CSV file. Please check the format.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = () => {
    importContent(parsedItems);
    handleClose();
  };

  const handleClose = () => {
    setStep('upload');
    setParsedItems([]);
    setError(null);
    setSuccessMessage(null);
    onClose();
  };

  // Export full backup as JSON file
  const handleExportBackup = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      setError('No data to export');
      return;
    }

    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-pipeline-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setSuccessMessage('Backup downloaded!');
  };

  // Import full backup from JSON file
  const handleJsonFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const text = await file.text();
      // Validate it's valid JSON with expected structure
      const parsed = JSON.parse(text);
      if (!parsed.state || !parsed.state.content) {
        throw new Error('Invalid backup file');
      }

      localStorage.setItem(STORAGE_KEY, text);
      setSuccessMessage('Backup restored! Refreshing...');

      // Refresh the page to load the new data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch {
      setError('Invalid backup file. Please use a file exported from this app.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Import / Export</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              &times;
            </button>
          </div>

          {/* Backup Section */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Full Backup (Recommended)</h3>
            <p className="text-blue-800 text-sm mb-3">
              Export/import all your data including platforms, dates, and settings.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleExportBackup}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Download Backup
              </button>
              <input
                ref={jsonInputRef}
                type="file"
                accept=".json"
                onChange={handleJsonFileChange}
                className="hidden"
                id="json-upload"
              />
              <label
                htmlFor="json-upload"
                className="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors cursor-pointer"
              >
                Restore Backup
              </label>
            </div>
            {successMessage && (
              <p className="text-green-600 text-sm mt-2">{successMessage}</p>
            )}
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-700 mb-2">Import from CSV</h3>

            {step === 'upload' && (
              <div className="space-y-4">
                <p className="text-gray-600 text-sm">
                  Upload a CSV file exported from Google Sheets. The following columns will be
                  recognized: Content Idea, Pillar, Notes, Caption, Posting Date, Filmed, Edited,
                  Posted, Results.
                </p>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label
                    htmlFor="csv-upload"
                    className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {isLoading ? 'Processing...' : 'Click to upload CSV file'}
                  </label>
                </div>

                {error && <p className="text-red-600 text-sm">{error}</p>}
              </div>
            )}

            {step === 'preview' && (
              <div className="space-y-4">
                <p className="text-gray-600 text-sm">
                  Found {parsedItems.length} content items. Preview below:
                </p>

                <div className="max-h-64 overflow-y-auto border rounded-lg">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left">Title</th>
                        <th className="px-3 py-2 text-left">Pillar</th>
                        <th className="px-3 py-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {parsedItems.slice(0, 20).map((item) => (
                        <tr key={item.id}>
                          <td className="px-3 py-2 truncate max-w-xs">{item.title}</td>
                          <td className="px-3 py-2">{item.pillar || '—'}</td>
                          <td className="px-3 py-2 capitalize">{item.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsedItems.length > 20 && (
                    <p className="text-center text-gray-500 py-2 text-sm">
                      ... and {parsedItems.length - 20} more items
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setStep('upload')}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleImport}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Import {parsedItems.length} Items
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
