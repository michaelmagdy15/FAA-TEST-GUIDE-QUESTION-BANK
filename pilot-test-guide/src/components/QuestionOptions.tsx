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
                            <div style={{ fontWeight: 'bold', minWidth: '24px' }}>{key}.</div>
                            <div>{text as string}</div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
