export class RankingItemDto {
  userId: string;
  email: string;
  score: number;
  position: number;
}

export class RankingResponseDto {
  rankings: RankingItemDto[];
  totalUsers: number;
}
