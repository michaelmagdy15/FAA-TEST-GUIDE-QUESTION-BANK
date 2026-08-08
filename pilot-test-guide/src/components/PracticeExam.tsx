import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, Clock, AlertTriangle, Flag } from 'lucide-react';
import { Question } from '../types';
import { QuestionOptions } from './QuestionOptions';
import { recordQuestionAnswer, recordExam } from '../lib/progressTracker';
import { sfx } from '../utils/sfx';

interface PracticeExamProps {
  questions: Question[];
  mode: string;
  examType: 'ppl' | 'ir' | 'cpl';
  onBack: () => void;
}

const EXAM_CONFIG = {
  ppl: { title: 'PPL Knowledge Test', questionCount: 60, timeLimit: 150, passingScore: 70 },
  ir: { title: 'IR Knowledge Test', questionCount: 80, timeLimit: 180, passingScore: 70 },
  cpl: { title: 'CPL Knowledge Test', questionCount: 100, timeLimit: 240, passingScore: 70 },
};

export const PracticeExam: React.FC<PracticeExamProps> = ({ questions, mode, examType, onBack }) => {
  const config = EXAM_CONFIG[examType];
  const [examQuestions] = useState(() =>
    [...questions].sort(() => Math.random() - 0.5).slice(0, Math.min(config.questionCount, questions.length))
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [showResults, setShowResults] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(config.timeLimit * 60);
  const [examStarted] = useState(Date.now());


  // Timer
  useEffect(() => {
    if (showResults) return;
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) { setShowResults(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showResults]);

  const question = examQuestions[currentIndex];
  const answered = question ? answers[question.id] !== undefined : false;
  const allAnswered = examQuestions.every(q => answers[q.id] !== undefined);
  const correctCount = examQuestions.filter(q => answers[q.id] === q.correct).length;
  const accuracy = examQuestions.length > 0 ? Math.round((correctCount / examQuestions.length) * 100) : 0;
  const passed = accuracy >= config.passingScore;

  const handleSelect = useCallback((key: string) => {
    if (!question || answered) return;
    const isNowCorrect = key === question.correct;
    if (isNowCorrect) sfx.playCorrect(); else sfx.playIncorrect();
    setAnswers(prev => ({ ...prev, [question.id]: key }));
    const elapsed = Math.round((Date.now() - examStarted) / examQuestions.length / 1000);
    recordQuestionAnswer({
      questionId: question.id, mode, isCorrect: isNowCorrect,
      timeSeconds: elapsed, timestamp: new Date().toISOString(),
    });
  }, [question, answered, examStarted, examQuestions.length, mode]);

  const handleFlag = useCallback(() => {
    if (!question) return;
    setFlagged(prev => {
      const next = new Set(prev);
      if (next.has(question.id)) next.delete(question.id); else next.add(question.id);
      return next;
    });
    sfx.playHover();
  }, [question]);

  const handleSubmit = useCallback(() => {
    const totalTime = Math.round((Date.now() - examStarted) / 1000);
    recordExam({
      mode: examType, type: 'exam', date: new Date().toISOString(),
      totalQuestions: examQuestions.length, correctAnswers: correctCount,
      timeSpentSeconds: totalTime, passed,
    });
    setShowResults(true);
    sfx.playCorrect();
  }, [examStarted, examType, examQuestions.length, correctCount, passed]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      if (showResults) return;
      if (e.key === 'ArrowRight') { if (currentIndex < examQuestions.length - 1) { setCurrentIndex(prev => prev + 1); sfx.playSelect(); } }
      else if (e.key === 'ArrowLeft') { if (currentIndex > 0) { setCurrentIndex(prev => prev - 1); sfx.playSelect(); } }
      else if (!answered && ['A', 'B', 'C', 'D'].includes(e.key.toUpperCase())) handleSelect(e.key.toUpperCase());
      else if (e.key === 'f' || e.key === 'F') handleFlag();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [answered, currentIndex, examQuestions.length, handleSelect, handleFlag, showResults]);

  const mins = Math.floor(timeRemaining / 60);
  const secs = timeRemaining % 60;
  const timeWarning = timeRemaining < 300;

  if (showResults) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <div className="glass-card" style={{ width: '100%', maxWidth: '600px', textAlign: 'center', padding: '2rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '80px', height: '80px', borderRadius: '50%',
            background: passed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            marginBottom: '1rem',
          }}>
            {passed ? <CheckCircle2 size={40} color="#10b981" /> : <AlertTriangle size={40} color="#ef4444" />}
          </div>
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem' }}>{config.title} — Results</h2>
          <div style={{
            fontSize: '2.5rem', fontWeight: 700,
            color: passed ? 'var(--success-color)' : 'var(--error-color)',
            marginBottom: '0.25rem',
          }}>
            {accuracy}%
          </div>
          <div style={{ fontSize: '1rem', color: passed ? 'var(--success-color)' : 'var(--error-color)', fontWeight: 600, marginBottom: '1.5rem' }}>
            {passed ? `PASSED (≥${config.passingScore}%)` : `FAILED (need ≥${config.passingScore}%)`}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1.5rem' }}>
            <div><span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success-color)' }}>{correctCount}</span><br /><span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Correct</span></div>
            <div><span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--error-color)' }}>{examQuestions.length - correctCount}</span><br /><span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Wrong</span></div>
            <div><span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#a78bfa' }}>{flagged.size}</span><br /><span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Flagged</span></div>
          </div>

          {/* Category breakdown */}
          <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Category Breakdown</div>
            {(() => {
              const cats = new Map<string, { correct: number; total: number }>();
              examQuestions.forEach(q => {
                const cat = q.category || 'General';
                if (!cats.has(cat)) cats.set(cat, { correct: 0, total: 0 });
                cats.get(cat)!.total++;
                if (answers[q.id] === q.correct) cats.get(cat)!.correct++;
              });
              return Array.from(cats.entries()).map(([cat, { correct, total }]) => {
                const acc = total > 0 ? Math.round((correct / total) * 100) : 0;
                const color = acc >= 70 ? '#10b981' : acc >= 50 ? '#f59e0b' : '#ef4444';
                return (
                  <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0', fontSize: '0.8rem' }}>
                    <span style={{ flex: 1 }}>{cat}</span>
                    <span style={{ color, fontWeight: 600 }}>{acc}%</span>
                    <span style={{ color: 'var(--text-secondary)' }}>({correct}/{total})</span>
                  </div>
                );
              });
            })()}
          </div>

          {/* Review wrong answers */}
          <div style={{ textAlign: 'left', maxHeight: '250px', overflowY: 'auto', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Missed Questions</div>
            {examQuestions.filter(q => answers[q.id] !== q.correct).map((q) => (
              <div key={q.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--glass-border)', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <XCircle size={12} color="#ef4444" />
                  <span style={{ fontWeight: 600 }}>Q{examQuestions.indexOf(q) + 1}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>— {q.text.slice(0, 50)}...</span>
                </div>
                <div style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)' }}>
                  Your: <span style={{ color: '#ef4444' }}>{answers[q.id]}</span> · Correct: <span style={{ color: '#10b981' }}>{q.correct}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn-secondary" onClick={onBack} style={{ flex: 1 }}>Back to Menu</button>
            <button className="btn-primary" onClick={onBack} style={{ flex: 1 }}>Take Again</button>
          </div>
        </div>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden', gap: '1rem' }}>
      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button className="btn-secondary" onClick={() => { if (window.confirm('Exit exam? Progress will be saved.')) onBack(); }} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem' }}>
              <ArrowLeft size={14} /> Exit
            </button>
            <span className="chip" style={{ background: 'rgba(167, 139, 250, 0.12)', color: '#a78bfa', borderColor: 'rgba(167, 139, 250, 0.25)' }}>
              {config.title}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="chip" style={{ background: timeWarning ? 'rgba(239, 68, 68, 0.12)' : undefined, color: timeWarning ? '#ef4444' : undefined, borderColor: timeWarning ? 'rgba(239, 68, 68, 0.25)' : undefined }}>
              <Clock size={12} /> {mins}:{secs.toString().padStart(2, '0')}
            </span>
            <span className="chip">{currentIndex + 1} / {examQuestions.length}</span>
            <button
              onClick={handleFlag}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 500,
                background: flagged.has(question.id) ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                border: `1px solid ${flagged.has(question.id) ? 'rgba(245, 158, 11, 0.4)' : 'var(--glass-border)'}`,
                color: flagged.has(question.id) ? '#f59e0b' : 'var(--text-secondary)',
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <Flag size={12} fill={flagged.has(question.id) ? '#f59e0b' : 'none'} />
              Flag
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.05)', marginBottom: '1rem', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ width: `${((currentIndex + 1) / examQuestions.length) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #a78bfa, #38bdf8)', transition: 'width 0.3s ease' }} />
        </div>

        {/* Question */}
        <div className="glass-card" style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <span className="chip">Q{currentIndex + 1}</span>
            {question.figureRef && <span className="chip" style={{ marginLeft: '0.5rem', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--success-color)', borderColor: 'rgba(16, 185, 129, 0.25)' }}>Figure {question.figureRef}</span>}
            {flagged.has(question.id) && <span className="chip" style={{ marginLeft: '0.5rem', background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.25)' }}>Flagged</span>}
          </div>
          <h2 style={{ fontSize: '1.15rem', lineHeight: 1.4, marginBottom: '1.25rem' }}>{question.text}</h2>
          <QuestionOptions question={question} answered={answered} selectedAnswers={answers} handleSelect={handleSelect} />
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', flexShrink: 0 }}>
          <button className="btn-secondary" onClick={() => { setCurrentIndex(prev => Math.max(0, prev - 1)); sfx.playSelect(); }} disabled={currentIndex === 0} style={{ opacity: currentIndex === 0 ? 0.5 : 1 }}>
            Previous
          </button>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {currentIndex < examQuestions.length - 1 ? (
              <button className="btn-primary" onClick={() => { setCurrentIndex(prev => prev + 1); sfx.playSelect(); }}>
                Next <ArrowRight size={14} />
              </button>
            ) : allAnswered ? (
              <button className="btn-primary" onClick={handleSubmit} style={{ background: 'var(--success-color)' }}>
                Submit Exam
              </button>
            ) : (
              <button className="btn-primary" disabled style={{ opacity: 0.5 }}>
                {examQuestions.length - Object.keys(answers).length} remaining
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Question navigator sidebar */}
      <div style={{ width: '200px', flexShrink: 0, overflowY: 'auto' }} className="glass-card">
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          Questions ({Object.keys(answers).length}/{examQuestions.length})
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
          {examQuestions.map((q, i) => {
            const ans = answers[q.id];
            const correct = ans === q.correct;
            const isFlagged = flagged.has(q.id);
            return (
              <button
                key={q.id}
                onClick={() => { setCurrentIndex(i); sfx.playSelect(); }}
                style={{
                  width: '100%', aspectRatio: '1', borderRadius: '6px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', border: 'none',
                  background: i === currentIndex
                    ? (ans ? (correct ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)') : 'rgba(56, 189, 248, 0.2)')
                    : ans
                      ? (correct ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)')
                      : isFlagged ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.03)',
                  color: i === currentIndex ? '#fff' : 'var(--text-secondary)',
                  fontFamily: 'inherit',
                  transition: 'all 0.1s ease',
                }}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
        {allAnswered && (
          <button className="btn-primary" onClick={handleSubmit} style={{ width: '100%', marginTop: '0.75rem', fontSize: '0.85rem', padding: '0.6rem' }}>
            Submit Exam
          </button>
        )}
      </div>
    </div>
  );
};
