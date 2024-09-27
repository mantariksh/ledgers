import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateUsersTable1725941494683 implements MigrationInterface {
  name = 'CreateUsersTable1725941494683'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "id" character varying(24) NOT NULL, "email" character varying(255) NOT NULL, CONSTRAINT "PK_users_id" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_users_email" ON "users" ("email") `
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_users_email"`)
    await queryRunner.query(`DROP TABLE "users"`)
  }
}
