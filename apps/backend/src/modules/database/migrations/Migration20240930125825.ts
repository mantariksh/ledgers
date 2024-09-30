import { Migration } from '@mikro-orm/migrations'

export class Migration20240930125825 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "user" add column "borrower_principal_account_id" varchar(255) not null, add column "borrower_interest_account_id" varchar(255) not null, add column "investor_principal_account_id" varchar(255) not null, add column "investor_interest_account_id" varchar(255) not null;`
    )
    this.addSql(
      `alter table "user" add constraint "user_borrower_principal_account_id_foreign" foreign key ("borrower_principal_account_id") references "account" ("id") on update cascade;`
    )
    this.addSql(
      `alter table "user" add constraint "user_borrower_interest_account_id_foreign" foreign key ("borrower_interest_account_id") references "account" ("id") on update cascade;`
    )
    this.addSql(
      `alter table "user" add constraint "user_investor_principal_account_id_foreign" foreign key ("investor_principal_account_id") references "account" ("id") on update cascade;`
    )
    this.addSql(
      `alter table "user" add constraint "user_investor_interest_account_id_foreign" foreign key ("investor_interest_account_id") references "account" ("id") on update cascade;`
    )
    this.addSql(
      `alter table "user" add constraint "user_borrower_principal_account_id_unique" unique ("borrower_principal_account_id");`
    )
    this.addSql(
      `alter table "user" add constraint "user_borrower_interest_account_id_unique" unique ("borrower_interest_account_id");`
    )
    this.addSql(
      `alter table "user" add constraint "user_investor_principal_account_id_unique" unique ("investor_principal_account_id");`
    )
    this.addSql(
      `alter table "user" add constraint "user_investor_interest_account_id_unique" unique ("investor_interest_account_id");`
    )
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "user" drop constraint "user_borrower_principal_account_id_foreign";`
    )
    this.addSql(
      `alter table "user" drop constraint "user_borrower_interest_account_id_foreign";`
    )
    this.addSql(
      `alter table "user" drop constraint "user_investor_principal_account_id_foreign";`
    )
    this.addSql(
      `alter table "user" drop constraint "user_investor_interest_account_id_foreign";`
    )

    this.addSql(
      `alter table "user" drop constraint "user_borrower_principal_account_id_unique";`
    )
    this.addSql(
      `alter table "user" drop constraint "user_borrower_interest_account_id_unique";`
    )
    this.addSql(
      `alter table "user" drop constraint "user_investor_principal_account_id_unique";`
    )
    this.addSql(
      `alter table "user" drop constraint "user_investor_interest_account_id_unique";`
    )
    this.addSql(
      `alter table "user" drop column "borrower_principal_account_id", drop column "borrower_interest_account_id", drop column "investor_principal_account_id", drop column "investor_interest_account_id";`
    )
  }
}
