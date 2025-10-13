import { IsArray, IsEnum, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum AnswerOption {
  A = 'A',
  B = 'B',
  C = 'C',
}

export class AnswerItem {
  @ApiProperty({
    description:
      'Question ID (must match the UUID received from GET /quiz/questions)',
    example: '961303df-aa80-496f-a968-3d69986248fc',
  })
  @IsUUID('4', { message: 'questionId must be a valid UUID' })
  questionId: string;

  @ApiProperty({
    description: 'Selected answer (A, B or C)',
    enum: AnswerOption,
    example: 'B',
  })
  @IsEnum(AnswerOption, {
    message: 'answer must be one of the following values: A, B, C',
  })
  answer: AnswerOption;
}

export class AnswerQuizDto {
  @ApiProperty({
    description:
      'Array with the 5 quiz answers. IMPORTANT: The questionId values must exactly match the UUIDs received from the GET /quiz/questions endpoint.',
    type: [AnswerItem],
    example: [
      { questionId: '961303df-aa80-496f-a968-3d69986248fc', answer: 'B' },
      { questionId: 'b297e29e-2323-4abd-b347-77dcb77bacc1', answer: 'A' },
      { questionId: '5a030447-e4a9-4fe1-af5b-74e52e50508a', answer: 'A' },
      { questionId: 'b1c1304f-f0b4-4bb5-9c51-c56314a35f71', answer: 'C' },
      { questionId: 'f0be9d9b-a290-4eaf-9f82-5a7ac9e34841', answer: 'C' },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerItem)
  answers: AnswerItem[];
}
