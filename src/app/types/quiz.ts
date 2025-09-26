export type QuizQuestion = {
  text: string;
  choices: string[];
  correctIndex: number;
};

export type GeneratedQuiz = {
  questions: QuizQuestion[];
};
