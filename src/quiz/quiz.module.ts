import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { Question } from './entities/question.entity';
import { UserAnswer } from './entities/user-answer.entity';
import { QuestionRepository } from './repositories/question.repository';
import { UserAnswerRepository } from './repositories/user-answer.repository';
import { QUESTION_REPOSITORY } from './repositories/question.repository.interface';
import { USER_ANSWER_REPOSITORY } from './repositories/user-answer.repository.interface';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    TypeOrmModule.forFeature([Question, UserAnswer]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [QuizController],
  providers: [
    QuizService,
    {
      provide: QUESTION_REPOSITORY,
      useClass: QuestionRepository,
    },
    {
      provide: USER_ANSWER_REPOSITORY,
      useClass: UserAnswerRepository,
    },
  ],
  exports: [QuizService],
})
export class QuizModule {}
