import {
  Injectable,
  NotFoundException,
  Logger,
  ConflictException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MovieResponseDto } from './dto/movie-response.dto';
import {
  IMovieRepository,
  MOVIE_REPOSITORY,
} from './repositories/movie.repository.interface';

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
    @Inject(MOVIE_REPOSITORY)
    private readonly movieRepository: IMovieRepository,
    private readonly configService: ConfigService,
  ) {}

  async create(
    createMovieDto: CreateMovieDto,
    userId: string,
  ): Promise<MovieResponseDto> {
    if (createMovieDto.episodeId) {
      const existingByEpisode = await this.movieRepository.findByEpisodeId(
        createMovieDto.episodeId,
      );
      if (existingByEpisode) {
        throw new ConflictException(
          `Episode ${createMovieDto.episodeId} already exists`,
        );
      }
    }

    const movie = this.movieRepository.create({
      ...createMovieDto,
      releaseDate: new Date(createMovieDto.releaseDate),
      createdById: userId,
    });

    const savedMovie = await this.movieRepository.save(movie);
    return MovieResponseDto.fromEntity(savedMovie);
  }

  async findAll(): Promise<MovieResponseDto[]> {
    const movies = await this.movieRepository.findAll({
      field: 'releaseDate',
      direction: 'DESC',
    });
    return movies.map((movie) => MovieResponseDto.fromEntity(movie));
  }

  async findOne(id: string): Promise<MovieResponseDto> {
    const movie = await this.movieRepository.findById(id);

    if (!movie) {
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }

    return MovieResponseDto.fromEntity(movie);
  }

  async update(
    id: string,
    updateMovieDto: UpdateMovieDto,
  ): Promise<MovieResponseDto> {
    const movie = await this.movieRepository.findById(id);

    if (!movie) {
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }

    Object.assign(movie, updateMovieDto);
    const updatedMovie = await this.movieRepository.save(movie);
    return MovieResponseDto.fromEntity(updatedMovie);
  }

  async remove(id: string): Promise<void> {
    const movie = await this.movieRepository.findById(id);

    if (!movie) {
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }

    await this.movieRepository.remove(movie);
  }

  @Cron(CronExpression.EVERY_SECOND)
  async scheduledSwapiSync() {
    this.logger.log('Starting scheduled SWAPI sync (cron job)');
    try {
      const result = await this.syncWithSwapi();
      this.logger.log(
        `Scheduled sync completed: ${result.synced} synced, ${result.errors} errors`,
      );
    } catch (error) {
      this.logger.error('Scheduled sync failed', error);
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
          const existingMovie = await this.movieRepository.findBySwapiId(
            film.uid,
          );

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
