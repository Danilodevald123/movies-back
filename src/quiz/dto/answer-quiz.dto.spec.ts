import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { AnswerQuizDto, AnswerItem } from './answer-quiz.dto';

// UUID v4 válidos (3er grupo empieza con 4, 4to grupo empieza con 8-b)
const VALID_UUID = '123e4567-e89b-42d3-a456-426614174000';
const VALID_UUID_2 = '987fcdeb-51a2-43f7-9b6d-123456789abc';
const VALID_UUID_3 = 'a1b2c3d4-e5f6-4789-b012-3456789abcde';
const VALID_UUID_4 = 'f0e1d2c3-b4a5-4968-9777-888999aaabbb';
const VALID_UUID_5 = '11223344-5566-4778-8899-aabbccddeeff';

describe('AnswerQuizDto', () => {
  describe('AnswerItem', () => {
    it('should validate with correct data', async () => {
      const item = plainToInstance(AnswerItem, {
        questionId: VALID_UUID,
        answer: 'A',
      });

      const errors = await validate(item);
      expect(errors).toHaveLength(0);
    });

    it('should accept valid answer letters (A, B, C)', async () => {
      const validLetters = ['A', 'B', 'C'];

      for (const letter of validLetters) {
        const item = plainToInstance(AnswerItem, {
          questionId: VALID_UUID,
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
          questionId: VALID_UUID,
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
        questionId: VALID_UUID,
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
          { questionId: VALID_UUID, answer: 'A' },
          { questionId: VALID_UUID_2, answer: 'B' },
          { questionId: VALID_UUID_3, answer: 'C' },
          { questionId: VALID_UUID_4, answer: 'A' },
          { questionId: VALID_UUID_5, answer: 'B' },
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
          { questionId: VALID_UUID, answer: 'INVALID' },
          { questionId: VALID_UUID_2, answer: 'B' },
          { questionId: VALID_UUID_3, answer: 'C' },
          { questionId: VALID_UUID_4, answer: 'A' },
          { questionId: VALID_UUID_5, answer: 'B' },
        ],
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should validate all items in array', async () => {
      const dto = plainToInstance(AnswerQuizDto, {
        answers: [
          { questionId: VALID_UUID, answer: 'A' },
          { questionId: VALID_UUID_2 },
          { questionId: VALID_UUID_3, answer: 'C' },
          { questionId: VALID_UUID_4, answer: 'A' },
          { questionId: VALID_UUID_5, answer: 'B' },
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
          { questionId: VALID_UUID, answer: 'A' },
          { questionId: VALID_UUID_2, answer: 'B' },
          { questionId: VALID_UUID_3, answer: 'C' },
        ],
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate complex valid scenario', async () => {
      const dto = plainToInstance(AnswerQuizDto, {
        answers: [
          {
            questionId: VALID_UUID,
            answer: 'A',
          },
          {
            questionId: VALID_UUID_2,
            answer: 'B',
          },
          { questionId: VALID_UUID_3, answer: 'C' },
          { questionId: VALID_UUID_4, answer: 'A' },
          { questionId: VALID_UUID_5, answer: 'B' },
        ],
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });
});
