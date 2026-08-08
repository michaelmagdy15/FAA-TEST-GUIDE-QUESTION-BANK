import React, { useState } from 'react';
import { BookOpenCheck, RotateCcw, ArrowLeft, ArrowRight, Trophy } from 'lucide-react';
import { sfx } from '../../utils/sfx';
import { getQuestionsForBank } from '../../lib/questionsData';
import { Question } from '../../types';
import { QuestionOptions } from '../QuestionOptions';

const shuffle = <T,>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

export const QuizTab: React.FC = () => {
    const [order, setOrder] = useState<Question[]>(() => shuffle(getQuestionsForBank('c172')));
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [finished, setFinished] = useState(false);

    const restart = () => {
        setOrder(shuffle(getQuestionsForBank('c172')));
        setCurrentIndex(0);
        setAnswers({});
        setFinished(false);
    };

    if (order.length === 0) return null;

    const question = order[currentIndex];
    const answered = answers[question.id] !== undefined;
    const isCorrect = answers[question.id] === question.correct;
    const correctCount = Object.entries(answers).filter(([id, a]) => {
        const q = order.find((x) => x.id === id);
        return q && q.correct === a;
    }).length;

    const handleSelect = (key: string) => {
        if (answered) return;
        if (key === question.correct) sfx.playCorrect();
        else sfx.playIncorrect();
        setAnswers((prev) => ({ ...prev, [question.id]: key }));
    };

    const handleNext = () => {
        sfx.playSelect();
        if (currentIndex < order.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setFinished(true);
        }
    };

    const handlePrev = () => {
        sfx.playSelect();
        if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
    };

    const progress = ((currentIndex) / order.length) * 100;

    return (
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(6,182,212,0.12)', color: '#06b6d4' }}>
                    <BookOpenCheck size={20} />
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>C172 Limitations Quiz</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{order.length} questions · {correctCount} correct so far</div>
                </div>
                <button className="btn-secondary" onClick={() => { sfx.playSelect(); restart(); }} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem', fontSize: '0.85rem' }}>
                    <RotateCcw size={14} /> Restart
                </button>
            </div>

            <div style={{ height: '6px', borderRadius: '999px', background: 'var(--glass-border)', overflow: 'hidden', marginBottom: '1.25rem' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg,#06b6d4,#3b82f6)', transition: 'width 0.3s ease' }} />
            </div>

            {!finished ? (
                <>
                    <div className="glass-card question-content animate-in" style={{ padding: '1.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <span className="chip">Question {currentIndex + 1} / {order.length}</span>
                            {question.category && <span className="chip" style={{ background: 'rgba(6,182,212,0.12)', color: '#06b6d4', borderColor: 'rgba(6,182,212,0.3)' }}>{question.category}</span>}
                        </div>
                        <h2 style={{ fontSize: '1.25rem', lineHeight: 1.45, marginBottom: '1.25rem' }}>{question.text}</h2>
                        <QuestionOptions question={question} answered={answered} selectedAnswers={answers} handleSelect={handleSelect} />
                    </div>

                    {answered && (
                        <div className="glass-card animate-in delay-1" style={{ marginTop: '1.25rem', padding: '1.5rem', background: isCorrect ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', borderColor: isCorrect ? 'var(--success-color)' : 'var(--error-color)', borderLeft: `4px solid ${isCorrect ? '#10b981' : '#ef4444'}` }}>
                            <div style={{ fontWeight: 700, color: isCorrect ? 'var(--success-color)' : 'var(--error-color)', marginBottom: '0.5rem' }}>
                                {isCorrect ? 'Correct!' : `Incorrect. The correct answer is ${question.correct}.`}
                            </div>
                            <p style={{ lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0 }}>{question.explanation}</p>
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.25rem' }}>
                        <button className="btn-secondary" onClick={handlePrev} disabled={currentIndex === 0} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: currentIndex === 0 ? 0.5 : 1 }}>
                            <ArrowLeft size={15} /> Previous
                        </button>
                        <button className="btn-primary" onClick={handleNext} disabled={!answered} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: answered ? 1 : 0.5, background: '#06b6d4', boxShadow: '0 4px 14px rgba(6,182,212,0.4)' }}>
                            {currentIndex === order.length - 1 ? 'Finish' : 'Next'} <ArrowRight size={15} />
                        </button>
                    </div>
                </>
            ) : (
                <div className="glass-card animate-in" style={{ padding: '2.5rem', textAlign: 'center' }}>
                    <Trophy size={48} color="#f59e0b" style={{ margin: '0 auto 1rem' }} />
                    <div style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                        {correctCount} / {order.length} correct
                    </div>
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', lineHeight: 1.6 }}>
                        {correctCount === order.length
                            ? 'Flawless! You know the Cessna 172R limitations cold.'
                            : correctCount >= order.length * 0.7
                                ? 'Great job — review the questions you missed and try again.'
                                : 'Keep studying the limitations sections above, then retry the quiz.'}
                    </div>
                    <button className="btn-primary" onClick={() => { sfx.playSelect(); restart(); }} style={{ background: '#06b6d4', boxShadow: '0 4px 14px rgba(6,182,212,0.4)' }}>
                        <RotateCcw size={15} style={{ marginRight: '0.4rem' }} /> Take Quiz Again
                    </button>
                </div>
            )}
        </div>
    );
};
