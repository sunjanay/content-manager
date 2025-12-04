export type ContentStatus = 'idea' | 'filmed' | 'edited' | 'posted';

export type Platform = 'tiktok' | 'instagram' | 'facebook' | 'youtube';

export interface PlatformStatus {
  posted: boolean;
  postedDate: string | null;
}

export interface ContentItem {
  id: string;
  title: string;
  pillar: string;
  notes: string;
  caption: string;
  postingDate: string | null;
  results: string;
  status: ContentStatus;
  platforms: Record<Platform, PlatformStatus>;
  createdAt: string;
  updatedAt: string;
}

export interface Pillar {
  id: string;
  name: string;
  color: string;
  textColor: string;
}

export interface FilterState {
  pillar: string | null;
  status: ContentStatus | null;
  search: string;
  platform: Platform | null;
}

export type ViewMode = 'calendar' | 'table';

export const PLATFORMS: { id: Platform; label: string; icon: string; color: string }[] = [
  { id: 'tiktok', label: 'TikTok', icon: '/icons/tiktok.png', color: '#000000' },
  { id: 'instagram', label: 'Instagram', icon: '/icons/instagram.png', color: '#E1306C' },
  { id: 'facebook', label: 'Facebook', icon: '/icons/facebook.png', color: '#1877F2' },
  { id: 'youtube', label: 'YouTube', icon: '/icons/youtube.png', color: '#FF0000' },
];

export const DEFAULT_PLATFORMS: Record<Platform, PlatformStatus> = {
  tiktok: { posted: false, postedDate: null },
  instagram: { posted: false, postedDate: null },
  facebook: { posted: false, postedDate: null },
  youtube: { posted: false, postedDate: null },
};
