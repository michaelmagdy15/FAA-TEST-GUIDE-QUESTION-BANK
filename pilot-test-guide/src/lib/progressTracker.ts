/**
 * Progress tracking: streaks, daily goals, achievements, mistake patterns.
 * All data persisted to localStorage.
 */

export interface DailyGoal {
  date: string;       // "2026-08-08"
  questionsAnswered: number;
  correctCount: number;
  goalMet: boolean;
}

export interface Streak {
  current: number;
  longest: number;
  lastDate: string;   // "2026-08-08"
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface MistakePattern {
  category: string;
  count: number;
  questionIds: string[];
  lastSeen: string;
}

export interface StudySession {
  date: string;
  durationMinutes: number;
  questionsAnswered: number;
  correctCount: number;
}

export interface ExamRecord {
  id: string;
  mode: string;
  type: 'quiz' | 'exam';
  date: string;
  totalQuestions: number;
  correctAnswers: number;
  timeSpentSeconds: number;
  passed: boolean;
  category?: string;
}

export interface QuestionRecord {
  questionId: string;
  mode: string;
  isCorrect: boolean;
  timeSeconds: number;
  timestamp: string;
}

export interface ProgressData {
  streak: Streak;
  dailyGoals: DailyGoal[];
  achievements: Achievement[];
  mistakePatterns: MistakePattern[];
  studySessions: StudySession[];
  totalQuestionsAnswered: number;
  totalCorrect: number;
  categoryAccuracy: Record<string, { correct: number; total: number }>;
  // Achievement tracking
  recentQuestionTimes: number[];
  consecutiveCorrectNoHints: number;
  maxConsecutiveCorrectNoHints: number;
  perfectChapterChecked: string[];
  weakCategoryHistory: Record<string, number>;
  // Exam & quiz tracking
  examHistory: ExamRecord[];
  questionRecords: QuestionRecord[];
  answeredQuestionIds: Record<string, string[]>;  // mode -> question IDs answered correctly
}

import { debouncedSync } from './cloudflareSync';

const DAILY_GOAL_TARGET = 15;

let _userId: string | null = null;

export function setProgressUserId(userId: string | null): void {
  _userId = userId;
}

function getStorageKey(): string {
  return _userId ? `${_userId}_pilot_guide_progress` : 'pilot_guide_progress';
}

// ---- Default data ----

function getDefaultAchievements(): Achievement[] {
  return [
    { id: "first-10", name: "Getting Started", description: "Answer your first 10 questions", icon: "1", unlocked: false },
    { id: "first-50", name: "On a Roll", description: "Answer 50 questions total", icon: "50", unlocked: false },
    { id: "first-100", name: "Century Club", description: "Answer 100 questions total", icon: "100", unlocked: false },
    { id: "first-500", name: "Halfway There", description: "Answer 500 questions total", icon: "500", unlocked: false },
    { id: "streak-3", name: "Hat Trick", description: "3-day study streak", icon: "3d", unlocked: false },
    { id: "streak-7", name: "Week Warrior", description: "7-day study streak", icon: "7d", unlocked: false },
    { id: "streak-14", name: "Dedicated Pilot", description: "14-day study streak", icon: "14d", unlocked: false },
    { id: "streak-30", name: "Flight Commander", description: "30-day study streak", icon: "30d", unlocked: false },
    { id: "perfect-chapter", name: "Perfect Score", description: "100% on a chapter quiz", icon: "A+", unlocked: false },
    { id: "speed-demon", name: "Speed Demon", description: "Answer 10 questions in under 2 minutes", icon: "⚡", unlocked: false },
    { id: "no-hints", name: "No Hints Needed", description: "Answer 20 questions in a row without using reasoning chains", icon: "🧠", unlocked: false },
    { id: "weak-conqueror", name: "Weak Conqueror", description: "Improve accuracy in a weak category by 20%", icon: "📈", unlocked: false },
    { id: "all-categories", name: "Well Rounded", description: "Study all 12 PPL categories", icon: "🎯", unlocked: false },
    { id: "night-owl", name: "Night Owl", description: "Study between midnight and 5 AM", icon: "🦉", unlocked: false },
    { id: "early-bird", name: "Early Bird", description: "Study before 6 AM", icon: "🐦", unlocked: false },
  ];
}

function getDefaultProgress(): ProgressData {
  return {
    streak: { current: 0, longest: 0, lastDate: "" },
    dailyGoals: [],
    achievements: getDefaultAchievements(),
    mistakePatterns: [],
    studySessions: [],
    totalQuestionsAnswered: 0,
    totalCorrect: 0,
    categoryAccuracy: {},
    recentQuestionTimes: [],
    consecutiveCorrectNoHints: 0,
    maxConsecutiveCorrectNoHints: 0,
    perfectChapterChecked: [],
    weakCategoryHistory: {},
    examHistory: [],
    questionRecords: [],
    answeredQuestionIds: {},
  };
}

// ---- Storage helpers ----

function loadProgress(): ProgressData {
  try {
    const raw = localStorage.getItem(getStorageKey());
    if (raw) {
      const data = JSON.parse(raw) as ProgressData;
      // Ensure all fields exist (migration)
      if (!data.achievements) data.achievements = getDefaultAchievements();
      if (!data.mistakePatterns) data.mistakePatterns = [];
      if (!data.studySessions) data.studySessions = [];
      if (!data.categoryAccuracy) data.categoryAccuracy = {};
      if (!data.recentQuestionTimes) data.recentQuestionTimes = [];
      if (data.consecutiveCorrectNoHints === undefined) data.consecutiveCorrectNoHints = 0;
      if (data.maxConsecutiveCorrectNoHints === undefined) data.maxConsecutiveCorrectNoHints = 0;
      if (!data.perfectChapterChecked) data.perfectChapterChecked = [];
      if (!data.weakCategoryHistory) data.weakCategoryHistory = {};
      if (!data.examHistory) data.examHistory = [];
      if (!data.questionRecords) data.questionRecords = [];
      if (!data.answeredQuestionIds) data.answeredQuestionIds = {};
      return data;
    }
  } catch { /* ignore */ }
  return getDefaultProgress();
}

function saveProgress(data: ProgressData): void {
  localStorage.setItem(getStorageKey(), JSON.stringify(data));
  debouncedSync();
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

// ---- Public API ----

export function getProgress(): ProgressData {
  return loadProgress();
}

export function recordAnswer(
  questionId: string,
  category: string | undefined,
  isCorrect: boolean,
  timeSeconds: number,
  usedReasoningChain: boolean = false
): ProgressData {
  const data = loadProgress();
  const today = todayStr();
  const cat = category || "Unknown";

  // Idempotency guard: skip if this question was already recorded
  const recordedKey = '_recordedQuestionIds';
  if (!(data as any)[recordedKey]) (data as any)[recordedKey] = [];
  if ((data as any)[recordedKey].includes(questionId)) {
    return data; // Already recorded, skip incrementing
  }
  (data as any)[recordedKey].push(questionId);
  // Keep the list bounded to prevent unbounded growth
  if ((data as any)[recordedKey].length > 2000) {
    (data as any)[recordedKey] = (data as any)[recordedKey].slice(-1500);
  }

  // Update totals
  data.totalQuestionsAnswered++;
  if (isCorrect) data.totalCorrect++;

  // Update category accuracy
  if (!data.categoryAccuracy[cat]) {
    data.categoryAccuracy[cat] = { correct: 0, total: 0 };
  }
  data.categoryAccuracy[cat].total++;
  if (isCorrect) data.categoryAccuracy[cat].correct++;

  // Update streak
  if (data.streak.lastDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    if (data.streak.lastDate === yesterdayStr) {
      data.streak.current++;
    } else if (data.streak.lastDate !== today) {
      data.streak.current = 1;
    }
    data.streak.lastDate = today;
    if (data.streak.current > data.streak.longest) {
      data.streak.longest = data.streak.current;
    }
  }

  // Update daily goal
  let dailyGoal = data.dailyGoals.find(g => g.date === today);
  if (!dailyGoal) {
    dailyGoal = { date: today, questionsAnswered: 0, correctCount: 0, goalMet: false };
    data.dailyGoals.push(dailyGoal);
  }
  dailyGoal.questionsAnswered++;
  if (isCorrect) dailyGoal.correctCount++;
  if (dailyGoal.questionsAnswered >= DAILY_GOAL_TARGET && !dailyGoal.goalMet) {
    dailyGoal.goalMet = true;
  }

  // Track recent question times for speed-demon achievement (keep last 15)
  data.recentQuestionTimes.push(timeSeconds);
  if (data.recentQuestionTimes.length > 15) {
    data.recentQuestionTimes = data.recentQuestionTimes.slice(-15);
  }

  // Track consecutive correct answers without reasoning chain for no-hints achievement
  if (isCorrect && !usedReasoningChain) {
    data.consecutiveCorrectNoHints++;
    if (data.consecutiveCorrectNoHints > data.maxConsecutiveCorrectNoHints) {
      data.maxConsecutiveCorrectNoHints = data.consecutiveCorrectNoHints;
    }
  } else if (!isCorrect || usedReasoningChain) {
    data.consecutiveCorrectNoHints = 0;
  }

  // Track weak category history for weak-conqueror achievement
  if (cat && data.categoryAccuracy[cat]) {
    const acc = data.categoryAccuracy[cat];
    data.weakCategoryHistory[cat] = acc.total > 0 ? acc.correct / acc.total : 1;
  }

  // Track mistake patterns
  if (!isCorrect) {
    const existing = data.mistakePatterns.find(p => p.category === cat);
    if (existing) {
      if (!existing.questionIds.includes(questionId)) {
        existing.questionIds.push(questionId);
      }
      existing.count++;
      existing.lastSeen = today;
    } else {
      data.mistakePatterns.push({
        category: cat,
        count: 1,
        questionIds: [questionId],
        lastSeen: today,
      });
    }
  }

  // Update study sessions (group by day)
  let session = data.studySessions.find(s => s.date === today);
  if (!session) {
    session = { date: today, durationMinutes: 0, questionsAnswered: 0, correctCount: 0 };
    data.studySessions.push(session);
  }
  session.questionsAnswered++;
  if (isCorrect) session.correctCount++;
  session.durationMinutes = Math.max(session.durationMinutes, Math.ceil(timeSeconds / 60));

  // Check achievements
  checkAchievements(data);

  saveProgress(data);
  return data;
}

function checkAchievements(data: ProgressData): void {
  const now = new Date().toISOString();
  const hour = new Date().getHours();

  const unlock = (id: string) => {
    const a = data.achievements.find(x => x.id === id);
    if (a && !a.unlocked) {
      a.unlocked = true;
      a.unlockedAt = now;
    }
  };

  if (data.totalQuestionsAnswered >= 10) unlock("first-10");
  if (data.totalQuestionsAnswered >= 50) unlock("first-50");
  if (data.totalQuestionsAnswered >= 100) unlock("first-100");
  if (data.totalQuestionsAnswered >= 500) unlock("first-500");
  if (data.streak.current >= 3) unlock("streak-3");
  if (data.streak.current >= 7) unlock("streak-7");
  if (data.streak.current >= 14) unlock("streak-14");
  if (data.streak.current >= 30) unlock("streak-30");

  const today = todayStr();
  const todayGoal = data.dailyGoals.find(g => g.date === today);
  if (todayGoal && todayGoal.questionsAnswered >= 10 && todayGoal.correctCount === todayGoal.questionsAnswered) {
    // All correct in a session — check if it was a chapter
  }

  // Speed Demon: answer 10 questions in under 2 minutes total
  if (data.recentQuestionTimes.length >= 10) {
    const last10 = data.recentQuestionTimes.slice(-10);
    const totalTime = last10.reduce((sum, t) => sum + t, 0);
    if (totalTime < 120) {
      unlock("speed-demon");
    }
  }

  // No Hints Needed: answer 20 questions in a row without using reasoning chains
  if (data.maxConsecutiveCorrectNoHints >= 20) {
    unlock("no-hints");
  }

  // Weak Conqueror: improve accuracy in a weak category by 20%
  for (const [cat, currentAcc] of Object.entries(data.categoryAccuracy)) {
    const prevAcc = data.weakCategoryHistory[cat];
    if (prevAcc !== undefined && currentAcc.total >= 5) {
      const currentAccuracy = currentAcc.correct / currentAcc.total;
      if (currentAccuracy - prevAcc >= 0.2) {
        unlock("weak-conqueror");
        break;
      }
    }
  }

  if (hour >= 0 && hour < 5) unlock("night-owl");
  if (hour >= 4 && hour < 6) unlock("early-bird");

  const catsStudied = new Set(Object.keys(data.categoryAccuracy));
  if (catsStudied.size >= 12) unlock("all-categories");
}

export function getTodayGoal(): { answered: number; target: number; met: boolean; correct: number } {
  const data = loadProgress();
  const today = todayStr();
  const goal = data.dailyGoals.find(g => g.date === today);
  return {
    answered: goal?.questionsAnswered || 0,
    target: DAILY_GOAL_TARGET,
    met: goal?.goalMet || false,
    correct: goal?.correctCount || 0,
  };
}

export function getWeakCategories(threshold: number = 0.6): { category: string; accuracy: number; attempts: number }[] {
  const data = loadProgress();
  return Object.entries(data.categoryAccuracy)
    .map(([cat, { correct, total }]) => ({
      category: cat,
      accuracy: total > 0 ? correct / total : 1,
      attempts: total,
    }))
    .filter(c => c.attempts >= 3 && c.accuracy < threshold)
    .sort((a, b) => a.accuracy - b.accuracy);
}

export function getOverallAccuracy(): number {
  const data = loadProgress();
  return data.totalQuestionsAnswered > 0
    ? data.totalCorrect / data.totalQuestionsAnswered
    : 0;
}

export function getStudyStreak(): number {
  return loadProgress().streak.current;
}

/**
 * Record chapter completion — checks for perfect-score achievement.
 * Call this when a user completes all questions in a chapter with 100% accuracy.
 */
export function recordChapterComplete(
  chapterId: string,
  totalQuestions: number,
  correctAnswers: number
): void {
  if (totalQuestions <= 0 || correctAnswers < totalQuestions) return;

  const data = loadProgress();
  if (data.perfectChapterChecked.includes(chapterId)) return;

  data.perfectChapterChecked.push(chapterId);

  // Unlock perfect chapter achievement
  const a = data.achievements.find(x => x.id === "perfect-chapter");
  if (a && !a.unlocked) {
    a.unlocked = true;
    a.unlockedAt = new Date().toISOString();
  }

  saveProgress(data);
}

export function resetProgress(): void {
  saveProgress(getDefaultProgress());
}

// ---- Exam & Quiz API ----

export function recordExam(record: Omit<ExamRecord, 'id'>): void {
  const data = loadProgress();
  const id = `exam-${Date.now()}`;
  data.examHistory.push({ ...record, id });
  saveProgress(data);
}

export function recordQuestionAnswer(record: QuestionRecord): void {
  const data = loadProgress();
  data.questionRecords.push(record);
  // Track unique answered IDs per mode
  if (!data.answeredQuestionIds[record.mode]) {
    data.answeredQuestionIds[record.mode] = [];
  }
  if (record.isCorrect && !data.answeredQuestionIds[record.mode].includes(record.questionId)) {
    data.answeredQuestionIds[record.mode].push(record.questionId);
  }
  saveProgress(data);
}

export function getExamHistory(): ExamRecord[] {
  return loadProgress().examHistory;
}

export function getAnsweredCount(mode: string): number {
  const data = loadProgress();
  return data.answeredQuestionIds[mode]?.length || 0;
}

export function getAnsweredIds(mode: string): string[] {
  const data = loadProgress();
  return data.answeredQuestionIds[mode] || [];
}

export function getCategoryStats(): { category: string; correct: number; total: number; accuracy: number }[] {
  const data = loadProgress();
  return Object.entries(data.categoryAccuracy)
    .map(([cat, { correct, total }]) => ({
      category: cat,
      correct,
      total,
      accuracy: total > 0 ? correct / total : 0,
    }))
    .filter(c => c.total > 0)
    .sort((a, b) => a.accuracy - b.accuracy);
}
