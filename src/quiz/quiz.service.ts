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

@Injectable()
export class QuizService {
  constructor(
    @Inject(QUESTION_REPOSITORY)
    private readonly questionRepository: IQuestionRepository,
    @Inject(USER_ANSWER_REPOSITORY)
    private readonly userAnswerRepository: IUserAnswerRepository,
  ) {}

  async getQuestions(): Promise<QuestionDto[]> {
    const questions = await this.questionRepository.findRandomActive(5);

    if (questions.length < 5) {
      throw new NotFoundException(
        'No hay suficientes preguntas disponibles en el sistema',
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
    if (answerQuizDto.answers.length !== 5) {
      throw new BadRequestException('Debes responder las 5 preguntas');
    }

    const results = [];
    let correctCount = 0;

    for (const answer of answerQuizDto.answers) {
      const question = await this.questionRepository.findById(
        answer.questionId,
      );

      if (!question) {
        throw new NotFoundException(
          `Pregunta con ID ${answer.questionId} no encontrada`,
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

    const score = (correctCount / 5) * 100;

    return {
      totalQuestions: 5,
      correctAnswers: correctCount,
      score,
      answers: results,
    };
  }

  async getUserScore(userId: string): Promise<number> {
    return this.userAnswerRepository.countCorrectAnswersByUser(userId);
  }
}
