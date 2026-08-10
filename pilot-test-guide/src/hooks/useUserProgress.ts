import { useUser } from '@clerk/clerk-react';
import { useTestProgress } from './useTestProgress';
import { Question } from '../types';

export const useUserProgress = (
    progressPrefix: string,
    questionsData: Question[],
    selectedChapter: string | null,
    reviewMode: boolean
) => {
    const { user } = useUser();
    const userId = user?.id || 'anonymous';
    const userPrefix = `${userId}_${progressPrefix}`;

    return useTestProgress(userPrefix, questionsData, selectedChapter, reviewMode);
};
