import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Account } from 'modules/database/entities/account.entity'
import { Entry } from 'modules/database/entities/entry.entity'
import { Transaction } from 'modules/database/entities/transaction.entity'
import { EntryService } from './entry.service'

@Module({
  imports: [TypeOrmModule.forFeature([Entry, Account, Transaction])],
  providers: [EntryService],
  exports: [EntryService],
})
export class EntryModule {}
