import { DataSource } from 'typeorm';
import { Question } from '../../quiz/entities/question.entity';
import { AnswerOption } from '../../quiz/dto/answer-quiz.dto';

export const questionsSeed = [
  {
    question: '¿Quién es el padre de Luke Skywalker?',
    optionA: 'Obi-Wan Kenobi',
    optionB: 'Darth Vader',
    optionC: 'Palpatine',
    correctAnswer: AnswerOption.B,
  },
  {
    question: '¿Qué especie es Chewbacca?',
    optionA: 'Wookiee',
    optionB: 'Ewok',
    optionC: 'Hutt',
    correctAnswer: AnswerOption.A,
  },
  {
    question: '¿Cómo se llama la nave de Han Solo?',
    optionA: 'X-Wing',
    optionB: 'Halcón Milenario',
    optionC: 'Estrella de la Muerte',
    correctAnswer: AnswerOption.B,
  },
  {
    question: '¿Qué color es el sable de luz de Mace Windu?',
    optionA: 'Verde',
    optionB: 'Rojo',
    optionC: 'Púrpura',
    correctAnswer: AnswerOption.C,
  },
  {
    question: '¿En qué planeta vive Yoda en el exilio?',
    optionA: 'Tatooine',
    optionB: 'Dagobah',
    optionC: 'Endor',
    correctAnswer: AnswerOption.B,
  },
  {
    question: '¿Quién mató a Jabba the Hutt?',
    optionA: 'Luke Skywalker',
    optionB: 'Han Solo',
    optionC: 'Princesa Leia',
    correctAnswer: AnswerOption.C,
  },
  {
    question: '¿Cómo se llama el maestro de Obi-Wan Kenobi?',
    optionA: 'Qui-Gon Jinn',
    optionB: 'Mace Windu',
    optionC: 'Yoda',
    correctAnswer: AnswerOption.A,
  },
  {
    question: '¿Qué droide acompaña a R2-D2 en toda la saga?',
    optionA: 'BB-8',
    optionB: 'C-3PO',
    optionC: 'K-2SO',
    correctAnswer: AnswerOption.B,
  },
  {
    question: '¿Quién es el Canciller Supremo que se convierte en Emperador?',
    optionA: 'Darth Maul',
    optionB: 'Count Dooku',
    optionC: 'Palpatine',
    correctAnswer: AnswerOption.C,
  },
  {
    question:
      '¿Cuál es el nombre real de Darth Vader antes de convertirse al lado oscuro?',
    optionA: 'Anakin Skywalker',
    optionB: 'Ben Solo',
    optionC: 'Luke Skywalker',
    correctAnswer: AnswerOption.A,
  },
];

export async function seedQuestions(dataSource: DataSource): Promise<void> {
  const questionRepository = dataSource.getRepository(Question);

  const existingQuestions = await questionRepository.count();
  if (existingQuestions > 0) {
    console.log('Las preguntas ya fueron seeded');
    return;
  }

  for (const questionData of questionsSeed) {
    const question = questionRepository.create(questionData);
    await questionRepository.save(question);
  }

  console.log(`${questionsSeed.length} preguntas insertadas exitosamente`);
}
