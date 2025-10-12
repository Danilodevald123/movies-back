import { UserAnswer } from '../entities/user-answer.entity';
import { AnswerOption } from '../dto/answer-quiz.dto';

export const USER_ANSWER_REPOSITORY = Symbol('USER_ANSWER_REPOSITORY');

export interface IUserAnswerRepository {
  create(data: {
    userId: string;
    questionId: string;
    selectedAnswer: AnswerOption;
    isCorrect: boolean;
  }): UserAnswer;
  save(userAnswer: UserAnswer): Promise<UserAnswer>;
  findByUserId(userId: string): Promise<UserAnswer[]>;
  findByUserAndQuestion(
    userId: string,
    questionId: string,
  ): Promise<UserAnswer | null>;
  countCorrectAnswersByUser(userId: string): Promise<number>;
}
