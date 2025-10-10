import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateQuestionsTable1760000000001 implements MigrationInterface {
  name = 'CreateQuestionsTable1760000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "questions_correct_answer_enum" AS ENUM('A', 'B', 'C')`,
    );
    await queryRunner.query(
      `CREATE TABLE "questions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "question" text NOT NULL, "option_a" character varying NOT NULL, "option_b" character varying NOT NULL, "option_c" character varying NOT NULL, "correct_answer" "questions_correct_answer_enum" NOT NULL, "active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_08a6d4b0f49ff300bf3a0ca60ac" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "questions"`);
    await queryRunner.query(`DROP TYPE "questions_correct_answer_enum"`);
  }
}
