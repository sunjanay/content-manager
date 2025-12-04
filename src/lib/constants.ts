import { Pillar, ContentStatus } from './types';

export const DEFAULT_PILLARS: Pillar[] = [
  { id: 'ditl', name: 'Day in the life', color: '#bfe1f6', textColor: '#0a53a8' },
  { id: 'meals', name: 'Meal Ideas', color: '#ffc8aa', textColor: '#753800' },
  { id: 'gadgets', name: 'Gadgets', color: '#d4edbc', textColor: '#11734b' },
  { id: 'fun', name: 'For fun', color: '#ffe5a0', textColor: '#473821' },
  { id: 'talking', name: 'Talking Points', color: '#ffcfc9', textColor: '#b10202' },
];

export const STATUS_COLUMNS: { id: ContentStatus; label: string }[] = [
  { id: 'idea', label: 'Ideas' },
  { id: 'filmed', label: 'Filmed' },
  { id: 'edited', label: 'Edited' },
];

export const STORAGE_KEY = 'content-pipeline-data';
