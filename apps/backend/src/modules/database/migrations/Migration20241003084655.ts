import { Migration } from '@mikro-orm/migrations'

export class Migration20241003084655 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "investment" ("id" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "investor_id" varchar(255) not null, "principal_in_cents" int not null, "interest_rate" real not null, "compounding_frequency" varchar(255) not null, "num_compounds_in_term" int not null, "num_compounds_remaining" int not null, "next_compounding_time" timestamptz null, "payout_transaction_id" varchar(255) null, constraint "investment_pkey" primary key ("id"));`
    )
    this.addSql(
      `alter table "investment" add constraint "investment_payout_transaction_id_unique" unique ("payout_transaction_id");`
    )

    this.addSql(
      `create table "investment_interest_transactions" ("investment_id" varchar(255) not null, "transaction_id" varchar(255) not null, constraint "investment_interest_transactions_pkey" primary key ("investment_id", "transaction_id"));`
    )

    this.addSql(
      `alter table "investment" add constraint "investment_investor_id_foreign" foreign key ("investor_id") references "user" ("id") on update cascade;`
    )
    this.addSql(
      `alter table "investment" add constraint "investment_payout_transaction_id_foreign" foreign key ("payout_transaction_id") references "transaction" ("id") on update cascade on delete set null;`
    )

    this.addSql(
      `alter table "investment_interest_transactions" add constraint "investment_interest_transactions_investment_id_foreign" foreign key ("investment_id") references "investment" ("id") on update cascade on delete cascade;`
    )
    this.addSql(
      `alter table "investment_interest_transactions" add constraint "investment_interest_transactions_transaction_id_foreign" foreign key ("transaction_id") references "transaction" ("id") on update cascade on delete cascade;`
    )
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "investment_interest_transactions" drop constraint "investment_interest_transactions_investment_id_foreign";`
    )

    this.addSql(`drop table if exists "investment" cascade;`)

    this.addSql(
      `drop table if exists "investment_interest_transactions" cascade;`
    )
  }
}
