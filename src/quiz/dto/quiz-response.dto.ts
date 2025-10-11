import { ApiProperty } from '@nestjs/swagger';

export class QuestionDto {
  @ApiProperty({ example: '961303df-aa80-496f-a968-3d69986248fc' })
  id: string;

  @ApiProperty({ example: '¿En qué planeta vive Yoda en el exilio?' })
  question: string;

  @ApiProperty({
    description: 'Opciones disponibles con letra como clave',
    example: {
      A: 'Tatooine',
      B: 'Dagobah',
      C: 'Endor',
    },
  })
  options: {
    A: string;
    B: string;
    C: string;
  };
}

export class AnswerDetailDto {
  @ApiProperty({ example: 'A' })
  letter: 'A' | 'B' | 'C';

  @ApiProperty({ example: 'Anakin Skywalker' })
  text: string;
}

export class QuizAnswerResultDto {
  @ApiProperty({ example: 'b1c1304f-f0b4-4bb5-9c51-c56314a35f71' })
  questionId: string;

  @ApiProperty({
    example: '¿Quién es el Canciller Supremo que se convierte en Emperador?',
  })
  question: string;

  @ApiProperty({ type: AnswerDetailDto })
  selectedAnswer: AnswerDetailDto;

  @ApiProperty({ type: AnswerDetailDto })
  correctAnswer: AnswerDetailDto;

  @ApiProperty({ example: false })
  isCorrect: boolean;
}

export class QuizResultDto {
  @ApiProperty({ example: 5 })
  totalQuestions: number;

  @ApiProperty({ example: 2 })
  correctAnswers: number;

  @ApiProperty({ example: 40 })
  score: number;

  @ApiProperty({ type: [QuizAnswerResultDto] })
  answers: QuizAnswerResultDto[];
}
