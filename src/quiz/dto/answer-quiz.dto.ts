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
    description: 'ID de la pregunta',
    example: '961303df-aa80-496f-a968-3d69986248fc',
  })
  @IsUUID('4', { message: 'questionId debe ser un UUID válido' })
  questionId: string;

  @ApiProperty({
    description: 'Respuesta seleccionada (A, B o C)',
    enum: AnswerOption,
    example: 'B',
  })
  @IsEnum(AnswerOption, {
    message: 'answer debe ser uno de los siguientes valores: A, B, C',
  })
  answer: AnswerOption;
}

export class AnswerQuizDto {
  @ApiProperty({
    description: 'Array con las 5 respuestas del quiz',
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
