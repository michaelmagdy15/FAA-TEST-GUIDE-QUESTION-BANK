import React from 'react';
import { Question } from '../types';
import { sfx } from '../utils/sfx';

interface QuestionOptionsProps {
    question: Question;
    answered: boolean;
    selectedAnswers: Record<string, string>;
    handleSelect: (key: string) => void;
}

export const QuestionOptions: React.FC<QuestionOptionsProps> = ({
    question,
    answered,
    selectedAnswers,
    handleSelect
}) => {
    const getOptionClass = (key: string) => {
        const base = "glass-card option-card animate-in delay-2";
        if (!answered) return `${base} interactive`;

        if (key === question.correct) return `${base} correct`;
        if (key === selectedAnswers[question.id]) return `${base} incorrect`;

        return `${base} disabled`;
    };

    return (
        <div className="options-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.entries(question.options).map(([key, text]) => {
                const optClass = getOptionClass(key);
                const isCorrectOpt = answered && key === question.correct;
                const isWrongOpt = answered && key === selectedAnswers[question.id] && key !== question.correct;

                return (
                    <div
                        key={key}
                        className={optClass}
                        onClick={() => handleSelect(key)}
                        onMouseEnter={() => !answered && sfx.playHover()}
                        style={{
                            cursor: answered ? 'default' : 'pointer',
                            padding: '1.25rem',
                            border: isCorrectOpt ? '1px solid var(--success-color)' : isWrongOpt ? '1px solid var(--error-color)' : '1px solid var(--glass-border)'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                            <span
                                className="option-letter"
                                style={{
                                    marginTop: '2px',
                                    color: isCorrectOpt ? 'var(--success-color)' : isWrongOpt ? 'var(--error-color)' : 'var(--text-secondary)',
                                    borderColor: isCorrectOpt ? 'var(--success-color)' : isWrongOpt ? 'var(--error-color)' : 'rgba(255, 255, 255, 0.08)',
                                    background: isCorrectOpt ? 'rgba(16, 185, 129, 0.15)' : isWrongOpt ? 'rgba(239, 68, 68, 0.15)' : 'rgba(148, 163, 184, 0.12)',
                                }}
                            >
                                {key}
                            </span>
                            <div style={{ flex: 1 }}>{text as string}</div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
