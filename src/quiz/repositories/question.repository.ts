import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../entities/question.entity';
import { IQuestionRepository } from './question.repository.interface';

@Injectable()
export class QuestionRepository implements IQuestionRepository {
  constructor(
    @InjectRepository(Question)
    private readonly repository: Repository<Question>,
  ) {}

  create(data: Partial<Question>): Question {
    return this.repository.create(data);
  }

  async findAll(): Promise<Question[]> {
    return this.repository.find({ where: { active: true } });
  }

  async findById(id: string): Promise<Question | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findRandomActive(limit: number): Promise<Question[]> {
    return this.repository
      .createQueryBuilder('question')
      .where('question.active = :active', { active: true })
      .orderBy('RANDOM()')
      .limit(limit)
      .getMany();
  }

  async save(question: Question): Promise<Question> {
    return this.repository.save(question);
  }
}
