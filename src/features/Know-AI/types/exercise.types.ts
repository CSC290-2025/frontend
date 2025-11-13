export type DifficultLevel = 'Beginner' | 'Intermediate' | 'Professional';

export interface Question {
  id: number;
  question: string;
  level: number;
}

export interface UserExcercise {
  id: number;
  user_id: number;
  question_id: number;
  user_answer: string;
  is_correct: boolean;
}

export interface Userlevel {
  user_id: number;
  current_level: DifficultLevel;
}
