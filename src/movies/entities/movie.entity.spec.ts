import { Movie } from './movie.entity';
import { User, UserRole } from '../../users/entities/user.entity';

describe('Movie Entity', () => {
  let movie: Movie;

  beforeEach(() => {
    movie = new Movie();
  });

  it('should be defined', () => {
    expect(movie).toBeDefined();
  });

  it('should create a movie with all properties', () => {
    const now = new Date();

    movie.id = 'movie-uuid';
    movie.title = 'A New Hope';
    movie.episodeId = 4;
    movie.openingCrawl = 'It is a period of civil war...';
    movie.director = 'George Lucas';
    movie.producer = 'Gary Kurtz';
    movie.releaseDate = new Date('1977-05-25');
    movie.swapiId = '1';
    movie.swapiUrl = 'https://swapi.tech/api/films/1';
    movie.createdById = 'user-uuid';
    movie.createdAt = now;
    movie.updatedAt = now;

    expect(movie.id).toBe('movie-uuid');
    expect(movie.title).toBe('A New Hope');
    expect(movie.episodeId).toBe(4);
    expect(movie.openingCrawl).toBe('It is a period of civil war...');
    expect(movie.director).toBe('George Lucas');
    expect(movie.producer).toBe('Gary Kurtz');
    expect(movie.releaseDate).toEqual(new Date('1977-05-25'));
    expect(movie.swapiId).toBe('1');
    expect(movie.swapiUrl).toBe('https://swapi.tech/api/films/1');
    expect(movie.createdById).toBe('user-uuid');
    expect(movie.createdAt).toBe(now);
    expect(movie.updatedAt).toBe(now);
  });

  it('should allow nullable fields', () => {
    movie.title = 'Test Movie';
    movie.director = 'Test Director';
    movie.releaseDate = new Date();

    expect(movie.episodeId).toBeUndefined();
    expect(movie.openingCrawl).toBeUndefined();
    expect(movie.producer).toBeUndefined();
    expect(movie.swapiId).toBeUndefined();
    expect(movie.swapiUrl).toBeUndefined();
    expect(movie.createdById).toBeUndefined();
  });

  it('should support createdBy relationship', () => {
    const user = new User();
    user.id = 'user-uuid';
    user.email = 'admin@example.com';
    user.role = UserRole.ADMIN;

    movie.createdBy = user;
    movie.createdById = user.id;

    expect(movie.createdBy).toBe(user);
    expect(movie.createdById).toBe('user-uuid');
  });

  it('should handle date fields correctly', () => {
    const releaseDate = new Date('1977-05-25');
    const createdAt = new Date('2025-01-01');
    const updatedAt = new Date('2025-01-02');

    movie.releaseDate = releaseDate;
    movie.createdAt = createdAt;
    movie.updatedAt = updatedAt;

    expect(movie.releaseDate).toEqual(releaseDate);
    expect(movie.createdAt).toEqual(createdAt);
    expect(movie.updatedAt).toEqual(updatedAt);
  });
});
