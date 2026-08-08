/**
 * Export/import progress data for cross-device transfer.
 */

import { getProgress, getWeakCategories, getOverallAccuracy } from './progressTracker';
import { getBookmarks } from './bookmarks';

function collectAllProgressData(): Record<string, string> {
  const data: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const val = localStorage.getItem(key);
      if (val !== null) data[key] = val;
    }
  }
  return data;
}

export function exportProgressFile(): void {
  const data = collectAllProgressData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `atplvector-progress-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importProgressFile(file: File): Promise<{ imported: number; total: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as Record<string, string>;
        let count = 0;
        const total = Object.keys(data).length;
        for (const [key, val] of Object.entries(data)) {
          localStorage.setItem(key, val);
          count++;
        }
        resolve({ imported: count, total });
      } catch {
        reject(new Error('Invalid progress file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Export progress report as a text file.
 */
export function exportProgressReport(mode: string = 'ppl'): void {
  const progress = getProgress();
  const weakCategories = getWeakCategories();
  const overallAccuracy = getOverallAccuracy();
  const bookmarks = getBookmarks(mode);

  const lines: string[] = [];
  const sep = '═'.repeat(50);

  lines.push(sep);
  lines.push('  PILOT TEST GUIDE — PROGRESS REPORT');
  lines.push(`  Generated: ${new Date().toLocaleString()}`);
  lines.push(`  Mode: ${mode.toUpperCase()}`);
  lines.push(sep);
  lines.push('');

  lines.push('📊 OVERALL STATISTICS');
  lines.push('─'.repeat(30));
  lines.push(`  Total Questions Answered: ${progress.totalQuestionsAnswered}`);
  lines.push(`  Correct Answers: ${progress.totalCorrect}`);
  lines.push(`  Overall Accuracy: ${Math.round(overallAccuracy * 100)}%`);
  lines.push('');

  lines.push('🔥 STUDY STREAK');
  lines.push('─'.repeat(30));
  lines.push(`  Current Streak: ${progress.streak.current} day(s)`);
  lines.push(`  Longest Streak: ${progress.streak.longest} day(s)`);
  lines.push('');

  const todayGoal = progress.dailyGoals.find(g => g.date === new Date().toISOString().slice(0, 10));
  if (todayGoal) {
    lines.push('🎯 TODAY\'S PROGRESS');
    lines.push('─'.repeat(30));
    lines.push(`  Questions Answered: ${todayGoal.questionsAnswered}`);
    lines.push(`  Correct: ${todayGoal.correctCount}`);
    lines.push(`  Daily Goal Met: ${todayGoal.goalMet ? 'Yes ✓' : 'No'}`);
    lines.push('');
  }

  lines.push('📈 CATEGORY ACCURACY');
  lines.push('─'.repeat(30));
  const sortedCats = Object.entries(progress.categoryAccuracy)
    .sort(([, a], [, b]) => b.total - a.total);
  
  for (const [cat, { correct, total }] of sortedCats) {
    const acc = total > 0 ? Math.round((correct / total) * 100) : 0;
    const bar = '█'.repeat(Math.round(acc / 5)) + '░'.repeat(20 - Math.round(acc / 5));
    lines.push(`  ${cat}`);
    lines.push(`    ${bar} ${acc}% (${correct}/${total})`);
  }
  lines.push('');

  if (weakCategories.length > 0) {
    lines.push('⚠️  WEAK CATEGORIES (Below 60%)');
    lines.push('─'.repeat(30));
    for (const { category, accuracy, attempts } of weakCategories) {
      lines.push(`  ${category}: ${Math.round(accuracy * 100)}% accuracy (${attempts} attempts)`);
    }
    lines.push('');
  }

  const unlocked = progress.achievements.filter(a => a.unlocked);
  const locked = progress.achievements.filter(a => !a.unlocked);
  lines.push('🏆 ACHIEVEMENTS');
  lines.push('─'.repeat(30));
  lines.push(`  Unlocked: ${unlocked.length} / ${progress.achievements.length}`);
  for (const a of unlocked) {
    lines.push(`  ✓ ${a.name} — ${a.description}`);
  }
  if (locked.length > 0) {
    lines.push('');
    lines.push('  Locked:');
    for (const a of locked) {
      lines.push(`  ○ ${a.name} — ${a.description}`);
    }
  }
  lines.push('');

  if (bookmarks.length > 0) {
    lines.push('🔖 BOOKMARKED QUESTIONS');
    lines.push('─'.repeat(30));
    for (const id of bookmarks) {
      lines.push(`  • ${id}`);
    }
    lines.push('');
  }

  if (progress.studySessions.length > 0) {
    lines.push('📅 STUDY HISTORY');
    lines.push('─'.repeat(30));
    const recentSessions = progress.studySessions.slice(-10).reverse();
    for (const session of recentSessions) {
      const acc = session.questionsAnswered > 0
        ? Math.round((session.correctCount / session.questionsAnswered) * 100)
        : 0;
      lines.push(`  ${session.date}: ${session.questionsAnswered} questions, ${acc}% accuracy, ~${session.durationMinutes} min`);
    }
  }

  lines.push('');
  lines.push(sep);
  lines.push('  Keep up the great work! ✈️');
  lines.push(sep);

  const content = lines.join('\n');
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pilot-progress-${mode}-${new Date().toISOString().slice(0, 10)}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
