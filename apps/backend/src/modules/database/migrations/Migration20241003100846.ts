import { Migration } from '@mikro-orm/migrations'

export class Migration20241003100846 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "loan" ("id" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "borrower_id" varchar(255) not null, "principal_in_cents" int not null, "remaining_principal_in_cents" int not null, "interest_rate" real not null, "compounding_frequency" varchar(255) not null, "num_compounds_in_term" int not null, "next_compounding_time" timestamptz null, constraint "loan_pkey" primary key ("id"));`
    )

    this.addSql(
      `create table "loan_payment_transactions" ("loan_id" varchar(255) not null, "transaction_id" varchar(255) not null, constraint "loan_payment_transactions_pkey" primary key ("loan_id", "transaction_id"));`
    )

    this.addSql(
      `create table "loan_interest_transactions" ("loan_id" varchar(255) not null, "transaction_id" varchar(255) not null, constraint "loan_interest_transactions_pkey" primary key ("loan_id", "transaction_id"));`
    )

    this.addSql(
      `alter table "loan" add constraint "loan_borrower_id_foreign" foreign key ("borrower_id") references "user" ("id") on update cascade;`
    )

    this.addSql(
      `alter table "loan_payment_transactions" add constraint "loan_payment_transactions_loan_id_foreign" foreign key ("loan_id") references "loan" ("id") on update cascade on delete cascade;`
    )
    this.addSql(
      `alter table "loan_payment_transactions" add constraint "loan_payment_transactions_transaction_id_foreign" foreign key ("transaction_id") references "transaction" ("id") on update cascade on delete cascade;`
    )

    this.addSql(
      `alter table "loan_interest_transactions" add constraint "loan_interest_transactions_loan_id_foreign" foreign key ("loan_id") references "loan" ("id") on update cascade on delete cascade;`
    )
    this.addSql(
      `alter table "loan_interest_transactions" add constraint "loan_interest_transactions_transaction_id_foreign" foreign key ("transaction_id") references "transaction" ("id") on update cascade on delete cascade;`
    )
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "loan_payment_transactions" drop constraint "loan_payment_transactions_loan_id_foreign";`
    )

    this.addSql(
      `alter table "loan_interest_transactions" drop constraint "loan_interest_transactions_loan_id_foreign";`
    )

    this.addSql(`drop table if exists "loan" cascade;`)

    this.addSql(`drop table if exists "loan_payment_transactions" cascade;`)

    this.addSql(`drop table if exists "loan_interest_transactions" cascade;`)
  }
}
