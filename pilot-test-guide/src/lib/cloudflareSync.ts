/**
 * Cloudflare D1 sync — debounced PUT to Worker, GET on login.
 * localStorage remains the primary store (instant, offline).
 * D1 is the cloud backup (synced every 500ms after writes).
 */

const WORKER_URL = import.meta.env.VITE_CF_WORKER_URL || '';
let _syncTimeout: ReturnType<typeof setTimeout> | null = null;
let _currentUserId: string | null = null;

export function setSyncUserId(userId: string | null): void {
  _currentUserId = userId;
}

/**
 * Collect all relevant progress data from localStorage.
 */
function collectProgressData(): {
  chapters: Record<string, Record<string, string>>;
  detailed: Record<string, unknown>;
  detailedUpdatedAt: number;
  bookmarks: Record<string, string[]>;
} {
  const chapters: Record<string, Record<string, string>> = {};
  const bookmarks: Record<string, string[]> = {};

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;

    // Chapter progress: keys like "progress_chapter1", "ir_progress_chapter3"
    if (key.includes('_progress_') && !key.includes('pilot_guide_progress') && !key.endsWith('_pos')) {
      const val = localStorage.getItem(key);
      if (val) {
        try {
          chapters[key] = JSON.parse(val);
        } catch {
          chapters[key] = {};
        }
      }
    }

    // Pilot guide progress (detailed)
    if (key.includes('pilot_guide_progress')) {
      // handled below
    }

    // Bookmarks
    if (key === 'pilot_guide_bookmarks') {
      const val = localStorage.getItem(key);
      if (val) {
        try {
          const parsed = JSON.parse(val);
          Object.assign(bookmarks, parsed);
        } catch {
          // ignore
        }
      }
    }
  }

  // Detailed progress (streaks, achievements, etc.)
  let detailed: Record<string, unknown> = {};
  let detailedUpdatedAt = 0;
  const userId = _currentUserId;
  if (userId) {
    const detailKey = `${userId}_pilot_guide_progress`;
    const val = localStorage.getItem(detailKey);
    if (val) {
      try {
        detailed = JSON.parse(val);
        detailedUpdatedAt = Date.now();
      } catch {
        detailed = {};
      }
    }
  } else {
    const val = localStorage.getItem('pilot_guide_progress');
    if (val) {
      try {
        detailed = JSON.parse(val);
        detailedUpdatedAt = Date.now();
      } catch {
        detailed = {};
      }
    }
  }

  return { chapters, detailed, detailedUpdatedAt, bookmarks };
}

/**
 * PUT all progress to Cloudflare Worker (D1).
 */
async function pushToD1(): Promise<void> {
  if (!WORKER_URL || !_currentUserId) return;

  try {
    const data = collectProgressData();
    const res = await fetch(`${WORKER_URL}/api/sync/${_currentUserId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      console.warn('D1 sync failed:', res.status);
    }
  } catch (err) {
    console.warn('D1 sync error:', err);
  }
}

/**
 * Debounced sync — calls pushToD1 500ms after the last write.
 */
export function debouncedSync(): void {
  if (_syncTimeout) clearTimeout(_syncTimeout);
  _syncTimeout = setTimeout(() => {
    pushToD1();
    _syncTimeout = null;
  }, 500);
}

/**
 * Load progress from D1 and merge into localStorage.
 * D1 wins on conflict (cloud is source of truth when logged in).
 */
export async function loadFromD1(userId: string): Promise<void> {
  if (!WORKER_URL) return;

  try {
    const res = await fetch(`${WORKER_URL}/api/sync/${userId}`);
    if (!res.ok) return;

    const body = await res.json() as {
      chapters: Record<string, Record<string, string>>;
      detailed: Record<string, unknown>;
      bookmarks: Record<string, string[]>;
    };
    const { chapters, detailed, bookmarks } = body;

    // Merge chapter progress — D1 wins
    for (const [key, answers] of Object.entries(chapters)) {
      const existing = localStorage.getItem(key);
      if (!existing || Object.keys(answers).length > 0) {
        localStorage.setItem(key, JSON.stringify(answers));
      }
    }

    // Merge detailed progress — D1 wins
    if (detailed && Object.keys(detailed).length > 0) {
      const detailKey = `${userId}_pilot_guide_progress`;
      localStorage.setItem(detailKey, JSON.stringify(detailed));
    }

    // Merge bookmarks — D1 wins
    if (bookmarks && Object.keys(bookmarks).length > 0) {
      const existingRaw = localStorage.getItem('pilot_guide_bookmarks');
      let existing: Record<string, string[]> = {};
      if (existingRaw) {
        try { existing = JSON.parse(existingRaw) as Record<string, string[]>; } catch { /* ignore */ }
      }
      for (const [mode, ids] of Object.entries(bookmarks)) {
        if (ids.length > 0) {
          existing[mode] = ids as string[];
        }
      }
      localStorage.setItem('pilot_guide_bookmarks', JSON.stringify(existing));
    }
  } catch (err) {
    console.warn('D1 load error:', err);
  }
}
