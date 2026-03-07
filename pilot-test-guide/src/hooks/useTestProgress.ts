import { useState, useEffect, useCallback } from 'react';
import { Question } from '../types';

export const useTestProgress = (
    progressPrefix: string,
    questionsData: Question[],
    selectedChapter: string | null,
    reviewMode: boolean
) => {
    const [chapterProgress, setChapterProgress] = useState<Record<string, number>>({});
    const [reviewQuestions, setReviewQuestions] = useState<Question[]>([]);

    const loadProgress = useCallback(() => {
        const allProgress: Record<string, string> = {};
        const newChapterProgress: Record<string, number> = {};

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`${progressPrefix}_`) && key !== `${progressPrefix}_REVIEW`) {
                try {
                    const data = JSON.parse(localStorage.getItem(key) || '{}');
                    Object.assign(allProgress, data);
                    const chapId = key.replace(`${progressPrefix}_`, '');
                    newChapterProgress[chapId] = Object.keys(data).length;
                } catch (e) {
                    console.error('Failed to parse progress for', key, e);
                }
            }
        }

        setChapterProgress(newChapterProgress);

        const incorrect = questionsData.filter((q: Question) => {
            const ans = allProgress[q.id];
            return ans !== undefined && ans !== q.correct;
        });
        setReviewQuestions(incorrect);
    }, [progressPrefix, questionsData]);

    useEffect(() => {
        if (!selectedChapter && !reviewMode) {
            loadProgress();
        }
    }, [selectedChapter, reviewMode, loadProgress]);

    const resetChapterProgress = useCallback((chapterId: string) => {
        const key = `${progressPrefix}_${chapterId}`;
        localStorage.removeItem(key);
        loadProgress();
    }, [progressPrefix, loadProgress]);

    const resetAllProgress = useCallback(() => {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`${progressPrefix}_`)) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        loadProgress();
    }, [progressPrefix, loadProgress]);

    return { chapterProgress, reviewQuestions, resetChapterProgress, resetAllProgress, loadProgress };
};
