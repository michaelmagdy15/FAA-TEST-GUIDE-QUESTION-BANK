/**
 * Bookmark management for questions.
 * Stored in localStorage, per-mode.
 */

const BOOKMARK_KEY = "pilot_guide_bookmarks";

export function getBookmarks(mode: string = 'ppl'): string[] {
  try {
    const raw = localStorage.getItem(BOOKMARK_KEY);
    if (raw) {
      const data = JSON.parse(raw) as Record<string, string[]>;
      return data[mode] || [];
    }
  } catch { /* ignore */ }
  return [];
}

export function isBookmarked(questionId: string, mode: string = 'ppl'): boolean {
  return getBookmarks(mode).includes(questionId);
}

export function toggleBookmark(questionId: string, mode: string = 'ppl'): boolean {
  const bookmarks = getBookmarks(mode);
  const index = bookmarks.indexOf(questionId);
  let updated: string[];

  if (index >= 0) {
    updated = bookmarks.filter(id => id !== questionId);
  } else {
    updated = [...bookmarks, questionId];
  }

  const data = (() => {
    try {
      const raw = localStorage.getItem(BOOKMARK_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  })();

  data[mode] = updated;
  localStorage.setItem(BOOKMARK_KEY, JSON.stringify(data));
  return index < 0; // returns true if now bookmarked
}

export function getBookmarkCount(mode: string = 'ppl'): number {
  return getBookmarks(mode).length;
}
