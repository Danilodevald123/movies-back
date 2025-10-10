import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { Question } from '../../quiz/entities/question.entity';
import { UserAnswer } from '../../quiz/entities/user-answer.entity';
import { User } from '../../users/entities/user.entity';
import { Movie } from '../../movies/entities/movie.entity';
import { seedQuestions } from './questions.seed';

config();

const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'conexa',
  entities: [User, Movie, Question, UserAnswer],
  synchronize: false,
  logging: false,
};

async function runSeed() {
  const dataSource = new DataSource(dataSourceOptions);

  try {
    await dataSource.initialize();
    console.log('Conexión a la base de datos establecida');

    await seedQuestions(dataSource);

    console.log('Seed completado exitosamente');
  } catch (error) {
    console.error('Error ejecutando el seed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

void runSeed();
