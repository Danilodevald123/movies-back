import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  IQuestionRepository,
  QUESTION_REPOSITORY,
} from './repositories/question.repository.interface';
import {
  IUserAnswerRepository,
  USER_ANSWER_REPOSITORY,
} from './repositories/user-answer.repository.interface';
import { QuestionDto, QuizResultDto } from './dto/quiz-response.dto';
import { AnswerQuizDto } from './dto/answer-quiz.dto';
import { QUIZ_QUESTIONS_COUNT } from '../common/constants/app.constants';

@Injectable()
export class QuizService {
  constructor(
    @Inject(QUESTION_REPOSITORY)
    private readonly questionRepository: IQuestionRepository,
    @Inject(USER_ANSWER_REPOSITORY)
    private readonly userAnswerRepository: IUserAnswerRepository,
  ) {}

  async getQuestions(): Promise<QuestionDto[]> {
    const questions =
      await this.questionRepository.findRandomActive(QUIZ_QUESTIONS_COUNT);

    if (questions.length < QUIZ_QUESTIONS_COUNT) {
      throw new NotFoundException(
        'Not enough questions available in the system',
      );
    }

    return questions.map((q) => ({
      id: q.id,
      question: q.question,
      options: {
        A: q.optionA,
        B: q.optionB,
        C: q.optionC,
      },
    }));
  }

  async submitAnswers(
    userId: string,
    answerQuizDto: AnswerQuizDto,
  ): Promise<QuizResultDto> {
    if (answerQuizDto.answers.length !== QUIZ_QUESTIONS_COUNT) {
      throw new BadRequestException(
        `You must answer all ${QUIZ_QUESTIONS_COUNT} questions`,
      );
    }

    const questionIds = answerQuizDto.answers.map((a) => a.questionId);
    const uniqueIds = new Set(questionIds);
    if (uniqueIds.size !== questionIds.length) {
      throw new BadRequestException(
        'You cannot answer the same question more than once',
      );
    }

    const results = [];
    let correctCount = 0;

    for (const answer of answerQuizDto.answers) {
      const question = await this.questionRepository.findById(
        answer.questionId,
      );

      if (!question) {
        throw new NotFoundException(
          `Question with ID ${answer.questionId} not found`,
        );
      }

      const isCorrect = answer.answer === question.correctAnswer;
      if (isCorrect) correctCount++;

      const userAnswer = this.userAnswerRepository.create({
        userId,
        questionId: answer.questionId,
        selectedAnswer: answer.answer,
        isCorrect,
      });

      await this.userAnswerRepository.save(userAnswer);

      const selectedText = question[`option${answer.answer}`];
      const correctText = question[`option${question.correctAnswer}`];

      results.push({
        questionId: question.id,
        question: question.question,
        selectedAnswer: {
          letter: answer.answer,
          text: selectedText,
        },
        correctAnswer: {
          letter: question.correctAnswer,
          text: correctText,
        },
        isCorrect,
      });
    }

    return {
      totalQuestions: QUIZ_QUESTIONS_COUNT,
      correctAnswers: correctCount,
      score: correctCount,
      answers: results,
    };
  }

  async getUserScore(userId: string): Promise<number> {
    return this.userAnswerRepository.countCorrectAnswersByUser(userId);
  }
}
