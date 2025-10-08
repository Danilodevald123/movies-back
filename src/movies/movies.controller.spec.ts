import { Test, TestingModule } from '@nestjs/testing';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/entities/user.entity';

describe('MoviesController', () => {
  let controller: MoviesController;

  const mockMovie = {
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

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    role: UserRole.ADMIN,
  };

  const mockMoviesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    syncWithSwapi: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoviesController],
      providers: [
        {
          provide: MoviesService,
          useValue: mockMoviesService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<MoviesController>(MoviesController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of movies', async () => {
      const movies = [mockMovie];
      const findAllMock = mockMoviesService.findAll.mockResolvedValue(movies);

      const result = await controller.findAll();

      expect(findAllMock).toHaveBeenCalled();
      expect(result).toEqual(movies);
    });
  });

  describe('findOne', () => {
    it('should return a single movie', async () => {
      const movieId = '123e4567-e89b-12d3-a456-426614174000';
      const findOneMock =
        mockMoviesService.findOne.mockResolvedValue(mockMovie);

      const result = await controller.findOne(movieId);

      expect(findOneMock).toHaveBeenCalledWith(movieId);
      expect(result).toEqual(mockMovie);
    });
  });

  describe('create', () => {
    const createMovieDto: CreateMovieDto = {
      title: 'New Movie',
      director: 'Director',
      releaseDate: '2024-01-01',
    };

    it('should create a new movie', async () => {
      const createMock = mockMoviesService.create.mockResolvedValue(mockMovie);

      const result = await controller.create(createMovieDto, mockUser);

      expect(createMock).toHaveBeenCalledWith(createMovieDto, mockUser.id);
      expect(result).toEqual(mockMovie);
    });
  });

  describe('update', () => {
    const movieId = '123e4567-e89b-12d3-a456-426614174000';
    const updateMovieDto: UpdateMovieDto = {
      title: 'Updated Title',
    };

    it('should update a movie', async () => {
      const updatedMovie = { ...mockMovie, title: 'Updated Title' };
      const updateMock =
        mockMoviesService.update.mockResolvedValue(updatedMovie);

      const result = await controller.update(movieId, updateMovieDto);

      expect(updateMock).toHaveBeenCalledWith(movieId, updateMovieDto);
      expect(result).toEqual(updatedMovie);
    });
  });

  describe('remove', () => {
    const movieId = '123e4567-e89b-12d3-a456-426614174000';

    it('should remove a movie', async () => {
      const removeMock = mockMoviesService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(movieId);

      expect(removeMock).toHaveBeenCalledWith(movieId);
      expect(result).toBeUndefined();
    });
  });

  describe('syncWithSwapi', () => {
    it('should sync movies from SWAPI', async () => {
      const syncResult = { synced: 6, errors: 0 };
      const syncMock =
        mockMoviesService.syncWithSwapi.mockResolvedValue(syncResult);

      const result = await controller.syncWithSwapi();

      expect(syncMock).toHaveBeenCalled();
      expect(result).toEqual(syncResult);
    });
  });
});
