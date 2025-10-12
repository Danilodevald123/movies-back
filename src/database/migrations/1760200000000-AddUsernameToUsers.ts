import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUsernameToUsers1760200000000 implements MigrationInterface {
  name = 'AddUsernameToUsers1760200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "username" character varying`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_users_username" ON "users" ("username") WHERE "username" IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "UQ_users_username"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "username"`);
  }
}
