import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import { Movie } from './entities/movie.entity';
import { MovieRepository } from './repositories/movie.repository';
import { MOVIE_REPOSITORY } from './repositories/movie.repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([Movie])],
  controllers: [MoviesController],
  providers: [
    MoviesService,
    {
      provide: MOVIE_REPOSITORY,
      useClass: MovieRepository,
    },
  ],
  exports: [MoviesService],
})
export class MoviesModule {}
