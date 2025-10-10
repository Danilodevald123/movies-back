import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { RankingService } from './ranking.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtUser } from '../auth/interfaces/jwt-user.interface';
import { RankingItemDto, RankingResponseDto } from './dto/ranking-response.dto';

@ApiTags('ranking')
@ApiBearerAuth('JWT-auth')
@Controller('ranking')
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  @Get()
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({
    summary: 'Get user rankings',
    description:
      'Obtiene el ranking de todos los usuarios ordenados por puntaje',
  })
  @ApiResponse({
    status: 200,
    description: 'Ranking obtenido exitosamente',
    type: RankingResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async getRanking(): Promise<RankingResponseDto> {
    return this.rankingService.getRanking();
  }

  @Get('me')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({
    summary: 'Get my ranking position',
    description: 'Obtiene la posición en el ranking del usuario autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Posición obtenida exitosamente',
    type: RankingItemDto,
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async getMyRanking(
    @CurrentUser() user: JwtUser,
  ): Promise<RankingItemDto | { message: string }> {
    const ranking = await this.rankingService.getUserRanking(user.id);
    if (!ranking) {
      return { message: 'Aún no tienes puntaje. Responde el quiz primero.' };
    }
    return ranking;
  }
}
