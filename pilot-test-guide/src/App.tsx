import React, { useState, useEffect } from 'react';
import { LandingView } from './components/LandingView';
import { QuestionView } from './components/QuestionView';
import pplQuestionsData from './data/questions.json';
import irQuestionsData from './data/ir_questions.json';
import cplQuestionsData from './data/cpl_questions.json';
import { Question, TestMode } from './types';

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
  "11": "Flying Cross-Country"
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

// CPL chapter titles
const cplChapterTitles: Record<string, string> = {
  "1": "Building Professional Experience",
  "2": "Airplane Systems",
  "3": "Meteorology for Commercial Pilots",
  "4": "IFR En Route & Navigation",
  "5": "Aerodynamics & Performance",
  "6": "Takeoff, Landing & Ground Operations",
  "7": "Emergency Procedures",
  "8": "Aeromedical Factors & Human Performance",
};

const getChapters = (data: any[], titleMap: Record<string, string>) => {
  const chapterMap = new Map<string, number>();
  data.forEach((q: any) => {
    const chap = q.id.split('-')[0];
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

const dataMap: Record<TestMode, any[]> = {
  ppl: pplQuestionsData as any[],
  ir: irQuestionsData as any[],
  cpl: cplQuestionsData as any[],
};

const titleMap: Record<TestMode, Record<string, string>> = {
  ppl: pplChapterTitles,
  ir: irChapterTitles,
  cpl: cplChapterTitles,
};

const prefixMap: Record<TestMode, string> = {
  ppl: 'progress',
  ir: 'ir_progress',
  cpl: 'cpl_progress',
};

export const App: React.FC = () => {
  const [mode, setMode] = useState<TestMode>('ppl');
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewQuestions, setReviewQuestions] = useState<Question[]>([]);

  const questionsData = dataMap[mode];
  const progressPrefix = prefixMap[mode];
  const chapters = getChapters(questionsData, titleMap[mode]);

  useEffect(() => {
    if (!selectedChapter && !reviewMode) {
      const allProgress: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${progressPrefix}_`) && key !== `${progressPrefix}_REVIEW`) {
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
  }, [selectedChapter, reviewMode, mode]);

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
    currentQuestions = questionsData.filter((q: any) =>
      q.id.startsWith(`${selectedChapter}-`)
    ) as Question[];
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!selectedChapter ? (
        <LandingView
          mode={mode}
          onModeSwitch={handleModeSwitch}
          chapters={chapters}
          onSelect={handleSelectChapter}
          onReview={handleSelectReview}
          totalQuestions={questionsData.length}
          reviewCount={reviewQuestions.length}
          progressPrefix={progressPrefix}
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
