export interface Question {
    id: string;
    plt: string;
    text: string;
    options: {
        A: string;
        B: string;
        C: string;
    };
    correct: string;
    explanation: string;
}
