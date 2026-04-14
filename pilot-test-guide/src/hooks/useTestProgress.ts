import { useState, useEffect, useCallback } from 'react';
import { Question } from '../types';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export const useTestProgress = (
    progressPrefix: string,
    questionsData: Question[],
    selectedChapter: string | null,
    reviewMode: boolean
) => {
    const { user } = useAuth();
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

    // Firestore Sync Logic
    useEffect(() => {
        if (!user) return;

        // Listen to progress changes for all chapters (simplified for now to basic fetch on load)
        // In a real app, we might want a more granular listener
        loadProgress();
    }, [user, loadProgress]);

    useEffect(() => {
        if (!selectedChapter && !reviewMode) {
            loadProgress();
        }
    }, [selectedChapter, reviewMode, loadProgress]);

    const resetChapterProgress = useCallback(async (chapterId: string) => {
        const key = `${progressPrefix}_${chapterId}`;
        localStorage.removeItem(key);
        
        if (user) {
            const docRef = doc(db, 'users', user.uid, 'progress', key);
            await setDoc(docRef, {});
        }
        
        loadProgress();
    }, [progressPrefix, loadProgress, user]);

    const resetAllProgress = useCallback(async () => {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`${progressPrefix}_`)) {
                keysToRemove.push(key);
            }
        }
        
        for (const key of keysToRemove) {
            localStorage.removeItem(key);
            if (user) {
                const docRef = doc(db, 'users', user.uid, 'progress', key);
                await setDoc(docRef, {});
            }
        }
        
        loadProgress();
    }, [progressPrefix, loadProgress, user]);

    return { chapterProgress, reviewQuestions, resetChapterProgress, resetAllProgress, loadProgress };
};
