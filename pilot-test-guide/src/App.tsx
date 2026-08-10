import React, { useState, useEffect, lazy } from 'react';
import { ClerkProvider } from '@clerk/clerk-react';
import { LandingView } from './components/LandingView';
import { QuestionView } from './components/QuestionView';
import { C172Hub } from './components/c172/C172Hub';
import { QuizMode } from './components/QuizMode';
import { QuizSetup } from './components/QuizSetup';
import { PracticeExam } from './components/PracticeExam';
import { KeyboardHelp } from './components/KeyboardHelp';
import { Preloader } from './components/Preloader';
import { AuthWrapper } from './components/AuthWrapper';
import { useUserProgress } from './hooks/useUserProgress';
import { useTestProgress } from './hooks/useTestProgress';
import { Question, TestMode } from './types';
import { getQuestionsForBank } from './lib/questionsData';

const PPLStudyGuide = lazy(() => import('./components/ppl-guide/PPLStudyGuide').then(m => ({ default: m.PPLStudyGuide })));

const pplChapterTitles: Record<string, string> = {
  "1": "Discovering Aviation", "2": "Airplane Systems", "3": "Aerodynamic Principles",
  "4": "The Flight Environment", "5": "Communication and Flight Information",
  "6": "Meteorology for Pilots", "7": "Interpreting Weather Data", "8": "Airplane Performance",
  "9": "Navigation", "10": "Human Factors", "11": "Flying Cross-Country", "12": "Regulations & Airspace"
};
const irChapterTitles: Record<string, string> = {
  "1": "IFR Regulations & Pilot Requirements", "2": "IFR Flight Planning & Weather Services",
  "3": "Meteorology & Weather Products", "4": "IFR En Route Operations",
  "5": "IFR Approach Procedures & Minima", "6": "Navigation Systems & GPS",
  "7": "Aircraft Instruments & Avionics", "8": "Aeromedical Factors & ADM",
};
const cplChapterTitles: Record<string, string> = {
  "1": "Pilot Qualifications & Regulations", "2": "Aircraft Systems",
  "3": "Preflight & Weather Services", "9": "Flight Planning & Performance",
  "11": "Advanced Systems", "12": "Aerodynamics & Performance Limitations",
  "13": "Navigation & Cross-Country", "14": "Maneuvers & Emergency Procedures",
};

const getChapter = (id: string) => id.split('-')[1] ?? id.split('-')[0];

const getChapters = (data: Question[], titleMap: Record<string, string>) => {
  const chapterMap = new Map<string, number>();
  data.forEach((q: Question) => {
    const chap = getChapter(q.id);
    chapterMap.set(chap, (chapterMap.get(chap) || 0) + 1);
  });
  return Array.from(chapterMap.entries())
    .map(([id, total]) => ({ id, title: titleMap[id] || `Chapter ${id}`, total }))
    .sort((a, b) => parseInt(a.id) - parseInt(b.id));
};

const titleMap: Record<TestMode, Record<string, string>> = {
  ppl: pplChapterTitles, ir: irChapterTitles, cpl: cplChapterTitles, c172: {},
};
const prefixMap: Record<TestMode, string> = {
  ppl: 'progress', ir: 'ir_progress', cpl: 'cpl_progress', c172: 'c172_progress',
};

type ViewMode = 'landing' | 'chapter' | 'quiz-setup' | 'quiz' | 'exam' | 'ppl-study';

const AppContent: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<TestMode>('ppl');
  const [viewMode, setViewMode] = useState<ViewMode>('landing');
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [questionsData, setQuestionsData] = useState<Question[]>(() => getQuestionsForBank('ppl'));
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [quizCategory, setQuizCategory] = useState('all');
  const [examType, setExamType] = useState<'ppl' | 'ir' | 'cpl'>('ppl');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  const progressPrefix = prefixMap[mode];
  const chapters = getChapters(questionsData, titleMap[mode]);

  const { chapterProgress, reviewQuestions, resetAllProgress, resetChapterProgress } = useUserProgress(
    progressPrefix, questionsData, selectedChapter, reviewMode
  );

  useEffect(() => { setQuestionsData(getQuestionsForBank(mode)); }, [mode]);

  const handleModeSwitch = (newMode: TestMode) => {
    setMode(newMode);
    setViewMode('landing');
    setSelectedChapter(null);
    setReviewMode(false);
  };

  const handleSelectChapter = (chapter: string) => {
    setSelectedChapter(chapter);
    setReviewMode(false);
    setViewMode('chapter');
  };

  const handleSelectReview = () => {
    if (reviewQuestions.length > 0) {
      setSelectedChapter('REVIEW');
      setReviewMode(true);
      setViewMode('chapter');
    }
  };

  const handleBack = () => {
    setViewMode('landing');
    setSelectedChapter(null);
    setReviewMode(false);
  };

  const handleNavigateToQuestion = (questionId: string) => {
    const question = questionsData.find((q: Question) => q.id === questionId);
    if (question) {
      setSelectedChapter(getChapter(question.id));
      setReviewMode(false);
      setViewMode('chapter');
    }
  };

  const handleStartQuiz = (selected: Question[], category: string) => {
    setQuizQuestions(selected);
    setQuizCategory(category);
    setViewMode('quiz');
  };

  const handleStartExam = (type: 'ppl' | 'ir' | 'cpl') => {
    setExamType(type);
    setViewMode('exam');
  };

  const handleOpenStudyGuide = () => {
    setViewMode('ppl-study');
  };

  if (loading) return <Preloader />;

  const renderContent = () => {
    if (mode === 'c172') return <C172Hub onModeSwitch={handleModeSwitch} />;

    switch (viewMode) {
      case 'quiz':
        return <QuizMode questions={quizQuestions} category={quizCategory} mode={mode} onBack={handleBack} />;
      case 'exam':
        return <PracticeExam questions={questionsData} mode={mode} examType={examType} onBack={handleBack} />;
      case 'ppl-study':
        return <React.Suspense fallback={<Preloader />}><PPLStudyGuide onBack={handleBack} /></React.Suspense>;
      case 'quiz-setup':
        return <QuizSetup questions={questionsData} mode={mode} onStart={handleStartQuiz} onClose={handleBack} />;
      case 'chapter':
        return selectedChapter ? (
          <QuestionView
            chapter={selectedChapter}
            questions={reviewMode ? reviewQuestions : questionsData.filter((q: Question) => getChapter(q.id) === selectedChapter)}
            onBack={handleBack}
            mode={mode}
            progressPrefix={progressPrefix}
          />
        ) : null;
      default:
        return (
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
            onNavigateToQuestion={handleNavigateToQuestion}
            onStartQuiz={() => setViewMode('quiz-setup')}
            onStartExam={handleStartExam}
            onStudyGuide={handleOpenStudyGuide}
          />
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      {renderContent()}
      <footer style={{ marginTop: 'auto', textAlign: 'center', paddingTop: '2rem', paddingBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', opacity: 0.6 }}>
        &copy; {new Date().getFullYear()} <span style={{ background: 'linear-gradient(135deg, #38bdf8, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 600 }}>ATPLVector</span>. Created by Michael Mitry.
      </footer>
      <KeyboardHelp />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <AuthWrapper>
        <AppContent />
      </AuthWrapper>
    </ClerkProvider>
  );
};

export default App;
