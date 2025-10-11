import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { AnswerQuizDto, AnswerItem } from './answer-quiz.dto';

describe('AnswerQuizDto', () => {
  describe('AnswerItem', () => {
    it('should validate with correct data', async () => {
      const item = plainToInstance(AnswerItem, {
        questionId: 'q1',
        answer: 'A',
      });

      const errors = await validate(item);
      expect(errors).toHaveLength(0);
    });

    it('should accept valid answer letters (A, B, C)', async () => {
      const validLetters = ['A', 'B', 'C'];

      for (const letter of validLetters) {
        const item = plainToInstance(AnswerItem, {
          questionId: 'q1',
          answer: letter,
        });

        const errors = await validate(item);
        expect(errors).toHaveLength(0);
      }
    });

    it('should reject invalid answer letters', async () => {
      const invalidAnswers = ['D', 'a', '1', 'AB', ''];

      for (const answer of invalidAnswers) {
        const item = plainToInstance(AnswerItem, {
          questionId: 'q1',
          answer,
        });

        const errors = await validate(item);
        expect(errors.length).toBeGreaterThan(0);
      }
    });

    it('should reject missing questionId', async () => {
      const item = plainToInstance(AnswerItem, {
        answer: 'A',
      });

      const errors = await validate(item);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('questionId');
    });

    it('should reject non-string questionId', async () => {
      const item = plainToInstance(AnswerItem, {
        questionId: 123,
        answer: 'A',
      });

      const errors = await validate(item);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject missing answer', async () => {
      const item = plainToInstance(AnswerItem, {
        questionId: 'q1',
      });

      const errors = await validate(item);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('answer');
    });
  });

  describe('AnswerQuizDto', () => {
    it('should validate with 5 correct answers', async () => {
      const dto = plainToInstance(AnswerQuizDto, {
        answers: [
          { questionId: 'q1', answer: 'A' },
          { questionId: 'q2', answer: 'B' },
          { questionId: 'q3', answer: 'C' },
          { questionId: 'q4', answer: 'A' },
          { questionId: 'q5', answer: 'B' },
        ],
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject missing answers array', async () => {
      const dto = plainToInstance(AnswerQuizDto, {});

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('answers');
    });

    it('should reject non-array answers', async () => {
      const dto = plainToInstance(AnswerQuizDto, {
        answers: 'not an array',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should validate nested answer items', async () => {
      const dto = plainToInstance(AnswerQuizDto, {
        answers: [
          { questionId: 'q1', answer: 'INVALID' },
          { questionId: 'q2', answer: 'B' },
          { questionId: 'q3', answer: 'C' },
          { questionId: 'q4', answer: 'A' },
          { questionId: 'q5', answer: 'B' },
        ],
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should validate all items in array', async () => {
      const dto = plainToInstance(AnswerQuizDto, {
        answers: [
          { questionId: 'q1', answer: 'A' },
          { questionId: 'q2' },
          { questionId: 'q3', answer: 'C' },
          { questionId: 'q4', answer: 'A' },
          { questionId: 'q5', answer: 'B' },
        ],
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should accept empty array (business logic validation happens in service)', async () => {
      const dto = plainToInstance(AnswerQuizDto, {
        answers: [],
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should accept more or less than 5 answers (service validates count)', async () => {
      const dto = plainToInstance(AnswerQuizDto, {
        answers: [
          { questionId: 'q1', answer: 'A' },
          { questionId: 'q2', answer: 'B' },
          { questionId: 'q3', answer: 'C' },
        ],
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate complex valid scenario', async () => {
      const dto = plainToInstance(AnswerQuizDto, {
        answers: [
          {
            questionId: '123e4567-e89b-12d3-a456-426614174000',
            answer: 'A',
          },
          {
            questionId: '987fcdeb-51a2-43f7-8b6d-123456789abc',
            answer: 'B',
          },
          { questionId: 'q3', answer: 'C' },
          { questionId: 'q4', answer: 'A' },
          { questionId: 'q5', answer: 'B' },
        ],
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });
});
