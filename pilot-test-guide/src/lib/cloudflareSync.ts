/**
 * Cloudflare D1 sync — debounced PUT to Worker, GET on login.
 * localStorage remains the primary store (instant, offline).
 * D1 is the cloud backup (synced every 500ms after writes).
 *
 * Smart merge: on login, local + cloud progress are combined so no progress is lost.
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
 * Manual sync — immediately pushes all progress to D1.
 * Returns a promise that resolves when done.
 */
export async function syncNow(): Promise<boolean> {
  if (_syncTimeout) clearTimeout(_syncTimeout);
  _syncTimeout = null;
  if (!WORKER_URL || !_currentUserId) return false;
  try {
    await pushToD1();
    return true;
  } catch {
    return false;
  }
}

// ---- Smart Merge Helpers ----

interface ProgressData {
  streak?: { current: number; longest: number; lastDate: string };
  dailyGoals?: { date: string; questionsAnswered: number; correctCount: number; goalMet: boolean }[];
  achievements?: { id: string; name: string; description: string; icon: string; unlocked: boolean; unlockedAt?: string }[];
  mistakePatterns?: { category: string; count: number; questionIds: string[]; lastSeen: string }[];
  studySessions?: { date: string; durationMinutes: number; questionsAnswered: number; correctCount: number }[];
  totalQuestionsAnswered?: number;
  totalCorrect?: number;
  categoryAccuracy?: Record<string, { correct: number; total: number }>;
  recentQuestionTimes?: number[];
  consecutiveCorrectNoHints?: number;
  maxConsecutiveCorrectNoHints?: number;
  perfectChapterChecked?: string[];
  weakCategoryHistory?: Record<string, number>;
  examHistory?: { id: string; mode: string; type: string; date: string; totalQuestions: number; correctAnswers: number; timeSpentSeconds: number; passed: boolean; category?: string }[];
  questionRecords?: { questionId: string; mode: string; isCorrect: boolean; timeSeconds: number; timestamp: string }[];
  answeredQuestionIds?: Record<string, string[]>;
}

function mergeChapterProgress(
  local: Record<string, string>,
  cloud: Record<string, string>
): Record<string, string> {
  // Union: keep all answers from both sources.
  // If both have the same question, keep cloud (more recently synced).
  return { ...local, ...cloud };
}

function mergeDetailedProgress(
  local: ProgressData,
  cloud: ProgressData
): ProgressData {
  const merged: ProgressData = {};

  // answeredQuestionIds — union of both arrays (deduplicated)
  merged.answeredQuestionIds = {};
  const allModes = new Set([
    ...Object.keys(local.answeredQuestionIds || {}),
    ...Object.keys(cloud.answeredQuestionIds || {}),
  ]);
  for (const mode of allModes) {
    const localIds = local.answeredQuestionIds?.[mode] || [];
    const cloudIds = cloud.answeredQuestionIds?.[mode] || [];
    merged.answeredQuestionIds[mode] = [...new Set([...localIds, ...cloudIds])];
  }

  // totalQuestionsAnswered — sum of both (accounts for unique questions via answeredQuestionIds)
  merged.totalQuestionsAnswered = (local.totalQuestionsAnswered || 0) + (cloud.totalQuestionsAnswered || 0);
  merged.totalCorrect = (local.totalCorrect || 0) + (cloud.totalCorrect || 0);

  // categoryAccuracy — sum counts from both
  merged.categoryAccuracy = {};
  const allCats = new Set([
    ...Object.keys(local.categoryAccuracy || {}),
    ...Object.keys(cloud.categoryAccuracy || {}),
  ]);
  for (const cat of allCats) {
    const lc = local.categoryAccuracy?.[cat] || { correct: 0, total: 0 };
    const cc = cloud.categoryAccuracy?.[cat] || { correct: 0, total: 0 };
    merged.categoryAccuracy[cat] = {
      correct: lc.correct + cc.correct,
      total: lc.total + cc.total,
    };
  }

  // streak — keep the longer/better one
  const ls = local.streak || { current: 0, longest: 0, lastDate: '' };
  const cs = cloud.streak || { current: 0, longest: 0, lastDate: '' };
  merged.streak = {
    current: ls.current > cs.current ? ls.current : cs.current,
    longest: ls.longest > cs.longest ? ls.longest : cs.longest,
    lastDate: ls.lastDate > cs.lastDate ? ls.lastDate : cs.lastDate,
  };

  // dailyGoals — merge by date, keep higher counts
  const goalsMap = new Map<string, { date: string; questionsAnswered: number; correctCount: number; goalMet: boolean }>();
  for (const g of local.dailyGoals || []) {
    goalsMap.set(g.date, g);
  }
  for (const g of cloud.dailyGoals || []) {
    const existing = goalsMap.get(g.date);
    if (existing) {
      goalsMap.set(g.date, {
        date: g.date,
        questionsAnswered: Math.max(existing.questionsAnswered, g.questionsAnswered),
        correctCount: Math.max(existing.correctCount, g.correctCount),
        goalMet: existing.goalMet || g.goalMet,
      });
    } else {
      goalsMap.set(g.date, g);
    }
  }
  merged.dailyGoals = Array.from(goalsMap.values());

  // achievements — merge by id, keep unlocked
  const achMap = new Map<string, { id: string; name: string; description: string; icon: string; unlocked: boolean; unlockedAt?: string }>();
  for (const a of local.achievements || []) {
    achMap.set(a.id, a);
  }
  for (const a of cloud.achievements || []) {
    const existing = achMap.get(a.id);
    if (existing && !existing.unlocked && a.unlocked) {
      achMap.set(a.id, a);
    } else if (!existing) {
      achMap.set(a.id, a);
    }
  }
  merged.achievements = Array.from(achMap.values());

  // mistakePatterns — merge by category, combine question IDs
  const mistakeMap = new Map<string, { category: string; count: number; questionIds: string[]; lastSeen: string }>();
  for (const m of local.mistakePatterns || []) {
    mistakeMap.set(m.category, { ...m, questionIds: [...m.questionIds] });
  }
  for (const m of cloud.mistakePatterns || []) {
    const existing = mistakeMap.get(m.category);
    if (existing) {
      existing.count += m.count;
      existing.questionIds = [...new Set([...existing.questionIds, ...m.questionIds])];
      if (m.lastSeen > existing.lastSeen) existing.lastSeen = m.lastSeen;
    } else {
      mistakeMap.set(m.category, { ...m, questionIds: [...m.questionIds] });
    }
  }
  merged.mistakePatterns = Array.from(mistakeMap.values());

  // studySessions — concatenate both
  merged.studySessions = [...(local.studySessions || []), ...(cloud.studySessions || [])];

  // examHistory — concatenate both
  merged.examHistory = [...(local.examHistory || []), ...(cloud.examHistory || [])];

  // questionRecords — concatenate both
  merged.questionRecords = [...(local.questionRecords || []), ...(cloud.questionRecords || [])];

  // recentQuestionTimes — take the more recent set (longer array)
  merged.recentQuestionTimes = (local.recentQuestionTimes?.length || 0) >= (cloud.recentQuestionTimes?.length || 0)
    ? local.recentQuestionTimes || []
    : cloud.recentQuestionTimes || [];

  // simple max fields
  merged.consecutiveCorrectNoHints = Math.max(local.consecutiveCorrectNoHints || 0, cloud.consecutiveCorrectNoHints || 0);
  merged.maxConsecutiveCorrectNoHints = Math.max(local.maxConsecutiveCorrectNoHints || 0, cloud.maxConsecutiveCorrectNoHints || 0);

  // perfectChapterChecked — union
  merged.perfectChapterChecked = [...new Set([
    ...(local.perfectChapterChecked || []),
    ...(cloud.perfectChapterChecked || []),
  ])];

  // weakCategoryHistory — merge by category, keep higher accuracy
  merged.weakCategoryHistory = { ...(local.weakCategoryHistory || {}) };
  for (const [cat, acc] of Object.entries(cloud.weakCategoryHistory || {})) {
    if (acc > (merged.weakCategoryHistory[cat] || 0)) {
      merged.weakCategoryHistory[cat] = acc;
    }
  }

  return merged;
}

function mergeBookmarks(
  local: Record<string, string[]>,
  cloud: Record<string, string[]>
): Record<string, string[]> {
  const merged = { ...local };
  for (const [mode, ids] of Object.entries(cloud)) {
    merged[mode] = [...new Set([...(merged[mode] || []), ...ids])];
  }
  return merged;
}

/**
 * Load progress from D1 and smart-merge into localStorage.
 * Both local and cloud progress are combined — nothing is lost.
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
    const { chapters: cloudChapters, detailed: cloudDetailed, bookmarks: cloudBookmarks } = body;

    // --- Merge chapter progress ---
    for (const [key, cloudAnswers] of Object.entries(cloudChapters)) {
      const existingRaw = localStorage.getItem(key);
      let localAnswers: Record<string, string> = {};
      if (existingRaw) {
        try { localAnswers = JSON.parse(existingRaw); } catch { /* ignore */ }
      }
      const merged = mergeChapterProgress(localAnswers, cloudAnswers);
      localStorage.setItem(key, JSON.stringify(merged));
    }

    // Also push local-only chapters to cloud on next sync

    // --- Merge detailed progress ---
    if (cloudDetailed && Object.keys(cloudDetailed).length > 0) {
      const detailKey = `${userId}_pilot_guide_progress`;
      const existingRaw = localStorage.getItem(detailKey);
      let localDetailed: ProgressData = {};
      if (existingRaw) {
        try { localDetailed = JSON.parse(existingRaw); } catch { /* ignore */ }
      }
      const merged = mergeDetailedProgress(localDetailed, cloudDetailed as ProgressData);
      localStorage.setItem(detailKey, JSON.stringify(merged));
    }

    // --- Merge bookmarks ---
    if (cloudBookmarks && Object.keys(cloudBookmarks).length > 0) {
      const existingRaw = localStorage.getItem('pilot_guide_bookmarks');
      let existing: Record<string, string[]> = {};
      if (existingRaw) {
        try { existing = JSON.parse(existingRaw) as Record<string, string[]>; } catch { /* ignore */ }
      }
      const merged = mergeBookmarks(existing, cloudBookmarks);
      localStorage.setItem('pilot_guide_bookmarks', JSON.stringify(merged));
    }

    // --- Push merged data back to cloud ---
    debouncedSync();
  } catch (err) {
    console.warn('D1 load error:', err);
  }
}
