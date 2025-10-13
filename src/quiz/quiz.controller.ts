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
    description: 'Retrieves 5 random Star Wars questions to answer',
  })
  @ApiResponse({
    status: 200,
    description: 'Questions retrieved successfully',
    type: [QuestionDto],
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - invalid or missing JWT token',
  })
  @ApiNotFoundResponse({
    description: 'Not enough questions available',
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
    description:
      'Submits quiz answers and returns the results. IMPORTANT: You must send exactly the 5 question IDs received from the GET /quiz/questions endpoint in the request body. Each questionId must match the UUIDs provided in the questions response.',
  })
  @ApiResponse({
    status: 200,
    description: 'Answers evaluated successfully',
    type: QuizResultDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - invalid or missing JWT token',
  })
  @ApiBadRequestResponse({
    description:
      'Invalid data, question already answered, or question IDs do not match the ones received from GET /quiz/questions',
  })
  @ApiNotFoundResponse({ description: 'Question not found' })
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
    description: 'Retrieves the total score of the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Score retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        score: { type: 'number', example: 42 },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - invalid or missing JWT token',
  })
  async getMyScore(@CurrentUser() user: JwtUser): Promise<{ score: number }> {
    const score = await this.quizService.getUserScore(user.id);
    return { score };
  }
}
