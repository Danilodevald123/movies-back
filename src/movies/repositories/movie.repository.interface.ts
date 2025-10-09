import { Movie } from '../entities/movie.entity';

export const MOVIE_REPOSITORY = Symbol('MOVIE_REPOSITORY');

export interface IMovieRepository {
  create(movieData: Partial<Movie>): Movie;
  save(movie: Movie): Promise<Movie>;
  findAll(orderBy?: {
    field: keyof Movie;
    direction: 'ASC' | 'DESC';
  }): Promise<Movie[]>;
  findById(id: string): Promise<Movie | null>;
  findByEpisodeId(episodeId: number): Promise<Movie | null>;
  findBySwapiId(swapiId: string): Promise<Movie | null>;
  remove(movie: Movie): Promise<void>;
}
