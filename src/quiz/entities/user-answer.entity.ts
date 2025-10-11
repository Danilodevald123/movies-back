import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Question } from './question.entity';

@Entity('user_answers')
export class UserAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'question_id' })
  questionId: string;

  @ManyToOne(() => Question, { eager: true })
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @Column({ name: 'selected_answer', type: 'enum', enum: ['A', 'B', 'C'] })
  selectedAnswer: 'A' | 'B' | 'C';

  @Column({ name: 'is_correct' })
  isCorrect: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
