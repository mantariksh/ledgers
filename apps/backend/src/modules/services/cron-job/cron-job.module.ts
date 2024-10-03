import { Global, Module } from '@nestjs/common'

import { BullModule } from '@nestjs/bullmq'
import { CRON_JOB_QUEUE_NAME } from 'common/constants/queues'
import { InvestModule } from 'modules/invest/invest.module'
import { CronJobProcessor } from './cron-job.processor'
import { CronJobService } from './cron-job.service'
import { LoanModule } from 'modules/loan/loan.module'

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: CRON_JOB_QUEUE_NAME,
    }),
    InvestModule,
    LoanModule,
  ],
  providers: [CronJobService, CronJobProcessor],
  exports: [CronJobService],
})
export class CronJobModule {}
