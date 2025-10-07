import {
  Injectable,
  NotFoundException,
  Logger,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { validate as isValidUUID } from 'uuid';
import { Movie } from './entities/movie.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

interface SwapiFilm {
  properties: {
    title: string;
    episode_id: number;
    opening_crawl: string;
    director: string;
    producer: string;
    release_date: string;
    url: string;
  };
  uid: string;
}

interface SwapiResponse {
  message: string;
  result: SwapiFilm[];
}

@Injectable()
export class MoviesService {
  private readonly logger = new Logger(MoviesService.name);

  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    private readonly configService: ConfigService,
  ) {}

  async create(createMovieDto: CreateMovieDto, userId: string): Promise<Movie> {
    this.logger.log(`Creating new movie: "${createMovieDto.title}"`);

    try {
      const movie = this.movieRepository.create({
        ...createMovieDto,
        createdById: userId,
      });

      const savedMovie = await this.movieRepository.save(movie);
      this.logger.log(`Movie created successfully: ${savedMovie.id}`);

      return savedMovie;
    } catch (error) {
      this.logger.error(
        `Failed to create movie "${createMovieDto.title}": ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );

      if (error instanceof Error && error.message.includes('duplicate')) {
        throw new ConflictException('A movie with similar data already exists');
      }

      throw new InternalServerErrorException(
        'Failed to create movie. Please try again later.',
      );
    }
  }

  async findAll(): Promise<Movie[]> {
    this.logger.log('Fetching all movies');

    try {
      const movies = await this.movieRepository.find({
        order: { releaseDate: 'DESC' },
      });

      this.logger.log(`Retrieved ${movies.length} movies`);
      return movies;
    } catch (error) {
      this.logger.error(
        `Failed to fetch movies: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );

      throw new InternalServerErrorException(
        'Failed to retrieve movies. Please try again later.',
      );
    }
  }

  async findOne(id: string): Promise<Movie> {
    this.logger.log(`Fetching movie with ID: ${id}`);

    if (!isValidUUID(id)) {
      this.logger.warn(`Invalid UUID format: ${id}`);
      throw new BadRequestException('Invalid movie ID format');
    }

    try {
      const movie = await this.movieRepository.findOne({ where: { id } });

      if (!movie) {
        this.logger.warn(`Movie not found: ${id}`);
        throw new NotFoundException(`Movie with ID ${id} not found`);
      }

      this.logger.log(`Movie found: ${movie.title}`);
      return movie;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      this.logger.error(
        `Failed to fetch movie ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );

      throw new InternalServerErrorException(
        'Failed to retrieve movie. Please try again later.',
      );
    }
  }

  async update(id: string, updateMovieDto: UpdateMovieDto): Promise<Movie> {
    this.logger.log(`Updating movie: ${id}`);

    const movie = await this.findOne(id);

    try {
      Object.assign(movie, updateMovieDto);
      const updatedMovie = await this.movieRepository.save(movie);

      this.logger.log(`Movie updated successfully: ${updatedMovie.title}`);
      return updatedMovie;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }

      this.logger.error(
        `Failed to update movie ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );

      throw new InternalServerErrorException(
        'Failed to update movie. Please try again later.',
      );
    }
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Deleting movie: ${id}`);

    const movie = await this.findOne(id);

    try {
      await this.movieRepository.remove(movie);
      this.logger.log(`Movie deleted successfully: ${movie.title}`);
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }

      this.logger.error(
        `Failed to delete movie ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );

      throw new InternalServerErrorException(
        'Failed to delete movie. Please try again later.',
      );
    }
  }

  async syncWithSwapi(): Promise<{ synced: number; errors: number }> {
    this.logger.log('Starting SWAPI synchronization...');

    const swapiUrl = this.configService.get<string>('SWAPI_BASE_URL');

    if (!swapiUrl) {
      this.logger.error('SWAPI_BASE_URL not configured');
      throw new InternalServerErrorException('SWAPI URL not configured');
    }

    let synced = 0;
    let errors = 0;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${swapiUrl}/films`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `SWAPI returned status ${response.status}: ${response.statusText}`,
        );
      }

      const data = (await response.json()) as SwapiResponse;

      if (!data.result || !Array.isArray(data.result)) {
        throw new Error('Invalid SWAPI response format');
      }

      this.logger.log(`Fetched ${data.result.length} films from SWAPI`);

      for (const film of data.result) {
        try {
          const existingMovie = await this.movieRepository.findOne({
            where: { swapiId: film.uid },
          });

          if (existingMovie) {
            this.logger.log(
              `Movie "${film.properties.title}" already exists, skipping...`,
            );
            continue;
          }

          const movie = this.movieRepository.create({
            title: film.properties.title,
            episodeId: film.properties.episode_id,
            openingCrawl: film.properties.opening_crawl,
            director: film.properties.director,
            producer: film.properties.producer,
            releaseDate: new Date(film.properties.release_date),
            swapiId: film.uid,
            swapiUrl: film.properties.url,
          });

          await this.movieRepository.save(movie);
          synced++;
          this.logger.log(`Synced: ${film.properties.title}`);
        } catch (error) {
          errors++;
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(
            `Error syncing film "${film.properties.title}": ${errorMessage}`,
          );
        }
      }

      this.logger.log(`Sync completed: ${synced} synced, ${errors} errors`);
      return { synced, errors };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error(
        `Failed to sync with SWAPI: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new InternalServerErrorException(
            'SWAPI request timed out. Please try again later.',
          );
        }

        if (error.message.includes('fetch failed')) {
          throw new InternalServerErrorException(
            'Unable to connect to SWAPI. Please check your internet connection.',
          );
        }

        if (error.message.includes('Invalid SWAPI response')) {
          throw new InternalServerErrorException(
            'Received invalid data from SWAPI. Please try again later.',
          );
        }
      }
      throw new InternalServerErrorException(
        'Failed to sync with SWAPI. Please try again later.',
      );
    }
  }
}
