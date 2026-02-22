export interface Question {
    id: string;
    plt: string;
    text: string;
    options: {
        A: string;
        B: string;
        C: string;
        D?: string;
    };
    correct: string;
    explanation: string;
}

export type TestMode = 'ppl' | 'ir' | 'cpl';
