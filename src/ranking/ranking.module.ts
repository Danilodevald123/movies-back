import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RankingService } from './ranking.service';
import { RankingController } from './ranking.controller';
import { UserAnswer } from '../quiz/entities/user-answer.entity';
import { User } from '../users/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { RankingRepository } from './repositories/ranking.repository';
import { RANKING_REPOSITORY } from './repositories/ranking.repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([UserAnswer, User]), AuthModule],
  controllers: [RankingController],
  providers: [
    RankingService,
    {
      provide: RANKING_REPOSITORY,
      useClass: RankingRepository,
    },
  ],
  exports: [RankingService],
})
export class RankingModule {}
