import { Migration } from '@mikro-orm/migrations'

export class Migration20241003134704 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "loan" add column "current_outstanding_amount_in_cents" int not null;`
    )
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "loan" drop column "current_outstanding_amount_in_cents";`
    )
  }
}
