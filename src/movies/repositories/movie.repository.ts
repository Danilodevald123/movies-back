import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from '../entities/movie.entity';
import { IMovieRepository } from './movie.repository.interface';

@Injectable()
export class MovieRepository implements IMovieRepository {
  constructor(
    @InjectRepository(Movie)
    private readonly ormRepository: Repository<Movie>,
  ) {}

  create(movieData: Partial<Movie>): Movie {
    return this.ormRepository.create(movieData);
  }

  async save(movie: Movie): Promise<Movie> {
    return await this.ormRepository.save(movie);
  }

  async findAll(orderBy?: {
    field: keyof Movie;
    direction: 'ASC' | 'DESC';
  }): Promise<Movie[]> {
    const order = orderBy
      ? { [orderBy.field]: orderBy.direction }
      : { releaseDate: 'DESC' as const };

    return await this.ormRepository.find({ order });
  }

  async findById(id: string): Promise<Movie | null> {
    return await this.ormRepository.findOne({ where: { id } });
  }

  async findByEpisodeId(episodeId: number): Promise<Movie | null> {
    return await this.ormRepository.findOne({ where: { episodeId } });
  }

  async findBySwapiId(swapiId: string): Promise<Movie | null> {
    return await this.ormRepository.findOne({ where: { swapiId } });
  }

  async remove(movie: Movie): Promise<void> {
    await this.ormRepository.remove(movie);
  }
}
