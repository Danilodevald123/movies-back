import { Injectable, Inject } from '@nestjs/common';
import { RankingItemDto, RankingResponseDto } from './dto/ranking-response.dto';
import {
  IRankingRepository,
  RANKING_REPOSITORY,
} from './repositories/ranking.repository.interface';

@Injectable()
export class RankingService {
  constructor(
    @Inject(RANKING_REPOSITORY)
    private readonly rankingRepository: IRankingRepository,
  ) {}

  async getRanking(): Promise<RankingResponseDto> {
    const results = await this.rankingRepository.getUserScores();
    const userIds = results.map((r) => r.userId);
    const users = await this.rankingRepository.getUsersByIds(userIds);

    const userMap = new Map(users.map((u) => [u.id, u]));

    const rankings: RankingItemDto[] = results.map((result, index: number) => {
      const user = userMap.get(result.userId);
      return {
        userId: result.userId,
        email: user?.email || 'Unknown',
        score: parseInt(result.score, 10),
        position: index + 1,
      };
    });

    return {
      rankings,
      totalUsers: rankings.length,
    };
  }

  async getUserRanking(userId: string): Promise<RankingItemDto | null> {
    return this.rankingRepository.getUserRanking(userId);
  }
}
