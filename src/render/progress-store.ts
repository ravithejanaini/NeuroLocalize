// Practice progress lives in this browser (D49): a per-viewer convenience that may come
// back empty (a private window, cleared data), so every access is guarded and the page
// works without it. Export and import carry it between browsers.
import { emptyProgress, parseProgress, type Progress } from '../practice/schedule.ts';

const KEY = 'neurolocalize.progress.v1';

export function loadProgress(): Progress {
  try {
    const text = window.localStorage.getItem(KEY);
    return text ? parseProgress(text) : emptyProgress();
  } catch {
    return emptyProgress();
  }
}

/** False when this browser would not keep it. */
export function saveProgress(p: Progress): boolean {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
    return true;
  } catch {
    return false;
  }
}

export const exportText = (p: Progress): string => JSON.stringify(p);

/** Null when the text is not progress this page wrote. */
export function importText(text: string): Progress | null {
  const p = parseProgress(text.trim());
  return p.history.length > 0 || Object.keys(p.pathways).length > 0 ? p : null;
}
