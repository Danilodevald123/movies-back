import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserAnswersTable1760000000002 implements MigrationInterface {
  name = 'CreateUserAnswersTable1760000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "user_answers_selected_answer_enum" AS ENUM('A', 'B', 'C')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_answers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "question_id" uuid NOT NULL, "selected_answer" "user_answers_selected_answer_enum" NOT NULL, "is_correct" boolean NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e4ac0c2a23ca89250207157c0e1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_answers" ADD CONSTRAINT "FK_user_answers_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_answers" ADD CONSTRAINT "FK_user_answers_question_id" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_answers" DROP CONSTRAINT "FK_user_answers_question_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_answers" DROP CONSTRAINT "FK_user_answers_user_id"`,
    );
    await queryRunner.query(`DROP TABLE "user_answers"`);
    await queryRunner.query(`DROP TYPE "user_answers_selected_answer_enum"`);
  }
}
