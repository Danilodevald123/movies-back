import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { Question } from './entities/question.entity';
import { UserAnswer } from './entities/user-answer.entity';
import { QUESTION_REPOSITORY } from './repositories/question.repository.interface';
import { USER_ANSWER_REPOSITORY } from './repositories/user-answer.repository.interface';
import { AnswerQuizDto } from './dto/answer-quiz.dto';

describe('QuizService', () => {
  let service: QuizService;

  const mockQuestions: Partial<Question>[] = [
    {
      id: 'q1',
      question: '¿En qué planeta vive Yoda en el exilio?',
      optionA: 'Tatooine',
      optionB: 'Dagobah',
      optionC: 'Endor',
      correctAnswer: 'B',
      active: true,
    },
    {
      id: 'q2',
      question: '¿Qué especie es Chewbacca?',
      optionA: 'Wookiee',
      optionB: 'Ewok',
      optionC: 'Hutt',
      correctAnswer: 'A',
      active: true,
    },
    {
      id: 'q3',
      question: '¿Cómo se llama el maestro de Obi-Wan Kenobi?',
      optionA: 'Qui-Gon Jinn',
      optionB: 'Mace Windu',
      optionC: 'Yoda',
      correctAnswer: 'A',
      active: true,
    },
    {
      id: 'q4',
      question: '¿Quién es el Canciller Supremo que se convierte en Emperador?',
      optionA: 'Darth Maul',
      optionB: 'Count Dooku',
      optionC: 'Palpatine',
      correctAnswer: 'C',
      active: true,
    },
    {
      id: 'q5',
      question: '¿Qué color es el sable de luz de Mace Windu?',
      optionA: 'Verde',
      optionB: 'Rojo',
      optionC: 'Púrpura',
      correctAnswer: 'C',
      active: true,
    },
  ];

  const mockQuestionRepository = {
    findRandomActive: jest.fn(),
    findById: jest.fn(),
  };

  const mockUserAnswerRepository = {
    create: jest.fn(),
    save: jest.fn(),
    countCorrectAnswersByUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizService,
        {
          provide: QUESTION_REPOSITORY,
          useValue: mockQuestionRepository,
        },
        {
          provide: USER_ANSWER_REPOSITORY,
          useValue: mockUserAnswerRepository,
        },
      ],
    }).compile();

    service = module.get<QuizService>(QuizService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getQuestions', () => {
    it('should return 5 random questions with formatted options', async () => {
      mockQuestionRepository.findRandomActive.mockResolvedValue(mockQuestions);

      const result = await service.getQuestions();

      expect(result).toHaveLength(5);
      expect(result[0]).toEqual({
        id: 'q1',
        question: '¿En qué planeta vive Yoda en el exilio?',
        options: {
          A: 'Tatooine',
          B: 'Dagobah',
          C: 'Endor',
        },
      });
      expect(mockQuestionRepository.findRandomActive).toHaveBeenCalledWith(5);
    });

    it('should throw NotFoundException if less than 5 questions are available', async () => {
      mockQuestionRepository.findRandomActive.mockResolvedValue(
        mockQuestions.slice(0, 3),
      );

      await expect(service.getQuestions()).rejects.toThrow(NotFoundException);
      await expect(service.getQuestions()).rejects.toThrow(
        'No hay suficientes preguntas disponibles en el sistema',
      );
    });

    it('should map all question fields correctly', async () => {
      mockQuestionRepository.findRandomActive.mockResolvedValue([
        mockQuestions[0],
        mockQuestions[1],
        mockQuestions[2],
        mockQuestions[3],
        mockQuestions[4],
      ]);

      const result = await service.getQuestions();

      expect(result[1]).toEqual({
        id: 'q2',
        question: '¿Qué especie es Chewbacca?',
        options: {
          A: 'Wookiee',
          B: 'Ewok',
          C: 'Hutt',
        },
      });
    });
  });

  describe('submitAnswers', () => {
    const userId = 'user-123';
    const validAnswerDto: AnswerQuizDto = {
      answers: [
        { questionId: 'q1', answer: 'B' },
        { questionId: 'q2', answer: 'A' },
        { questionId: 'q3', answer: 'A' },
        { questionId: 'q4', answer: 'C' },
        { questionId: 'q5', answer: 'C' },
      ],
    };

    beforeEach(() => {
      mockQuestionRepository.findById.mockImplementation((id: string) => {
        return Promise.resolve(mockQuestions.find((q) => q.id === id));
      });

      mockUserAnswerRepository.create.mockImplementation(
        (data: Partial<UserAnswer>) => data,
      );
      mockUserAnswerRepository.save.mockResolvedValue({});
    });

    it('should throw BadRequestException if not exactly 5 answers', async () => {
      const invalidDto: AnswerQuizDto = {
        answers: [
          { questionId: 'q1', answer: 'B' },
          { questionId: 'q2', answer: 'A' },
        ],
      };

      await expect(service.submitAnswers(userId, invalidDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.submitAnswers(userId, invalidDto)).rejects.toThrow(
        'Debes responder las 5 preguntas',
      );
    });

    it('should throw NotFoundException if question does not exist', async () => {
      const invalidDto: AnswerQuizDto = {
        answers: [
          { questionId: 'invalid-id', answer: 'A' },
          { questionId: 'q2', answer: 'A' },
          { questionId: 'q3', answer: 'A' },
          { questionId: 'q4', answer: 'A' },
          { questionId: 'q5', answer: 'A' },
        ],
      };

      mockQuestionRepository.findById.mockResolvedValueOnce(null);

      await expect(service.submitAnswers(userId, invalidDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.submitAnswers(userId, invalidDto)).rejects.toThrow(
        'Pregunta con ID invalid-id no encontrada',
      );
    });

    it('should calculate score correctly with all correct answers', async () => {
      const result = await service.submitAnswers(userId, validAnswerDto);

      expect(result.totalQuestions).toBe(5);
      expect(result.correctAnswers).toBe(5);
      expect(result.score).toBe(100);
      expect(result.answers).toHaveLength(5);
    });

    it('should calculate score correctly with mixed answers', async () => {
      const mixedAnswers: AnswerQuizDto = {
        answers: [
          { questionId: 'q1', answer: 'A' },
          { questionId: 'q2', answer: 'A' },
          { questionId: 'q3', answer: 'B' },
          { questionId: 'q4', answer: 'C' },
          { questionId: 'q5', answer: 'C' },
        ],
      };

      const result = await service.submitAnswers(userId, mixedAnswers);

      expect(result.totalQuestions).toBe(5);
      expect(result.correctAnswers).toBe(3);
      expect(result.score).toBe(60);
    });

    it('should return detailed answer results with selected and correct texts', async () => {
      const result = await service.submitAnswers(userId, validAnswerDto);

      expect(result.answers[0]).toEqual({
        questionId: 'q1',
        question: '¿En qué planeta vive Yoda en el exilio?',
        selectedAnswer: {
          letter: 'B',
          text: 'Dagobah',
        },
        correctAnswer: {
          letter: 'B',
          text: 'Dagobah',
        },
        isCorrect: true,
      });
    });

    it('should show incorrect answer details when wrong', async () => {
      const wrongAnswer: AnswerQuizDto = {
        answers: [
          { questionId: 'q1', answer: 'A' },
          { questionId: 'q2', answer: 'A' },
          { questionId: 'q3', answer: 'A' },
          { questionId: 'q4', answer: 'C' },
          { questionId: 'q5', answer: 'C' },
        ],
      };

      const result = await service.submitAnswers(userId, wrongAnswer);

      expect(result.answers[0]).toEqual({
        questionId: 'q1',
        question: '¿En qué planeta vive Yoda en el exilio?',
        selectedAnswer: {
          letter: 'A',
          text: 'Tatooine',
        },
        correctAnswer: {
          letter: 'B',
          text: 'Dagobah',
        },
        isCorrect: false,
      });
    });

    it('should save all user answers to repository', async () => {
      await service.submitAnswers(userId, validAnswerDto);

      expect(mockUserAnswerRepository.create).toHaveBeenCalledTimes(5);
      expect(mockUserAnswerRepository.save).toHaveBeenCalledTimes(5);

      expect(mockUserAnswerRepository.create).toHaveBeenCalledWith({
        userId,
        questionId: 'q1',
        selectedAnswer: 'B',
        isCorrect: true,
      });
    });

    it('should handle all incorrect answers', async () => {
      const allWrong: AnswerQuizDto = {
        answers: [
          { questionId: 'q1', answer: 'A' },
          { questionId: 'q2', answer: 'B' },
          { questionId: 'q3', answer: 'B' },
          { questionId: 'q4', answer: 'A' },
          { questionId: 'q5', answer: 'A' },
        ],
      };

      const result = await service.submitAnswers(userId, allWrong);

      expect(result.correctAnswers).toBe(0);
      expect(result.score).toBe(0);
      expect(result.answers.every((a) => !a.isCorrect)).toBe(true);
    });
  });

  describe('getUserScore', () => {
    it('should return user score from repository', async () => {
      const userId = 'user-123';
      const expectedScore = 42;

      mockUserAnswerRepository.countCorrectAnswersByUser.mockResolvedValue(
        expectedScore,
      );

      const result = await service.getUserScore(userId);

      expect(result).toBe(expectedScore);
      expect(
        mockUserAnswerRepository.countCorrectAnswersByUser,
      ).toHaveBeenCalledWith(userId);
    });

    it('should return 0 if user has no correct answers', async () => {
      const userId = 'user-456';

      mockUserAnswerRepository.countCorrectAnswersByUser.mockResolvedValue(0);

      const result = await service.getUserScore(userId);

      expect(result).toBe(0);
    });

    it('should handle different user scores', async () => {
      const testCases = [
        { userId: 'user-1', score: 5 },
        { userId: 'user-2', score: 10 },
        { userId: 'user-3', score: 100 },
      ];

      for (const testCase of testCases) {
        mockUserAnswerRepository.countCorrectAnswersByUser.mockResolvedValue(
          testCase.score,
        );

        const result = await service.getUserScore(testCase.userId);

        expect(result).toBe(testCase.score);
      }
    });
  });
});
