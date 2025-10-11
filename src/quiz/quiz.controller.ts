import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { QuizService } from './quiz.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtUser } from '../auth/interfaces/jwt-user.interface';
import { AnswerQuizDto } from './dto/answer-quiz.dto';
import { QuestionDto, QuizResultDto } from './dto/quiz-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  THROTTLE_TTL,
  THROTTLE_LIMIT_QUIZ_QUESTIONS,
  THROTTLE_LIMIT_QUIZ_SUBMIT,
  THROTTLE_LIMIT_DEFAULT,
} from '../common/constants/app.constants';

@ApiTags('quiz')
@ApiBearerAuth('JWT-auth')
@Controller('quiz')
@UseGuards(JwtAuthGuard)
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get('questions')
  @Throttle({
    default: { limit: THROTTLE_LIMIT_QUIZ_QUESTIONS, ttl: THROTTLE_TTL },
  })
  @ApiOperation({
    summary: 'Get 5 random Star Wars questions',
    description: 'Obtiene 5 preguntas aleatorias de Star Wars para responder',
  })
  @ApiResponse({
    status: 200,
    description: 'Preguntas obtenidas exitosamente',
    type: [QuestionDto],
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  @ApiNotFoundResponse({
    description: 'No hay suficientes preguntas disponibles',
  })
  async getQuestions(): Promise<QuestionDto[]> {
    return this.quizService.getQuestions();
  }

  @Post('submit')
  @HttpCode(HttpStatus.OK)
  @Throttle({
    default: { limit: THROTTLE_LIMIT_QUIZ_SUBMIT, ttl: THROTTLE_TTL },
  })
  @ApiOperation({
    summary: 'Submit quiz answers',
    description: 'Envía las respuestas del quiz y obtiene los resultados',
  })
  @ApiResponse({
    status: 200,
    description: 'Respuestas evaluadas exitosamente',
    type: QuizResultDto,
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  @ApiBadRequestResponse({
    description: 'Datos inválidos o pregunta ya respondida',
  })
  @ApiNotFoundResponse({ description: 'Pregunta no encontrada' })
  async submitAnswers(
    @CurrentUser() user: JwtUser,
    @Body() answerQuizDto: AnswerQuizDto,
  ): Promise<QuizResultDto> {
    return this.quizService.submitAnswers(user.id, answerQuizDto);
  }

  @Get('my-score')
  @Throttle({ default: { limit: THROTTLE_LIMIT_DEFAULT, ttl: THROTTLE_TTL } })
  @ApiOperation({
    summary: 'Get user score',
    description: 'Obtiene el puntaje total del usuario autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Puntaje obtenido exitosamente',
    schema: {
      type: 'object',
      properties: {
        score: { type: 'number', example: 42 },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'No autorizado' })
  async getMyScore(@CurrentUser() user: JwtUser): Promise<{ score: number }> {
    const score = await this.quizService.getUserScore(user.id);
    return { score };
  }
}
