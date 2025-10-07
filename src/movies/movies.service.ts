import {
  Injectable,
  NotFoundException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
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
    const movie = this.movieRepository.create({
      ...createMovieDto,
      createdById: userId,
    });
    return await this.movieRepository.save(movie);
  }

  async findAll(): Promise<Movie[]> {
    return await this.movieRepository.find({
      order: { releaseDate: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Movie> {
    const movie = await this.movieRepository.findOne({ where: { id } });

    if (!movie) {
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }

    return movie;
  }

  async update(id: string, updateMovieDto: UpdateMovieDto): Promise<Movie> {
    const movie = await this.findOne(id);

    Object.assign(movie, updateMovieDto);
    return await this.movieRepository.save(movie);
  }

  async remove(id: string): Promise<void> {
    const movie = await this.findOne(id);
    await this.movieRepository.remove(movie);
  }

  async syncWithSwapi(): Promise<{ synced: number; errors: number }> {
    this.logger.log('Starting SWAPI synchronization...');

    const swapiUrl = this.configService.get<string>('SWAPI_BASE_URL');
    let synced = 0;
    let errors = 0;

    try {
      const response = await fetch(`${swapiUrl}/films`);
      const data = (await response.json()) as SwapiResponse;

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
          this.logger.log(`✅ Synced: ${film.properties.title}`);
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
      this.logger.error(`Failed to fetch from SWAPI: ${errorMessage}`);
      throw new ConflictException('Failed to sync with SWAPI');
    }
  }
}
