import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AnswerOption } from '../dto/answer-quiz.dto';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  question: string;

  @Column({ name: 'option_a' })
  optionA: string;

  @Column({ name: 'option_b' })
  optionB: string;

  @Column({ name: 'option_c' })
  optionC: string;

  @Column({ name: 'correct_answer', type: 'enum', enum: AnswerOption })
  correctAnswer: AnswerOption;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
