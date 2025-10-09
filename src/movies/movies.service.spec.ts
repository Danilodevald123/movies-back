import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import { Movie } from './entities/movie.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

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
    createdById: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
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
          provide: getRepositoryToken(Movie),
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
      mockRepository.create.mockReturnValue(mockMovie);
      mockRepository.save.mockResolvedValue(mockMovie);

      const result = await service.create(createDto, 'user-123');

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createDto,
        createdById: 'user-123',
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockMovie);
      expect(result).toEqual(mockMovie);
    });

    it('should throw InternalServerErrorException on database error', async () => {
      mockRepository.create.mockReturnValue(mockMovie);
      mockRepository.save.mockRejectedValue(new Error('DB Error'));

      await expect(service.create(createDto, 'user-123')).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw ConflictException on duplicate error', async () => {
      const duplicateError = new Error(
        'duplicate key value violates unique constraint',
      );
      mockRepository.create.mockReturnValue(mockMovie);
      mockRepository.save.mockRejectedValue(duplicateError);

      await expect(service.create(createDto, 'user-123')).rejects.toThrow(
        'A movie with similar data already exists',
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of movies', async () => {
      const movies = [mockMovie];
      mockRepository.find.mockResolvedValue(movies);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        order: { releaseDate: 'DESC' },
      });
      expect(result).toEqual(movies);
    });

    it('should throw InternalServerErrorException on database error', async () => {
      mockRepository.find.mockRejectedValue(new Error('DB Error'));

      await expect(service.findAll()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    const validUuid = '123e4567-e89b-12d3-a456-426614174000';

    it('should return a movie by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockMovie);

      const result = await service.findOne(validUuid);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: validUuid },
      });
      expect(result).toEqual(mockMovie);
    });

    it('should throw NotFoundException if movie not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(validUuid)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException on database error', async () => {
      mockRepository.findOne.mockRejectedValue(new Error('DB Error'));

      await expect(service.findOne(validUuid)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('update', () => {
    const validUuid = '123e4567-e89b-12d3-a456-426614174000';
    const updateDto: UpdateMovieDto = {
      title: 'Updated Title',
    };

    it('should update a movie', async () => {
      const updatedMovie = { ...mockMovie, title: 'Updated Title' };
      mockRepository.findOne.mockResolvedValue(mockMovie);
      mockRepository.save.mockResolvedValue(updatedMovie);

      const result = await service.update(validUuid, updateDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: validUuid },
      });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.title).toBe('Updated Title');
    });

    it('should throw NotFoundException if movie not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(validUuid, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    const validUuid = '123e4567-e89b-12d3-a456-426614174000';

    it('should remove a movie', async () => {
      mockRepository.findOne.mockResolvedValue(mockMovie);
      mockRepository.remove.mockResolvedValue(mockMovie);

      await service.remove(validUuid);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: validUuid },
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockMovie);
    });

    it('should throw NotFoundException if movie not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(validUuid)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException on database error during remove', async () => {
      mockRepository.findOne.mockResolvedValue(mockMovie);
      mockRepository.remove.mockRejectedValue(new Error('DB Error'));

      await expect(service.remove(validUuid)).rejects.toThrow(
        InternalServerErrorException,
      );
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
      mockRepository.findOne.mockResolvedValue(null);
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
      mockRepository.findOne.mockResolvedValue(mockMovie);

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
      mockRepository.findOne.mockResolvedValue(null);
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
