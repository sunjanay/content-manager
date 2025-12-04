'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ContentItem, ContentStatus, Platform, PLATFORMS, DEFAULT_PLATFORMS } from '@/lib/types';
import { useContentStore } from '@/hooks/useContentStore';
import { CaptionEditor } from '@/components/ui/CaptionEditor';

interface ContentModalProps {
  item: ContentItem | null;
  isOpen: boolean;
  onClose: () => void;
  defaultStatus?: ContentStatus | null;
}

export function ContentModal({ item, isOpen, onClose, defaultStatus }: ContentModalProps) {
  const pillars = useContentStore((state) => state.pillars);
  const content = useContentStore((state) => state.content);
  const addContent = useContentStore((state) => state.addContent);
  const updateContent = useContentStore((state) => state.updateContent);
  const deleteContent = useContentStore((state) => state.deleteContent);
  const togglePlatform = useContentStore((state) => state.togglePlatform);

  // Get live platform data from store
  const currentItem = item ? content.find(c => c.id === item.id) : null;
  const livePlatforms = currentItem?.platforms || DEFAULT_PLATFORMS;

  const [formData, setFormData] = useState({
    title: '',
    pillar: pillars[0]?.name || '',
    status: 'idea' as ContentStatus,
    notes: '',
    caption: '',
    postingDate: '',
    results: '',
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save function for existing items
  const autoSave = useCallback((data: typeof formData) => {
    if (!item) return;

    const contentData = {
      title: data.title,
      pillar: data.pillar,
      status: data.status,
      notes: data.notes,
      caption: data.caption,
      postingDate: data.postingDate || null,
      results: data.results,
    };

    updateContent(item.id, contentData);
  }, [item, updateContent]);

  // Debounced auto-save
  const debouncedSave = useCallback((data: typeof formData) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      autoSave(data);
    }, 300);
  }, [autoSave]);

  // Update form data and trigger auto-save for existing items
  const updateFormData = useCallback((updates: Partial<typeof formData>) => {
    setFormData(prev => {
      const newData = { ...prev, ...updates };
      if (item) {
        debouncedSave(newData);
      }
      return newData;
    });
  }, [item, debouncedSave]);

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title,
        pillar: item.pillar,
        status: item.status,
        notes: item.notes,
        caption: item.caption,
        postingDate: item.postingDate || '',
        results: item.results,
      });
    } else {
      setFormData({
        title: '',
        pillar: pillars[0]?.name || '',
        status: defaultStatus || 'idea',
        notes: '',
        caption: '',
        postingDate: '',
        results: '',
      });
    }
    setShowDeleteConfirm(false);
  }, [item, pillars, isOpen, defaultStatus]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  // Handle adding new content
  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) return;

    const contentData = {
      title: formData.title,
      pillar: formData.pillar,
      status: formData.status,
      notes: formData.notes,
      caption: formData.caption,
      postingDate: formData.postingDate || null,
      results: formData.results,
    };

    addContent(contentData);
    onClose();
  };

  const handleDelete = () => {
    if (item) {
      deleteContent(item.id);
      onClose();
    }
  };

  const handlePlatformToggle = (platform: Platform) => {
    if (item) {
      togglePlatform(item.id, platform);
    }
  };

  // Close when clicking backdrop
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const isNewItem = !item;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {isNewItem ? 'New Content' : 'Edit Content'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              &times;
            </button>
          </div>

          <form onSubmit={handleAddNew} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title {isNewItem && '*'}
              </label>
              <input
                type="text"
                required={isNewItem}
                value={formData.title}
                onChange={(e) => updateFormData({ title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Content idea..."
              />
            </div>

            {/* Caption - moved up */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Caption
              </label>
              <CaptionEditor
                value={formData.caption}
                onChange={(value) => updateFormData({ caption: value })}
                placeholder="Post caption..."
              />
            </div>

            {/* Notes - moved up */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => updateFormData({ notes: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Additional notes..."
              />
            </div>

            {/* Compact row: Category + Scheduled Date */}
            <div className="flex gap-4 items-start">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Category
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {pillars.map((pillar) => (
                    <button
                      key={pillar.id}
                      type="button"
                      onClick={() => updateFormData({ pillar: pillar.name })}
                      className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                        formData.pillar === pillar.name
                          ? 'ring-2 ring-offset-1'
                          : 'opacity-50 hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor: pillar.color,
                        color: pillar.textColor,
                        '--tw-ring-color': pillar.textColor,
                      } as React.CSSProperties}
                    >
                      {pillar.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="w-36">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Scheduled
                </label>
                <input
                  type="date"
                  value={formData.postingDate}
                  onChange={(e) => updateFormData({ postingDate: e.target.value })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Platform Posting Status - compact, only for existing items */}
            {!isNewItem && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Posted To
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {PLATFORMS.map((platform) => {
                    const isPosted = livePlatforms[platform.id]?.posted || false;

                    return (
                      <button
                        key={platform.id}
                        type="button"
                        onClick={() => handlePlatformToggle(platform.id)}
                        className={`
                          flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-all border
                          ${isPosted
                            ? 'border-current'
                            : 'border-gray-200 bg-gray-50 text-gray-400 hover:bg-gray-100'
                          }
                        `}
                        style={isPosted ? {
                          backgroundColor: platform.color + '20',
                          color: platform.color,
                          borderColor: platform.color,
                        } : {}}
                      >
                        <img src={platform.icon} alt={platform.label} className="w-4 h-4 object-contain" />
                        <span>{platform.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Results */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Results
              </label>
              <textarea
                value={formData.results}
                onChange={(e) => updateFormData({ results: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Performance metrics..."
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              {isNewItem ? (
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Add Content
                </button>
              ) : (
                <>
                  {!showDeleteConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors border border-red-200"
                    >
                      Delete
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                    >
                      Confirm Delete
                    </button>
                  )}
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
