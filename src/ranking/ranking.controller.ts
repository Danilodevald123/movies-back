import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { RankingService } from './ranking.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtUser } from '../auth/interfaces/jwt-user.interface';
import { RankingResponseDto, RankingItemDto } from './dto/ranking-response.dto';
import {
  THROTTLE_TTL,
  THROTTLE_LIMIT_DEFAULT,
} from '../common/constants/app.constants';

@ApiTags('ranking')
@ApiBearerAuth('JWT-auth')
@Controller('ranking')
@UseGuards(JwtAuthGuard)
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  @Get()
  @Throttle({ default: { limit: THROTTLE_LIMIT_DEFAULT, ttl: THROTTLE_TTL } })
  @ApiOperation({
    summary: 'Get user rankings',
    description: 'Retrieves the ranking of all users sorted by score',
  })
  @ApiResponse({
    status: 200,
    description: 'Ranking retrieved successfully',
    type: RankingResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - invalid or missing JWT token',
  })
  async getRanking(): Promise<RankingResponseDto> {
    return this.rankingService.getRanking();
  }

  @Get('me')
  @Throttle({ default: { limit: THROTTLE_LIMIT_DEFAULT, ttl: THROTTLE_TTL } })
  @ApiOperation({
    summary: 'Get my ranking position',
    description: 'Retrieves the ranking position of the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Position retrieved successfully',
    type: RankingItemDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - invalid or missing JWT token',
  })
  async getMyRanking(
    @CurrentUser() user: JwtUser,
  ): Promise<RankingItemDto | { message: string }> {
    const ranking = await this.rankingService.getUserRanking(user.id);
    if (!ranking) {
      return { message: 'You do not have a score yet. Answer the quiz first.' };
    }
    return ranking;
  }
}
