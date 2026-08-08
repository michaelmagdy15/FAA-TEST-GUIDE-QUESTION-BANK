import React, { useState, useEffect } from 'react';
import { LandingView } from './components/LandingView';
import { QuestionView } from './components/QuestionView';
import { C172Hub } from './components/c172/C172Hub';
import { useTestProgress } from './hooks/useTestProgress';
import { Question, TestMode } from './types';
import { getQuestionsForBank } from './lib/questionsData';

// PPL chapter titles
const pplChapterTitles: Record<string, string> = {
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
  "11": "Flying Cross-Country",
  "12": "Regulations & Airspace"
};

// IR chapter titles
const irChapterTitles: Record<string, string> = {
  "1": "IFR Regulations & Pilot Requirements",
  "2": "IFR Flight Planning & Weather Services",
  "3": "Meteorology & Weather Products",
  "4": "IFR En Route Operations",
  "5": "IFR Approach Procedures & Minima",
  "6": "Navigation Systems & GPS",
  "7": "Aircraft Instruments & Avionics",
  "8": "Aeromedical Factors & ADM",
};

// CPL chapter titles (chapters match source PDF chapter numbers)
const cplChapterTitles: Record<string, string> = {
  "1":  "Pilot Qualifications & Regulations",
  "2":  "Aircraft Systems",
  "3":  "Preflight & Weather Services",
  "9":  "Flight Planning & Performance",
  "11": "Advanced Systems",
  "12": "Aerodynamics & Performance Limitations",
  "13": "Navigation & Cross-Country",
  "14": "Maneuvers & Emergency Procedures",
};

// IDs are prefixed: "ppl-4-59" → chapter "4"
const getChapter = (id: string) => id.split('-')[1] ?? id.split('-')[0];

const getChapters = (data: Question[], titleMap: Record<string, string>) => {
  const chapterMap = new Map<string, number>();
  data.forEach((q: Question) => {
    const chap = getChapter(q.id);
    chapterMap.set(chap, (chapterMap.get(chap) || 0) + 1);
  });
  return Array.from(chapterMap.entries())
    .map(([id, total]) => ({
      id,
      title: titleMap[id] || `Chapter ${id}`,
      total
    }))
    .sort((a, b) => parseInt(a.id) - parseInt(b.id));
};

const titleMap: Record<TestMode, Record<string, string>> = {
  ppl: pplChapterTitles,
  ir: irChapterTitles,
  cpl: cplChapterTitles,
  c172: {},
};

const prefixMap: Record<TestMode, string> = {
  ppl: 'progress',
  ir: 'ir_progress',
  cpl: 'cpl_progress',
  c172: 'c172_progress',
};

export const App: React.FC = () => {
  const [mode, setMode] = useState<TestMode>('ppl');
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [questionsData, setQuestionsData] = useState<Question[]>(() => getQuestionsForBank('ppl'));

  const progressPrefix = prefixMap[mode];
  const chapters = getChapters(questionsData, titleMap[mode]);

  const { chapterProgress, reviewQuestions, resetAllProgress, resetChapterProgress } = useTestProgress(
    progressPrefix,
    questionsData,
    selectedChapter,
    reviewMode
  );

  useEffect(() => {
    setQuestionsData(getQuestionsForBank(mode));
  }, [mode]);

  const handleModeSwitch = (newMode: TestMode) => {
    setMode(newMode);
    setSelectedChapter(null);
    setReviewMode(false);
  };

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
    currentQuestions = questionsData.filter((q: Question) =>
      getChapter(q.id) === selectedChapter
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      {mode === 'c172' ? (
        <C172Hub onModeSwitch={handleModeSwitch} />
      ) : !selectedChapter ? (
        <LandingView
          mode={mode}
          onModeSwitch={handleModeSwitch}
          chapters={chapters}
          onSelect={handleSelectChapter}
          onReview={handleSelectReview}
          totalQuestions={questionsData.length}
          reviewCount={reviewQuestions.length}
          chapterProgress={chapterProgress}
          onResetAll={resetAllProgress}
          onResetChapter={resetChapterProgress}
        />
      ) : (
        <QuestionView
          chapter={selectedChapter}
          questions={currentQuestions}
          onBack={handleBack}
          mode={mode}
          progressPrefix={progressPrefix}
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
