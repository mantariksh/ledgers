import { Module } from '@nestjs/common'

import { DatabaseModule } from 'modules/database/database.module'

import { ApiModule } from './api.module'
import { ConfigModule } from './config/config.module'
import { LoggerModule } from './core/logger.module'
import { APP_PIPE } from '@nestjs/core'
import { GlobalValidationPipe } from 'common/pipes/validation.pipe'
import { MailerModule } from './services/mailer/mailer.module'
import { BullModule } from './core/bull.module'
import { CronJobModule } from './services/cron-job/cron-job.module'

@Module({
  imports: [
    ApiModule,
    ConfigModule,
    LoggerModule,
    DatabaseModule,
    MailerModule,
    BullModule,
    CronJobModule,
  ],
  providers: [{ provide: APP_PIPE, useClass: GlobalValidationPipe }],
})
export class AppModule {}
