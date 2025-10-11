import { UserAnswer } from '../entities/user-answer.entity';

export const USER_ANSWER_REPOSITORY = Symbol('USER_ANSWER_REPOSITORY');

export interface IUserAnswerRepository {
  save(userAnswer: UserAnswer): Promise<UserAnswer>;
  findByUserId(userId: string): Promise<UserAnswer[]>;
  findByUserAndQuestion(
    userId: string,
    questionId: string,
  ): Promise<UserAnswer | null>;
  countCorrectAnswersByUser(userId: string): Promise<number>;
}
