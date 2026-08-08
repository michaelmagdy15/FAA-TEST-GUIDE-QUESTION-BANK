import { Question, TestMode } from '../types';
import pplRaw from '../data/questions.json';
import irRaw from '../data/ir_questions.json';
import cplRaw from '../data/cpl_questions.json';
import c172Raw from '../data/c172_questions.json';

interface RawQuestion {
    id: string;
    plt?: string;
    text: string;
    options: Question['options'];
    correct: string;
    explanation: string;
    category?: string;
    figureRef?: number;
}

const RAW: Record<TestMode, RawQuestion[]> = {
    ppl: pplRaw as RawQuestion[],
    ir: irRaw as RawQuestion[],
    cpl: cplRaw as RawQuestion[],
    c172: c172Raw as RawQuestion[],
};

const questionsCache: Partial<Record<TestMode, Question[]>> = {};

export const getQuestionsForBank = (mode: TestMode): Question[] => {
    if (!questionsCache[mode]) {
        questionsCache[mode] = RAW[mode].map((q) => ({
            id: `${mode}-${q.id}`,
            plt: q.plt || '',
            text: q.text,
            options: q.options,
            correct: q.correct,
            explanation: q.explanation,
            category: q.category,
            figureRef: q.figureRef,
        }));
    }
    return questionsCache[mode]!;
};
