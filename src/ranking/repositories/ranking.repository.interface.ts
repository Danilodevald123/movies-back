export const RANKING_REPOSITORY = Symbol('RANKING_REPOSITORY');

export interface IRankingRepository {
  getUserScores(): Promise<Array<{ userId: string; score: string }>>;
  getUsersByIds(
    userIds: string[],
  ): Promise<Array<{ id: string; username: string | null }>>;
}
