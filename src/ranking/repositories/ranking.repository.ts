import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAnswer } from '../../quiz/entities/user-answer.entity';
import { User } from '../../users/entities/user.entity';
import { IRankingRepository } from './ranking.repository.interface';

@Injectable()
export class RankingRepository implements IRankingRepository {
  constructor(
    @InjectRepository(UserAnswer)
    private readonly userAnswerRepository: Repository<UserAnswer>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getUserScores(): Promise<Array<{ userId: string; score: string }>> {
    const results = await this.userAnswerRepository
      .createQueryBuilder('ua')
      .select('ua.user_id', 'userId')
      .addSelect('COUNT(*)', 'score')
      .where('ua.is_correct = :isCorrect', { isCorrect: true })
      .groupBy('ua.user_id')
      .orderBy('score', 'DESC')
      .getRawMany<{ userId: string; score: string }>();

    return results;
  }

  async getUsersByIds(
    userIds: string[],
  ): Promise<Array<{ id: string; email: string }>> {
    if (userIds.length === 0) {
      return [];
    }

    const users = await this.userRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.email'])
      .where('user.id IN (:...userIds)', { userIds })
      .getMany();

    return users.map((u) => ({ id: u.id, email: u.email }));
  }
}
