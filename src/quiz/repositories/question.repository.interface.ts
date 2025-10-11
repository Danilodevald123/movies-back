import { Question } from '../entities/question.entity';

export const QUESTION_REPOSITORY = Symbol('QUESTION_REPOSITORY');

export interface IQuestionRepository {
  create(data: Partial<Question>): Question;
  findAll(): Promise<Question[]>;
  findById(id: string): Promise<Question | null>;
  findRandomActive(limit: number): Promise<Question[]>;
  save(question: Question): Promise<Question>;
}
