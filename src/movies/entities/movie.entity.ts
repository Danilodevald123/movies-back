import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('movies')
export class Movie {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ name: 'episode_id', type: 'int', nullable: true })
  episodeId: number;

  @Column({ type: 'text', nullable: true })
  openingCrawl: string;

  @Column()
  director: string;

  @Column({ nullable: true })
  producer: string;

  @Column({ name: 'release_date', type: 'date' })
  releaseDate: Date;

  @Column({ name: 'swapi_id', nullable: true, unique: true })
  swapiId: string;

  @Column({ name: 'swapi_url', nullable: true })
  swapiUrl: string;

  @Column({ name: 'created_by_id', nullable: true })
  createdById: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
