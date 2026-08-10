import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, Clock, RotateCcw } from 'lucide-react';
import { Question } from '../types';
import { QuestionOptions } from './QuestionOptions';
import { recordQuestionAnswer, recordExam } from '../lib/progressTracker';
import { sfx } from '../utils/sfx';

interface QuizModeProps {
  questions: Question[];
  category: string;
  mode: string;
  onBack: () => void;
}

export const QuizMode: React.FC<QuizModeProps> = ({ questions, category, mode, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [startTime] = useState(Date.now());

  const question = questions[currentIndex];
  const answered = question ? answers[question.id] !== undefined : false;


  const handleSelect = useCallback((key: string) => {
    if (!question || answered) return;
    const isNowCorrect = key === question.correct;
    if (isNowCorrect) sfx.playCorrect(); else sfx.playIncorrect();
    const elapsed = Math.round((Date.now() - (startTime || Date.now())) / questions.length / 1000);
    setAnswers(prev => ({ ...prev, [question.id]: key }));
    recordQuestionAnswer({
      questionId: question.id, mode, isCorrect: isNowCorrect,
      timeSeconds: elapsed, timestamp: new Date().toISOString(),
    });
  }, [question, answered, startTime, questions.length, mode]);

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      sfx.playSelect();
    }
  }, [currentIndex, questions.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      sfx.playSelect();
    }
  }, [currentIndex]);

  const correctCount = questions.filter(q => answers[q.id] === q.correct).length;
  const accuracy = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

  const handleFinish = useCallback(() => {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    recordExam({
      mode,
      type: 'quiz',
      date: new Date().toISOString(),
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      timeSpentSeconds: elapsed,
      passed: accuracy >= 70,
      category,
    });
    setShowResults(true);
    sfx.playCorrect();
  }, [startTime, mode, questions.length, correctCount, accuracy, category]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight' || e.key === 'Enter') handleNext();
      else if (e.key === 'ArrowLeft') handlePrev();
      else if (!answered && ['A', 'B', 'C', 'D'].includes(e.key.toUpperCase())) {
        handleSelect(e.key.toUpperCase());
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [answered, handleNext, handlePrev, handleSelect]);

  const elapsed = Math.round((Date.now() - startTime) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  if (showResults) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '2rem' }}>
        <div className="glass-card" style={{ width: '100%', maxWidth: '500px', textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '3rem', fontWeight: 700, color: accuracy >= 70 ? 'var(--success-color)' : 'var(--error-color)', marginBottom: '0.5rem' }}>
            {accuracy}%
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.5rem' }}>
            {accuracy >= 70 ? 'Great Job!' : 'Keep Practicing!'}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1.5rem' }}>
            <div><span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success-color)' }}>{correctCount}</span><br /><span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Correct</span></div>
            <div><span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--error-color)' }}>{questions.length - correctCount}</span><br /><span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Wrong</span></div>
            <div><span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#38bdf8' }}>{minutes}:{seconds.toString().padStart(2, '0')}</span><br /><span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Time</span></div>
          </div>

          {/* Review answers */}
          <div style={{ textAlign: 'left', marginBottom: '1.5rem', maxHeight: '300px', overflowY: 'auto' }}>
            {questions.map((q, i) => {
              const userAns = answers[q.id];
              const wasCorrect = userAns === q.correct;
              return (
                <div key={q.id} style={{ padding: '0.6rem 0', borderBottom: '1px solid var(--glass-border)', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                    {wasCorrect ? <CheckCircle2 size={12} color="#10b981" /> : <XCircle size={12} color="#ef4444" />}
                    <span style={{ fontWeight: 600 }}>Q{i + 1}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>— {q.text.slice(0, 60)}{q.text.length > 60 ? '...' : ''}</span>
                  </div>
                  {!wasCorrect && (
                    <div style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)' }}>
                      Your answer: <span style={{ color: '#ef4444' }}>{userAns}</span> · Correct: <span style={{ color: '#10b981' }}>{q.correct}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn-secondary" onClick={onBack} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <ArrowLeft size={16} /> Back
            </button>
            <button className="btn-primary" onClick={() => { setShowResults(false); setCurrentIndex(0); setAnswers({}); }} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <RotateCcw size={16} /> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      {/* Header */}
      <div className="quiz-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexShrink: 0, flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
            <ArrowLeft size={14} /> Exit
          </button>
          <span className="chip" style={{ background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.25)', fontSize: '0.75rem' }}>
            {category === 'all' ? 'All Categories' : category}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="chip" style={{ fontSize: '0.75rem' }}><Clock size={11} /> {minutes}:{seconds.toString().padStart(2, '0')}</span>
          <span className="chip" style={{ fontSize: '0.75rem' }}>{currentIndex + 1}/{questions.length}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.05)', marginBottom: '1rem', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ width: `${((currentIndex + 1) / questions.length) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #38bdf8, #a78bfa)', transition: 'width 0.3s ease' }} />
      </div>

      {/* Question */}
      <div className="glass-card" style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        <div style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span className="chip" style={{ fontSize: '0.75rem' }}>{question.plt}</span>
          {question.figureRef && (
            <span className="chip" style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--success-color)', borderColor: 'rgba(16, 185, 129, 0.25)' }}>
              Figure {question.figureRef}
            </span>
          )}
        </div>
        <h2 style={{ fontSize: '1.1rem', lineHeight: 1.4, marginBottom: '1rem' }}>{question.text}</h2>
        <QuestionOptions question={question} answered={answered} selectedAnswers={answers} handleSelect={handleSelect} />
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', flexShrink: 0, gap: '0.5rem' }}>
        <button className="btn-secondary" onClick={handlePrev} disabled={currentIndex === 0}
          style={{ opacity: currentIndex === 0 ? 0.5 : 1, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.6rem' }}>
          Previous
        </button>
        {currentIndex === questions.length - 1 ? (
          <button className="btn-primary" onClick={handleFinish}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', padding: '0.6rem' }}>
            Finish
          </button>
        ) : (
          <button className="btn-primary" onClick={handleNext}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.6rem' }}>
            Next
          </button>
        )}
      </div>
    </div>
  );
};
