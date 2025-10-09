import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { JwtUser } from '../auth/interfaces/jwt-user.interface';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('movies')
@Controller('movies')
@UseGuards(JwtAuthGuard)
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Get all movies',
    description:
      'Retrieves all movies sorted by release date (newest first). Public endpoint.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all movies',
    schema: {
      example: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: 'A New Hope',
          episodeId: 4,
          openingCrawl: 'It is a period of civil war...',
          director: 'George Lucas',
          producer: 'Gary Kurtz',
          releaseDate: '1977-05-25T00:00:00.000Z',
          swapiId: '1',
          swapiUrl: 'https://swapi.tech/api/films/1',
          createdById: '123e4567-e89b-12d3-a456-426614174000',
          createdAt: '2025-01-08T10:30:00.000Z',
          updatedAt: '2025-01-08T10:30:00.000Z',
        },
      ],
    },
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async findAll() {
    return this.moviesService.findAll();
  }

  @Post('sync')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Sync movies from SWAPI',
    description:
      'Synchronizes Star Wars movies from SWAPI (Star Wars API). Creates new movies if they do not exist. Only accessible by ADMIN users.',
  })
  @ApiResponse({
    status: 200,
    description: 'Sync completed successfully',
    schema: {
      example: {
        message: 'SWAPI sync completed',
        synced: 6,
        errors: 0,
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - invalid or missing JWT token',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - user does not have ADMIN role',
  })
  @ApiInternalServerErrorResponse({
    description: 'SWAPI connection error or server error',
  })
  async syncWithSwapi() {
    return this.moviesService.syncWithSwapi();
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a new movie',
    description:
      'Creates a new movie in the database. Only accessible by ADMIN users.',
  })
  @ApiResponse({
    status: 201,
    description: 'Movie successfully created',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'A New Hope',
        episodeId: 4,
        openingCrawl: 'It is a period of civil war...',
        director: 'George Lucas',
        producer: 'Gary Kurtz',
        releaseDate: '1977-05-25T00:00:00.000Z',
        createdById: '123e4567-e89b-12d3-a456-426614174000',
        createdAt: '2025-01-08T10:30:00.000Z',
        updatedAt: '2025-01-08T10:30:00.000Z',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - invalid or missing JWT token',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - user does not have ADMIN role',
  })
  @ApiConflictResponse({
    description: 'Movie with similar data already exists',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async create(
    @Body() createMovieDto: CreateMovieDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.moviesService.create(createMovieDto, user.id);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get movie by ID',
    description:
      'Retrieves a specific movie by its UUID. Requires authentication.',
  })
  @ApiParam({
    name: 'id',
    description: 'Movie UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Movie found',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'A New Hope',
        episodeId: 4,
        openingCrawl: 'It is a period of civil war...',
        director: 'George Lucas',
        producer: 'Gary Kurtz',
        releaseDate: '1977-05-25T00:00:00.000Z',
        swapiId: '1',
        swapiUrl: 'https://swapi.tech/api/films/1',
        createdById: '123e4567-e89b-12d3-a456-426614174000',
        createdAt: '2025-01-08T10:30:00.000Z',
        updatedAt: '2025-01-08T10:30:00.000Z',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid UUID format',
  })
  @ApiNotFoundResponse({
    description: 'Movie not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - invalid or missing JWT token',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.moviesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update movie',
    description:
      'Updates an existing movie. Only accessible by ADMIN users. All fields are optional.',
  })
  @ApiParam({
    name: 'id',
    description: 'Movie UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Movie successfully updated',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'A New Hope - Updated',
        episodeId: 4,
        openingCrawl: 'It is a period of civil war...',
        director: 'George Lucas',
        producer: 'Gary Kurtz',
        releaseDate: '1977-05-25T00:00:00.000Z',
        createdById: '123e4567-e89b-12d3-a456-426614174000',
        createdAt: '2025-01-08T10:30:00.000Z',
        updatedAt: '2025-01-08T12:00:00.000Z',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid UUID format or input data',
  })
  @ApiNotFoundResponse({
    description: 'Movie not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - invalid or missing JWT token',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - user does not have ADMIN role',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMovieDto: UpdateMovieDto,
  ) {
    return this.moviesService.update(id, updateMovieDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete movie',
    description:
      'Deletes a movie from the database. Only accessible by ADMIN users.',
  })
  @ApiParam({
    name: 'id',
    description: 'Movie UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Movie successfully deleted',
  })
  @ApiBadRequestResponse({
    description: 'Invalid UUID format',
  })
  @ApiNotFoundResponse({
    description: 'Movie not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - invalid or missing JWT token',
  })
  @ApiForbiddenResponse({
    description: 'Forbidden - user does not have ADMIN role',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.moviesService.remove(id);
  }
}
