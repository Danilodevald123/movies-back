/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { validate } from 'class-validator';
import { CreateMovieDto } from './create-movie.dto';

describe('CreateMovieDto', () => {
  it('should pass validation with valid minimal data', async () => {
    const dto = new CreateMovieDto();
    dto.title = 'A New Hope';
    dto.director = 'George Lucas';
    dto.releaseDate = '1977-05-25';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass validation with all fields', async () => {
    const dto = new CreateMovieDto();
    dto.title = 'The Empire Strikes Back';
    dto.episodeId = 5;
    dto.openingCrawl = 'It is a dark time for the Rebellion...';
    dto.director = 'Irvin Kershner';
    dto.producer = 'Gary Kurtz, Rick McCallum';
    dto.releaseDate = '1980-05-17';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if title is missing', async () => {
    const dto = new CreateMovieDto();
    dto.director = 'George Lucas';
    dto.releaseDate = '1977-05-25';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'title')).toBe(true);
  });

  it('should fail if title is empty string', async () => {
    const dto = new CreateMovieDto();
    dto.title = '';
    dto.director = 'George Lucas';
    dto.releaseDate = '1977-05-25';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'title')).toBe(true);
  });

  it('should fail if title exceeds max length', async () => {
    const dto = new CreateMovieDto();
    dto.title = 'a'.repeat(201);
    dto.director = 'George Lucas';
    dto.releaseDate = '1977-05-25';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('title');
    expect(errors[0].constraints).toHaveProperty('maxLength');
  });

  it('should fail if director is missing', async () => {
    const dto = new CreateMovieDto();
    dto.title = 'A New Hope';
    dto.releaseDate = '1977-05-25';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'director')).toBe(true);
  });

  it('should fail if releaseDate is invalid', async () => {
    const dto = new CreateMovieDto();
    dto.title = 'A New Hope';
    dto.director = 'George Lucas';
    dto.releaseDate = 'not-a-date';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('releaseDate');
    expect(errors[0].constraints).toHaveProperty('isDateString');
  });

  it('should fail if episodeId is not an integer', async () => {
    const dto = new CreateMovieDto();
    dto.title = 'A New Hope';
    dto.director = 'George Lucas';
    dto.releaseDate = '1977-05-25';
    dto.episodeId = 4.5 as any;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('episodeId');
    expect(errors[0].constraints).toHaveProperty('isInt');
  });
});
