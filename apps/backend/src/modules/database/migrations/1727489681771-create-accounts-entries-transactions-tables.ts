import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateAccountsEntriesTransactionsTables1727489681771
  implements MigrationInterface
{
  name = 'CreateAccountsEntriesTransactionsTables1727489681771'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "id" character varying(24) NOT NULL, "email" character varying(255) NOT NULL, CONSTRAINT "PK_users_id" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_users_email" ON "users" ("email") `
    )
    await queryRunner.query(
      `CREATE TABLE "accounts" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "id" character varying(24) NOT NULL, "type" text NOT NULL, "name" text, "balance_in_cents" integer NOT NULL, "user_id" character varying(24), CONSTRAINT "PK_accounts_id" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_accounts_name" ON "accounts" ("name") `
    )
    await queryRunner.query(
      `CREATE TABLE "entries" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "id" character varying(24) NOT NULL, "amount_in_cents" integer NOT NULL, "type" text NOT NULL, "account_id" character varying(24), "transaction_id" character varying(24), CONSTRAINT "PK_entries_id" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "transactions" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "id" character varying(24) NOT NULL, "description" text NOT NULL, CONSTRAINT "PK_transactions_id" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD CONSTRAINT "FK_accounts_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "entries" ADD CONSTRAINT "FK_entries_account_id" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "entries" ADD CONSTRAINT "FK_entries_transaction_id" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "entries" DROP CONSTRAINT "FK_entries_transaction_id"`
    )
    await queryRunner.query(
      `ALTER TABLE "entries" DROP CONSTRAINT "FK_entries_account_id"`
    )
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP CONSTRAINT "FK_accounts_user_id"`
    )
    await queryRunner.query(`DROP TABLE "transactions"`)
    await queryRunner.query(`DROP TABLE "entries"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_accounts_name"`)
    await queryRunner.query(`DROP TABLE "accounts"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_users_email"`)
    await queryRunner.query(`DROP TABLE "users"`)
  }
}
