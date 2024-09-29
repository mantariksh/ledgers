import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'modules/database/entities/user.entity'
import { UserService } from './user.service'
import { Account } from 'modules/database/entities/account.entity'

@Module({
  imports: [TypeOrmModule.forFeature([User, Account])],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
