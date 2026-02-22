import React, { useState, useEffect } from 'react';
import { LandingView } from './components/LandingView';
import { QuestionView } from './components/QuestionView';
import questionsData from './data/questions.json';
import { Question } from './types';

// Extract unique chapters and sort them
const getChapters = () => {
  const chapterMap = new Map<string, number>();
  questionsData.forEach((q: any) => {
    const chap = q.id.split('-')[0];
    chapterMap.set(chap, (chapterMap.get(chap) || 0) + 1);
  });

  const chapterTitles: Record<string, string> = {
    "1": "Discovering Aviation",
    "2": "Airplane Systems",
    "3": "Aerodynamic Principles",
    "4": "The Flight Environment",
    "5": "Communication and Flight Information",
    "6": "Meteorology for Pilots",
    "7": "Interpreting Weather Data",
    "8": "Airplane Performance",
    "9": "Navigation",
    "10": "Human Factors",
    "11": "Flying Cross-Country"
  };

  return Array.from(chapterMap.entries())
    .map(([id, total]) => ({
      id,
      title: chapterTitles[id] || "Chapter",
      total
    }))
    .sort((a, b) => parseInt(a.id) - parseInt(b.id));
};

export const App: React.FC = () => {
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewQuestions, setReviewQuestions] = useState<Question[]>([]);

  const chapters = getChapters();

  useEffect(() => {
    if (!selectedChapter && !reviewMode) {
      // Calculate incorrect questions when returning to landing
      const allProgress: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('progress_') && key !== 'progress_REVIEW') {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          Object.assign(allProgress, data);
        }
      }

      const incorrect = questionsData.filter((q: any) => {
        const ans = allProgress[q.id];
        return ans !== undefined && ans !== q.correct;
      }) as Question[];

      setReviewQuestions(incorrect);
    }
  }, [selectedChapter, reviewMode]);

  const handleSelectChapter = (chapter: string) => {
    setSelectedChapter(chapter);
    setReviewMode(false);
  };

  const handleSelectReview = () => {
    if (reviewQuestions.length > 0) {
      setSelectedChapter('REVIEW');
      setReviewMode(true);
    }
  };

  const handleBack = () => {
    setSelectedChapter(null);
    setReviewMode(false);
  };

  let currentQuestions: Question[] = [];
  if (reviewMode) {
    currentQuestions = reviewQuestions;
  } else if (selectedChapter) {
    currentQuestions = questionsData.filter((q: any) =>
      q.id.startsWith(`${selectedChapter}-`)
    ) as Question[];
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!selectedChapter ? (
        <LandingView
          chapters={chapters}
          onSelect={handleSelectChapter}
          onReview={handleSelectReview}
          totalQuestions={questionsData.length}
          reviewCount={reviewQuestions.length}
        />
      ) : (
        <QuestionView
          chapter={selectedChapter}
          questions={currentQuestions}
          onBack={handleBack}
        />
      )}

      {/* Global Copyright Footer */}
      <footer style={{ marginTop: 'auto', textAlign: 'center', paddingTop: '2rem', paddingBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', opacity: 0.6 }}>
        &copy; {new Date().getFullYear()} Egyptian Aviation Academy. Created by Michael Mitry.
      </footer>
    </div>
  );
};

export default App;
