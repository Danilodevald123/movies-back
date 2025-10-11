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

  private async buildRankings(): Promise<RankingItemDto[]> {
    const results = await this.rankingRepository.getUserScores();
    const userIds = results.map((r) => r.userId);
    const users = await this.rankingRepository.getUsersByIds(userIds);

    const userMap = new Map(users.map((u) => [u.id, u]));

    return results.map((result, index: number) => {
      const user = userMap.get(result.userId);
      return {
        userId: result.userId,
        email: user?.email || 'Unknown',
        score: parseInt(result.score, 10),
        position: index + 1,
      };
    });
  }

  async getRanking(): Promise<RankingResponseDto> {
    const rankings = await this.buildRankings();

    return {
      rankings,
      totalUsers: rankings.length,
    };
  }

  async getUserRanking(userId: string): Promise<RankingItemDto | null> {
    const rankings = await this.buildRankings();
    const userRanking = rankings.find((r) => r.userId === userId);
    return userRanking || null;
  }
}
