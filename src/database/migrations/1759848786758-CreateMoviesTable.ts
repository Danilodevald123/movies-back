import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMoviesTable1759848786758 implements MigrationInterface {
  name = 'CreateMoviesTable1759848786758';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "movies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "episode_id" integer, "openingCrawl" text, "director" character varying NOT NULL, "producer" character varying, "release_date" date NOT NULL, "swapi_id" character varying, "swapi_url" character varying, "created_by_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_c925d35378b4694d866a7ef2024" UNIQUE ("swapi_id"), CONSTRAINT "PK_c5b2c134e871bfd1c2fe7cc3705" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "movies" ADD CONSTRAINT "FK_9a31cbfd8d2c6d53fced96e62b5" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "movies" DROP CONSTRAINT "FK_9a31cbfd8d2c6d53fced96e62b5"`,
    );
    await queryRunner.query(`DROP TABLE "movies"`);
  }
}
