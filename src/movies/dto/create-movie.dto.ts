import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  MaxLength,
  IsDateString,
} from 'class-validator';

export class CreateMovieDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsInt()
  @IsOptional()
  episodeId?: number;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  openingCrawl?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  director: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  producer?: string;

  @IsDateString()
  releaseDate: string;
}
