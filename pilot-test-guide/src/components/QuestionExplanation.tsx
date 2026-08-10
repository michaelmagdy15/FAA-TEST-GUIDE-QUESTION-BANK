import React, { Suspense, useEffect, useState } from 'react';
import { Question } from '../types';
import { CheckCircle2, XCircle, Lightbulb, ChevronRight } from 'lucide-react';
import { findRelevantSegments, LectureReference as LectureRef } from '../lib/transcriptSearch';
import { LectureReferenceView } from './LectureReferenceView';
import { getReasoningChain, ReasoningChain } from '../data/reasoningChains';
import { getConceptsForQuestion } from '../data/concepts';
import { ConceptCard } from './ConceptCard';
import { recordAnswer } from '../lib/progressTracker';

const AirfoilAnim = React.lazy(() => import('./animations/AirfoilAnim').then(module => ({ default: module.AirfoilAnim })));
const InstrumentAnim = React.lazy(() => import('./animations/InstrumentAnim').then(module => ({ default: module.InstrumentAnim })));
const WeatherAnim = React.lazy(() => import('./animations/WeatherAnim').then(module => ({ default: module.WeatherAnim })));
const MapAnim = React.lazy(() => import('./animations/MapAnim').then(module => ({ default: module.MapAnim })));
const GenericPlaneAnim = React.lazy(() => import('./animations/GenericPlaneAnim').then(module => ({ default: module.GenericPlaneAnim })));

interface QuestionExplanationProps {
    question: Question;
    isCorrect: boolean;
    timeSpentSeconds?: number;
}

export const QuestionExplanation: React.FC<QuestionExplanationProps> = ({
    question,
    isCorrect,
    timeSpentSeconds = 0,
}) => {
    const [lectureRefs, setLectureRefs] = useState<LectureRef[]>([]);
    const [loadingRefs, setLoadingRefs] = useState(true);
    const [reasoningChain, setReasoningChain] = useState<ReasoningChain | null>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [showReveal, setShowReveal] = useState(false);
    const [showFullExplanation, setShowFullExplanation] = useState(false);

    // Record the answer for progress tracking
    useEffect(() => {
        const chain = getReasoningChain(question.id);
        const usedChain = chain !== null && chain.steps.length > 0;
        recordAnswer(question.id, question.category, isCorrect, timeSpentSeconds, usedChain);
    }, [question.id]); // Only on mount/question change

    // Load reasoning chain
    useEffect(() => {
        const chain = getReasoningChain(question.id);
        setReasoningChain(chain);
        setCurrentStep(0);
        setShowReveal(false);
        setShowFullExplanation(false);
    }, [question.id]);

    // Load lecture references
    useEffect(() => {
        let cancelled = false;
        setLoadingRefs(true);
        setLectureRefs([]);

        const correctText = question.options[question.correct as keyof typeof question.options] || '';
        findRelevantSegments(question.text, question.category, question.explanation, correctText, 3)
            .then(refs => {
                if (!cancelled) {
                    setLectureRefs(refs);
                    setLoadingRefs(false);
                }
            })
            .catch(() => {
                if (!cancelled) setLoadingRefs(false);
            });

        return () => { cancelled = true; };
    }, [question.id, question.text, question.category, question.explanation, question.correct]);

    // Get related concepts
    const relatedConcepts = getConceptsForQuestion(question.id);
    const hasChain = reasoningChain && reasoningChain.steps.length > 0;

    const handleNextStep = () => {
        setShowReveal(true);
        // Brief delay then auto-advance
        setTimeout(() => {
            if (reasoningChain && currentStep < reasoningChain.steps.length - 1) {
                setCurrentStep(prev => prev + 1);
                setShowReveal(false);
            } else {
                // Chain complete
                setShowFullExplanation(true);
            }
        }, 3000);
    };

    return (
        <div className="glass-card explanation-card animate-in delay-3" style={{
            marginTop: '2rem',
            background: isCorrect ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
            borderColor: isCorrect ? 'var(--success-color)' : 'var(--error-color)',
            flexShrink: 0,
        }}>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                        {isCorrect ? <CheckCircle2 size={24} style={{ color: 'var(--success-color)', flexShrink: 0 }} /> : <XCircle size={24} style={{ color: 'var(--error-color)', flexShrink: 0 }} />}
                        <h3 style={{ margin: 0, color: isCorrect ? 'var(--success-color)' : 'var(--error-color)' }}>
                            {isCorrect ? 'Correct!' : `Incorrect. The correct answer is ${question.correct}.`}
                        </h3>
                    </div>

                    {/* Why Mode - Guided Reasoning Chain */}
                    {hasChain && !showFullExplanation && (
                        <div style={{
                            background: 'rgba(139, 92, 246, 0.08)',
                            border: '1px solid rgba(139, 92, 246, 0.25)',
                            borderRadius: '12px',
                            padding: '1.25rem',
                            marginBottom: '1rem',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                <Lightbulb size={18} color="#8b5cf6" />
                                <span style={{ fontWeight: 700, color: '#8b5cf6', fontSize: '0.95rem' }}>Think It Through</span>
                                <span className="chip" style={{ fontSize: '0.7rem', background: 'rgba(139,92,246,0.15)', color: '#8b5cf6', borderColor: 'rgba(139,92,246,0.3)' }}>
                                    Step {currentStep + 1} of {reasoningChain!.steps.length}
                                </span>
                            </div>

                            {/* Step progress dots */}
                            <div style={{ display: 'flex', gap: '6px', marginBottom: '1rem' }}>
                                {reasoningChain!.steps.map((_, i) => (
                                    <div key={i} style={{
                                        width: i === currentStep ? '24px' : '8px',
                                        height: '8px',
                                        borderRadius: '4px',
                                        background: i <= currentStep ? '#8b5cf6' : 'rgba(139,92,246,0.2)',
                                        transition: 'all 0.3s ease',
                                    }} />
                                ))}
                            </div>

                            {/* Current step prompt */}
                            <div style={{
                                fontSize: '1.05rem',
                                fontWeight: 600,
                                color: 'var(--text-primary)',
                                marginBottom: '0.75rem',
                                lineHeight: 1.5,
                            }}>
                                {reasoningChain!.steps[currentStep].prompt}
                            </div>

                            {/* Hint (if available and not revealed) */}
                            {!showReveal && reasoningChain!.steps[currentStep].hint && (
                                <div style={{
                                    fontSize: '0.85rem',
                                    color: 'var(--text-secondary)',
                                    fontStyle: 'italic',
                                    marginBottom: '0.75rem',
                                }}>
                                    Hint: {reasoningChain!.steps[currentStep].hint}
                                </div>
                            )}

                            {/* Reveal button / revealed text */}
                            {!showReveal ? (
                                <button
                                    onClick={() => { handleNextStep(); }}
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                        background: 'rgba(139, 92, 246, 0.15)',
                                        color: '#8b5cf6',
                                        border: '1px solid rgba(139, 92, 246, 0.3)',
                                        borderRadius: '8px',
                                        padding: '0.5rem 1rem',
                                        fontSize: '0.9rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139, 92, 246, 0.25)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)'; }}
                                >
                                    {currentStep < reasoningChain!.steps.length - 1 ? 'Next Step' : 'Show Answer'}
                                    <ChevronRight size={16} />
                                </button>
                            ) : (
                                <div style={{
                                    background: 'rgba(139, 92, 246, 0.1)',
                                    borderRadius: '8px',
                                    padding: '0.75rem 1rem',
                                    fontSize: '0.92rem',
                                    lineHeight: 1.6,
                                    color: 'var(--text-primary)',
                                    animation: 'fadeIn 0.3s ease',
                                    borderLeft: '3px solid #8b5cf6',
                                }}>
                                    {reasoningChain!.steps[currentStep].reveal}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Full explanation (shown after chain completes or if no chain) */}
                    {(!hasChain || showFullExplanation) && (
                        <p style={{ lineHeight: 1.6, marginBottom: '1rem' }}>{question.explanation}</p>
                    )}

                    {/* Related Concepts */}
                    {relatedConcepts.length > 0 && (
                        <div style={{ marginTop: '1rem' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
                                Related Concepts
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {relatedConcepts.map(c => (
                                    <ConceptCard key={c.id} concept={c} compact />
                                ))}
                            </div>
                        </div>
                    )}

                    <LectureReferenceView references={lectureRefs} questionText={question.text} explanation={question.explanation} loading={loadingRefs} />
                </div>

                {/* Animation */}
                <div style={{ width: '200px', flexShrink: 0, opacity: 0.8 }}>
                    <Suspense fallback={<div style={{ width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
                        {(() => {
                            const text = (question.text + " " + question.explanation).toLowerCase();
                            if (text.match(/lift|drag|airfoil|wing|angle of attack|stall|camber|chord|aerodynamic/)) return <AirfoilAnim />;
                            if (text.match(/altimeter|indicator|gauge|compass|turn coordinator|airspeed|pitot|static|gyroscopic/)) return <InstrumentAnim />;
                            if (text.match(/cloud|rain|front|temperature|dewpoint|forecast|wind|icing|fog|weather|meteorology|thunderstorm/)) return <WeatherAnim />;
                            if (text.match(/vor|course|radial|heading|true north|magnetic|deviation|route|navigation|latitude|longitude/)) return <MapAnim />;
                            return <GenericPlaneAnim />;
                        })()}
                    </Suspense>
                </div>
            </div>
        </div>
    );
};
