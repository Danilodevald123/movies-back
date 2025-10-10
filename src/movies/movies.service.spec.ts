import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import {
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import { Movie } from './entities/movie.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MovieResponseDto } from './dto/movie-response.dto';
import { MOVIE_REPOSITORY } from './repositories/movie.repository.interface';

describe('MoviesService', () => {
  let service: MoviesService;

  const mockMovie: Partial<Movie> = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Movie',
    episodeId: 1,
    openingCrawl: 'Test crawl',
    director: 'Test Director',
    producer: 'Test Producer',
    releaseDate: new Date('2024-01-01'),
    swapiId: '1',
    swapiUrl: 'https://swapi.tech/api/films/1',
    createdById: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockMovieResponse: MovieResponseDto = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Movie',
    episodeId: 1,
    openingCrawl: 'Test crawl',
    director: 'Test Director',
    producer: 'Test Producer',
    releaseDate: new Date('2024-01-01'),
    swapiId: '1',
    swapiUrl: 'https://swapi.tech/api/films/1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByEpisodeId: jest.fn(),
    findBySwapiId: jest.fn(),
    remove: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: MOVIE_REPOSITORY,
          useValue: mockRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateMovieDto = {
      title: 'New Movie',
      director: 'Director',
      releaseDate: '2024-01-01',
    };

    it('should create a new movie', async () => {
      mockRepository.findByEpisodeId.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockMovie);
      mockRepository.save.mockResolvedValue(mockMovie);

      const result = await service.create(createDto, 'user-123');

      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockMovieResponse);
    });

    it('should propagate database errors', async () => {
      mockRepository.findByEpisodeId.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockMovie);
      mockRepository.save.mockRejectedValue(new Error('DB Error'));

      await expect(service.create(createDto, 'user-123')).rejects.toThrow(
        'DB Error',
      );
    });

    it('should throw ConflictException if episodeId already exists', async () => {
      const createDtoWithEpisode = { ...createDto, episodeId: 4 };
      mockRepository.findByEpisodeId.mockResolvedValue(mockMovie);

      await expect(
        service.create(createDtoWithEpisode, 'user-123'),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.create(createDtoWithEpisode, 'user-123'),
      ).rejects.toThrow('Episode 4 already exists');
    });
  });

  describe('findAll', () => {
    it('should return an array of movies', async () => {
      const movies = [mockMovie];
      mockRepository.findAll.mockResolvedValue(movies);

      const result = await service.findAll();

      expect(mockRepository.findAll).toHaveBeenCalledWith({
        field: 'releaseDate',
        direction: 'DESC',
      });
      expect(result).toEqual([mockMovieResponse]);
    });

    it('should propagate database errors', async () => {
      mockRepository.findAll.mockRejectedValue(new Error('DB Error'));

      await expect(service.findAll()).rejects.toThrow('DB Error');
    });
  });

  describe('findOne', () => {
    const validUuid = '123e4567-e89b-12d3-a456-426614174000';

    it('should return a movie by id', async () => {
      mockRepository.findById.mockResolvedValue(mockMovie);

      const result = await service.findOne(validUuid);

      expect(mockRepository.findById).toHaveBeenCalledWith(validUuid);
      expect(result).toEqual(mockMovieResponse);
    });

    it('should throw NotFoundException if movie not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findOne(validUuid)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should propagate database errors', async () => {
      mockRepository.findById.mockRejectedValue(new Error('DB Error'));

      await expect(service.findOne(validUuid)).rejects.toThrow('DB Error');
    });
  });

  describe('update', () => {
    const validUuid = '123e4567-e89b-12d3-a456-426614174000';
    const updateDto: UpdateMovieDto = {
      title: 'Updated Title',
    };

    it('should update a movie', async () => {
      const updatedMovie = { ...mockMovie, title: 'Updated Title' };
      mockRepository.findById.mockResolvedValue(mockMovie);
      mockRepository.save.mockResolvedValue(updatedMovie);

      const result = await service.update(validUuid, updateDto);

      expect(mockRepository.findById).toHaveBeenCalledWith(validUuid);
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.title).toBe('Updated Title');
    });

    it('should throw NotFoundException if movie not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.update(validUuid, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    const validUuid = '123e4567-e89b-12d3-a456-426614174000';

    it('should remove a movie', async () => {
      mockRepository.findById.mockResolvedValue(mockMovie);
      mockRepository.remove.mockResolvedValue(mockMovie);

      await service.remove(validUuid);

      expect(mockRepository.findById).toHaveBeenCalledWith(validUuid);
      expect(mockRepository.remove).toHaveBeenCalledWith(mockMovie);
    });

    it('should throw NotFoundException if movie not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.remove(validUuid)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should propagate database errors during remove', async () => {
      mockRepository.findById.mockResolvedValue(mockMovie);
      mockRepository.remove.mockRejectedValue(new Error('DB Error'));

      await expect(service.remove(validUuid)).rejects.toThrow('DB Error');
    });
  });

  describe('syncWithSwapi', () => {
    const mockSwapiResponse = {
      message: 'ok',
      result: [
        {
          properties: {
            title: 'A New Hope',
            episode_id: 4,
            opening_crawl: 'It is a period of civil war...',
            director: 'George Lucas',
            producer: 'Gary Kurtz',
            release_date: '1977-05-25',
            url: 'https://swapi.tech/api/films/1',
          },
          uid: '1',
        },
      ],
    };

    beforeEach(() => {
      mockConfigService.get.mockReturnValue('https://swapi.tech/api');
      global.fetch = jest.fn();
    });

    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllTimers();
    });

    it('should sync movies from SWAPI', async () => {
      mockRepository.findBySwapiId.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockMovie);
      mockRepository.save.mockResolvedValue(mockMovie);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockSwapiResponse),
      });

      const result = await service.syncWithSwapi();

      expect(result.synced).toBe(1);
      expect(result.errors).toBe(0);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should skip existing movies', async () => {
      mockRepository.findBySwapiId.mockResolvedValue(mockMovie);

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockSwapiResponse),
      });

      const result = await service.syncWithSwapi();

      expect(result.synced).toBe(0);
      expect(result.errors).toBe(0);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if SWAPI_BASE_URL not configured', async () => {
      mockConfigService.get.mockReturnValue(undefined);

      await expect(service.syncWithSwapi()).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw InternalServerErrorException on network error', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(service.syncWithSwapi()).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw InternalServerErrorException on invalid response', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(service.syncWithSwapi()).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw InternalServerErrorException on invalid response format', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'ok', result: null }),
      });

      await expect(service.syncWithSwapi()).rejects.toThrow(
        'Received invalid data from SWAPI. Please try again later.',
      );
    });

    it('should handle errors during individual movie sync', async () => {
      mockRepository.findBySwapiId.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockMovie);
      mockRepository.save.mockRejectedValue(new Error('Save failed'));

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockSwapiResponse),
      });

      const result = await service.syncWithSwapi();

      expect(result.synced).toBe(0);
      expect(result.errors).toBe(1);
    });

    it('should throw InternalServerErrorException on timeout', async () => {
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';
      (global.fetch as jest.Mock).mockRejectedValue(abortError);

      await expect(service.syncWithSwapi()).rejects.toThrow(
        'SWAPI request timed out. Please try again later.',
      );
    });

    it('should throw InternalServerErrorException on fetch failure', async () => {
      const fetchError = new Error('fetch failed');
      (global.fetch as jest.Mock).mockRejectedValue(fetchError);

      await expect(service.syncWithSwapi()).rejects.toThrow(
        'Unable to connect to SWAPI. Please check your internet connection.',
      );
    });
  });
});
