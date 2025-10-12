import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAnswer } from '../entities/user-answer.entity';
import { IUserAnswerRepository } from './user-answer.repository.interface';
import { AnswerOption } from '../dto/answer-quiz.dto';

@Injectable()
export class UserAnswerRepository implements IUserAnswerRepository {
  constructor(
    @InjectRepository(UserAnswer)
    private readonly repository: Repository<UserAnswer>,
  ) {}

  create(data: {
    userId: string;
    questionId: string;
    selectedAnswer: AnswerOption;
    isCorrect: boolean;
  }): UserAnswer {
    return this.repository.create(data);
  }

  async save(userAnswer: UserAnswer): Promise<UserAnswer> {
    return this.repository.save(userAnswer);
  }

  async findByUserId(userId: string): Promise<UserAnswer[]> {
    return this.repository.find({
      where: { userId },
      relations: ['question'],
    });
  }

  async findByUserAndQuestion(
    userId: string,
    questionId: string,
  ): Promise<UserAnswer | null> {
    return this.repository.findOne({
      where: { userId, questionId },
    });
  }

  async countCorrectAnswersByUser(userId: string): Promise<number> {
    return this.repository.count({
      where: { userId, isCorrect: true },
    });
  }
}
