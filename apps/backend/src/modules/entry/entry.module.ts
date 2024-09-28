import { Module } from '@nestjs/common'
import { EntryController } from './entry.controller'
import { EntryService } from './entry.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Entry } from 'modules/database/entities/entry.entity'
import { Account } from 'modules/database/entities/account.entity'
import { Transaction } from 'modules/database/entities/transaction.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Entry, Account, Transaction])],
  controllers: [EntryController],
  providers: [EntryService],
})
export class EntryModule {}
