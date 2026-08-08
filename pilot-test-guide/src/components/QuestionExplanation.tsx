import React, { Suspense, useEffect, useState } from 'react';
import { Question } from '../types';
import { CheckCircle2, XCircle } from 'lucide-react';
import { findRelevantSegments, LectureReference as LectureRef } from '../lib/transcriptSearch';
import { LectureReferenceView } from './LectureReferenceView';

const AirfoilAnim = React.lazy(() => import('./animations/AirfoilAnim').then(module => ({ default: module.AirfoilAnim })));
const InstrumentAnim = React.lazy(() => import('./animations/InstrumentAnim').then(module => ({ default: module.InstrumentAnim })));
const WeatherAnim = React.lazy(() => import('./animations/WeatherAnim').then(module => ({ default: module.WeatherAnim })));
const MapAnim = React.lazy(() => import('./animations/MapAnim').then(module => ({ default: module.MapAnim })));
const GenericPlaneAnim = React.lazy(() => import('./animations/GenericPlaneAnim').then(module => ({ default: module.GenericPlaneAnim })));

interface QuestionExplanationProps {
    question: Question;
    isCorrect: boolean;
}

export const QuestionExplanation: React.FC<QuestionExplanationProps> = ({
    question,
    isCorrect
}) => {
    const [lectureRefs, setLectureRefs] = useState<LectureRef[]>([]);
    const [loadingRefs, setLoadingRefs] = useState(true);

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

    return (
        <div className="glass-card explanation-card animate-in delay-3" style={{ marginTop: '2rem', background: isCorrect ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)', borderColor: isCorrect ? 'var(--success-color)' : 'var(--error-color)', flexShrink: 0, display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                    {isCorrect ? <CheckCircle2 size={24} style={{ color: 'var(--success-color)', flexShrink: 0 }} /> : <XCircle size={24} style={{ color: 'var(--error-color)', flexShrink: 0 }} />}
                    <h3 style={{ margin: 0, color: isCorrect ? 'var(--success-color)' : 'var(--error-color)' }}>
                        {isCorrect ? 'Correct!' : `Incorrect. The correct answer is ${question.correct}.`}
                    </h3>
                </div>
                <p style={{ lineHeight: 1.6 }}>{question.explanation}</p>

                <LectureReferenceView references={lectureRefs} questionText={question.text} explanation={question.explanation} loading={loadingRefs} />
            </div>

            {/* Dynamic SVG Engine Rendering */}
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
    );
};
