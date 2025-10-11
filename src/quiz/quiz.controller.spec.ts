import { Test, TestingModule } from '@nestjs/testing';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { AnswerQuizDto, AnswerOption } from './dto/answer-quiz.dto';
import { JwtUser } from '../auth/interfaces/jwt-user.interface';
import { UserRole } from '../users/entities/user.entity';

describe('QuizController', () => {
  let controller: QuizController;

  const mockQuestions = [
    {
      id: 'q1',
      question: '¿En qué planeta vive Yoda en el exilio?',
      options: {
        A: 'Tatooine',
        B: 'Dagobah',
        C: 'Endor',
      },
    },
    {
      id: 'q2',
      question: '¿Qué especie es Chewbacca?',
      options: {
        A: 'Wookiee',
        B: 'Ewok',
        C: 'Hutt',
      },
    },
    {
      id: 'q3',
      question: '¿Cómo se llama el maestro de Obi-Wan Kenobi?',
      options: {
        A: 'Qui-Gon Jinn',
        B: 'Mace Windu',
        C: 'Yoda',
      },
    },
    {
      id: 'q4',
      question: '¿Quién es el Canciller Supremo que se convierte en Emperador?',
      options: {
        A: 'Darth Maul',
        B: 'Count Dooku',
        C: 'Palpatine',
      },
    },
    {
      id: 'q5',
      question: '¿Qué color es el sable de luz de Mace Windu?',
      options: {
        A: 'Verde',
        B: 'Rojo',
        C: 'Púrpura',
      },
    },
  ];

  const mockQuizResult = {
    totalQuestions: 5,
    correctAnswers: 3,
    score: 60,
    answers: [
      {
        questionId: 'q1',
        question: '¿En qué planeta vive Yoda en el exilio?',
        selectedAnswer: {
          letter: 'B' as const,
          text: 'Dagobah',
        },
        correctAnswer: {
          letter: 'B' as const,
          text: 'Dagobah',
        },
        isCorrect: true,
      },
      {
        questionId: 'q2',
        question: '¿Qué especie es Chewbacca?',
        selectedAnswer: {
          letter: 'A' as const,
          text: 'Wookiee',
        },
        correctAnswer: {
          letter: 'A' as const,
          text: 'Wookiee',
        },
        isCorrect: true,
      },
      {
        questionId: 'q3',
        question: '¿Cómo se llama el maestro de Obi-Wan Kenobi?',
        selectedAnswer: {
          letter: 'B' as const,
          text: 'Mace Windu',
        },
        correctAnswer: {
          letter: 'A' as const,
          text: 'Qui-Gon Jinn',
        },
        isCorrect: false,
      },
      {
        questionId: 'q4',
        question:
          '¿Quién es el Canciller Supremo que se convierte en Emperador?',
        selectedAnswer: {
          letter: 'C' as const,
          text: 'Palpatine',
        },
        correctAnswer: {
          letter: 'C' as const,
          text: 'Palpatine',
        },
        isCorrect: true,
      },
      {
        questionId: 'q5',
        question: '¿Qué color es el sable de luz de Mace Windu?',
        selectedAnswer: {
          letter: 'A' as const,
          text: 'Verde',
        },
        correctAnswer: {
          letter: 'C' as const,
          text: 'Púrpura',
        },
        isCorrect: false,
      },
    ],
  };

  const mockUser: JwtUser = {
    id: 'user-123',
    email: 'test@example.com',
    role: UserRole.USER,
  };

  const mockQuizService = {
    getQuestions: jest.fn(),
    submitAnswers: jest.fn(),
    getUserScore: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuizController],
      providers: [
        {
          provide: QuizService,
          useValue: mockQuizService,
        },
      ],
    }).compile();

    controller = module.get<QuizController>(QuizController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getQuestions', () => {
    it('should return 5 random questions', async () => {
      mockQuizService.getQuestions.mockResolvedValue(mockQuestions);

      const result = await controller.getQuestions();

      expect(result).toEqual(mockQuestions);
      expect(result).toHaveLength(5);
      expect(mockQuizService.getQuestions).toHaveBeenCalledTimes(1);
    });

    it('should return questions with proper structure', async () => {
      mockQuizService.getQuestions.mockResolvedValue(mockQuestions);

      const result = await controller.getQuestions();

      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('question');
      expect(result[0]).toHaveProperty('options');
      expect(result[0].options).toHaveProperty('A');
      expect(result[0].options).toHaveProperty('B');
      expect(result[0].options).toHaveProperty('C');
    });

    it('should propagate service errors', async () => {
      mockQuizService.getQuestions.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(controller.getQuestions()).rejects.toThrow('Database error');
    });
  });

  describe('submitAnswers', () => {
    const answerDto: AnswerQuizDto = {
      answers: [
        { questionId: 'q1', answer: AnswerOption.B },
        { questionId: 'q2', answer: AnswerOption.A },
        { questionId: 'q3', answer: AnswerOption.B },
        { questionId: 'q4', answer: AnswerOption.C },
        { questionId: 'q5', answer: AnswerOption.A },
      ],
    };

    it('should submit answers and return quiz result', async () => {
      mockQuizService.submitAnswers.mockResolvedValue(mockQuizResult);

      const result = await controller.submitAnswers(mockUser, answerDto);

      expect(result).toEqual(mockQuizResult);
      expect(mockQuizService.submitAnswers).toHaveBeenCalledWith(
        mockUser.id,
        answerDto,
      );
    });

    it('should pass correct user id to service', async () => {
      mockQuizService.submitAnswers.mockResolvedValue(mockQuizResult);

      await controller.submitAnswers(mockUser, answerDto);

      expect(mockQuizService.submitAnswers).toHaveBeenCalledWith(
        'user-123',
        answerDto,
      );
    });

    it('should return result with score calculation', async () => {
      mockQuizService.submitAnswers.mockResolvedValue(mockQuizResult);

      const result = await controller.submitAnswers(mockUser, answerDto);

      expect(result.totalQuestions).toBe(5);
      expect(result.correctAnswers).toBe(3);
      expect(result.score).toBe(60);
      expect(result.answers).toHaveLength(5);
    });

    it('should return detailed answer information', async () => {
      mockQuizService.submitAnswers.mockResolvedValue(mockQuizResult);

      const result = await controller.submitAnswers(mockUser, answerDto);

      expect(result.answers[0].selectedAnswer).toHaveProperty('letter');
      expect(result.answers[0].selectedAnswer).toHaveProperty('text');
      expect(result.answers[0].correctAnswer).toHaveProperty('letter');
      expect(result.answers[0].correctAnswer).toHaveProperty('text');
      expect(result.answers[0]).toHaveProperty('isCorrect');
    });

    it('should propagate validation errors from service', async () => {
      mockQuizService.submitAnswers.mockRejectedValue(
        new Error('Debes responder las 5 preguntas'),
      );

      await expect(
        controller.submitAnswers(mockUser, answerDto),
      ).rejects.toThrow('Debes responder las 5 preguntas');
    });
  });

  describe('getMyScore', () => {
    it('should return user score', async () => {
      const expectedScore = 42;
      mockQuizService.getUserScore.mockResolvedValue(expectedScore);

      const result = await controller.getMyScore(mockUser);

      expect(result).toEqual({ score: expectedScore });
      expect(mockQuizService.getUserScore).toHaveBeenCalledWith(mockUser.id);
    });

    it('should return 0 if user has no correct answers', async () => {
      mockQuizService.getUserScore.mockResolvedValue(0);

      const result = await controller.getMyScore(mockUser);

      expect(result).toEqual({ score: 0 });
    });

    it('should pass correct user id to service', async () => {
      mockQuizService.getUserScore.mockResolvedValue(15);

      await controller.getMyScore(mockUser);

      expect(mockQuizService.getUserScore).toHaveBeenCalledWith('user-123');
    });

    it('should handle different score values', async () => {
      const testScores = [0, 5, 10, 50, 100];

      for (const score of testScores) {
        mockQuizService.getUserScore.mockResolvedValue(score);

        const result = await controller.getMyScore(mockUser);

        expect(result.score).toBe(score);
      }
    });

    it('should propagate service errors', async () => {
      mockQuizService.getUserScore.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(controller.getMyScore(mockUser)).rejects.toThrow(
        'Database error',
      );
    });
  });
});
