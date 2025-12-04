import Papa from 'papaparse';
import { ContentItem, ContentStatus, DEFAULT_PLATFORMS } from './types';
import { generateId, getCurrentTimestamp } from './utils';

interface CSVRow {
  [key: string]: string;
}

function normalizeHeader(header: string): string {
  return header.toLowerCase().trim().replace(/\s+/g, '_');
}

function deriveStatus(filmed: boolean, edited: boolean, posted: boolean): ContentStatus {
  if (posted) return 'posted';
  if (edited) return 'edited';
  if (filmed) return 'filmed';
  return 'idea';
}

function parseCheckbox(value: string): boolean {
  const v = value?.toLowerCase().trim();
  return v === 'true' || v === 'yes' || v === '1' || v === 'checked' || v === '✓';
}

export function parseCSV(csvText: string): Promise<ContentItem[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<CSVRow>(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const items: ContentItem[] = results.data.map((row) => {
            // Normalize all keys
            const normalizedRow: CSVRow = {};
            Object.keys(row).forEach((key) => {
              normalizedRow[normalizeHeader(key)] = row[key];
            });

            // Map fields
            const title =
              normalizedRow['content_idea'] ||
              normalizedRow['title'] ||
              normalizedRow['idea'] ||
              '';

            const pillar =
              normalizedRow['pillar'] ||
              normalizedRow['category'] ||
              '';

            const notes = normalizedRow['notes'] || '';
            const caption = normalizedRow['caption'] || '';
            const itemResults = normalizedRow['results'] || '';

            const postingDateRaw =
              normalizedRow['posting_date'] ||
              normalizedRow['date'] ||
              normalizedRow['post_date'] ||
              '';

            let postingDate: string | null = null;
            if (postingDateRaw) {
              const parsed = new Date(postingDateRaw);
              if (!isNaN(parsed.getTime())) {
                postingDate = parsed.toISOString().split('T')[0];
              }
            }

            // Derive status from checkboxes
            const filmed = parseCheckbox(normalizedRow['filmed'] || '');
            const edited = parseCheckbox(normalizedRow['edited'] || '');
            const posted = parseCheckbox(normalizedRow['posted'] || '');
            const status = deriveStatus(filmed, edited, posted);

            return {
              id: generateId(),
              title,
              pillar,
              notes,
              caption,
              postingDate,
              results: itemResults,
              status,
              platforms: DEFAULT_PLATFORMS,
              createdAt: getCurrentTimestamp(),
              updatedAt: getCurrentTimestamp(),
            };
          });

          // Filter out rows with no title
          const validItems = items.filter((item) => item.title.trim() !== '');
          resolve(validItems);
        } catch (error) {
          reject(error);
        }
      },
      error: (error: Error) => {
        reject(error);
      },
    });
  });
}
