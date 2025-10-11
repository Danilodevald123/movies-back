import { DataSource } from 'typeorm';
import { Question } from '../../quiz/entities/question.entity';

export const questionsSeed = [
  {
    question: '¿Quién es el padre de Luke Skywalker?',
    optionA: 'Obi-Wan Kenobi',
    optionB: 'Darth Vader',
    optionC: 'Palpatine',
    correctAnswer: 'B' as const,
  },
  {
    question: '¿Qué especie es Chewbacca?',
    optionA: 'Wookiee',
    optionB: 'Ewok',
    optionC: 'Hutt',
    correctAnswer: 'A' as const,
  },
  {
    question: '¿Cómo se llama la nave de Han Solo?',
    optionA: 'X-Wing',
    optionB: 'Halcón Milenario',
    optionC: 'Estrella de la Muerte',
    correctAnswer: 'B' as const,
  },
  {
    question: '¿Qué color es el sable de luz de Mace Windu?',
    optionA: 'Verde',
    optionB: 'Rojo',
    optionC: 'Púrpura',
    correctAnswer: 'C' as const,
  },
  {
    question: '¿En qué planeta vive Yoda en el exilio?',
    optionA: 'Tatooine',
    optionB: 'Dagobah',
    optionC: 'Endor',
    correctAnswer: 'B' as const,
  },
  {
    question: '¿Quién mató a Jabba the Hutt?',
    optionA: 'Luke Skywalker',
    optionB: 'Han Solo',
    optionC: 'Princesa Leia',
    correctAnswer: 'C' as const,
  },
  {
    question: '¿Cómo se llama el maestro de Obi-Wan Kenobi?',
    optionA: 'Qui-Gon Jinn',
    optionB: 'Mace Windu',
    optionC: 'Yoda',
    correctAnswer: 'A' as const,
  },
  {
    question: '¿Qué droide acompaña a R2-D2 en toda la saga?',
    optionA: 'BB-8',
    optionB: 'C-3PO',
    optionC: 'K-2SO',
    correctAnswer: 'B' as const,
  },
  {
    question: '¿Quién es el Canciller Supremo que se convierte en Emperador?',
    optionA: 'Darth Maul',
    optionB: 'Count Dooku',
    optionC: 'Palpatine',
    correctAnswer: 'C' as const,
  },
  {
    question:
      '¿Cuál es el nombre real de Darth Vader antes de convertirse al lado oscuro?',
    optionA: 'Anakin Skywalker',
    optionB: 'Ben Solo',
    optionC: 'Luke Skywalker',
    correctAnswer: 'A' as const,
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
