import { ApiProperty } from '@nestjs/swagger';
import { Movie } from '../entities/movie.entity';

export class MovieResponseDto {
  @ApiProperty({
    description: 'Movie unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Movie title',
    example: 'A New Hope',
  })
  title: string;

  @ApiProperty({
    description: 'Episode number',
    example: 4,
  })
  episodeId: number;

  @ApiProperty({
    description: 'Opening crawl text',
    example: 'It is a period of civil war...',
  })
  openingCrawl: string;

  @ApiProperty({
    description: 'Director name',
    example: 'George Lucas',
  })
  director: string;

  @ApiProperty({
    description: 'Producer name',
    example: 'Gary Kurtz, Rick McCallum',
  })
  producer: string;

  @ApiProperty({
    description: 'Release date',
    example: '1977-05-25T00:00:00.000Z',
  })
  releaseDate: Date;

  @ApiProperty({
    description: 'SWAPI ID',
    example: '1',
  })
  swapiId: string;

  @ApiProperty({
    description: 'SWAPI URL',
    example: 'https://swapi.tech/api/films/1',
  })
  swapiUrl: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-01-08T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-01-08T10:30:00.000Z',
  })
  updatedAt: Date;

  static fromEntity(movie: Movie): MovieResponseDto {
    return {
      id: movie.id,
      title: movie.title,
      episodeId: movie.episodeId,
      openingCrawl: movie.openingCrawl,
      director: movie.director,
      producer: movie.producer,
      releaseDate: movie.releaseDate,
      swapiId: movie.swapiId,
      swapiUrl: movie.swapiUrl,
      createdAt: movie.createdAt,
      updatedAt: movie.updatedAt,
    };
  }
}
