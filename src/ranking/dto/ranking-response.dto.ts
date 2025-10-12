import { ApiProperty } from '@nestjs/swagger';

export class RankingItemDto {
  @ApiProperty({
    description: 'Username of the user',
    example: 'john_doe',
  })
  username: string;

  @ApiProperty({
    description: 'User score',
    example: 80,
  })
  score: number;

  @ApiProperty({
    description: 'Position in the ranking',
    example: 1,
  })
  position: number;
}

export class RankingResponseDto {
  @ApiProperty({
    description: 'List of ranking items',
    type: [RankingItemDto],
  })
  rankings: RankingItemDto[];

  @ApiProperty({
    description: 'Total number of users in the ranking',
    example: 10,
  })
  totalUsers: number;
}
