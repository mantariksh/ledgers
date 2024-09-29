import { Migration } from '@mikro-orm/migrations'

export class Migration20240929141321 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "account" ("id" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "type" text not null, "name" text null, "balance_in_cents" int not null, constraint "account_pkey" primary key ("id"));`
    )
    this.addSql(`create index "account_name_index" on "account" ("name");`)

    this.addSql(
      `create table "transaction" ("id" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "description" text not null, constraint "transaction_pkey" primary key ("id"));`
    )

    this.addSql(
      `create table "entry" ("id" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "amount_in_cents" int not null, "type" text not null, "account_id" varchar(255) not null, "transaction_id" varchar(255) not null, constraint "entry_pkey" primary key ("id"));`
    )

    this.addSql(
      `create table "user" ("id" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "email" text not null, "wallet_account_id" varchar(255) not null, constraint "user_pkey" primary key ("id"));`
    )
    this.addSql(
      `alter table "user" add constraint "user_email_unique" unique ("email");`
    )
    this.addSql(
      `alter table "user" add constraint "user_wallet_account_id_unique" unique ("wallet_account_id");`
    )

    this.addSql(
      `alter table "entry" add constraint "entry_account_id_foreign" foreign key ("account_id") references "account" ("id") on update cascade;`
    )
    this.addSql(
      `alter table "entry" add constraint "entry_transaction_id_foreign" foreign key ("transaction_id") references "transaction" ("id") on update cascade;`
    )

    this.addSql(
      `alter table "user" add constraint "user_wallet_account_id_foreign" foreign key ("wallet_account_id") references "account" ("id") on update cascade;`
    )
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "entry" drop constraint "entry_account_id_foreign";`
    )

    this.addSql(
      `alter table "user" drop constraint "user_wallet_account_id_foreign";`
    )

    this.addSql(
      `alter table "entry" drop constraint "entry_transaction_id_foreign";`
    )

    this.addSql(`drop table if exists "account" cascade;`)

    this.addSql(`drop table if exists "transaction" cascade;`)

    this.addSql(`drop table if exists "entry" cascade;`)

    this.addSql(`drop table if exists "user" cascade;`)
  }
}
