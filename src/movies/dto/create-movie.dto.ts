import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  MaxLength,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMovieDto {
  @ApiProperty({
    description: 'Movie title',
    example: 'A New Hope',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: 'Episode number in the saga',
    example: 4,
    required: false,
  })
  @IsInt()
  @IsOptional()
  episodeId?: number;

  @ApiProperty({
    description: 'Opening crawl text from the movie',
    example: 'It is a period of civil war...',
    maxLength: 2000,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  openingCrawl?: string;

  @ApiProperty({
    description: 'Movie director name',
    example: 'George Lucas',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  director: string;

  @ApiProperty({
    description: 'Movie producer name(s)',
    example: 'Gary Kurtz, Rick McCallum',
    maxLength: 200,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  producer?: string;

  @ApiProperty({
    description: 'Movie release date (ISO 8601 format)',
    example: '1977-05-25',
    format: 'date',
  })
  @IsDateString()
  releaseDate: string;
}
