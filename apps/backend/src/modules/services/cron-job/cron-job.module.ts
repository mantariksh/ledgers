import { Global, Module } from '@nestjs/common'

import { CronJobService } from './cron-job.service'
import { BullModule } from '@nestjs/bullmq'
import { CRON_JOB_QUEUE_NAME } from 'common/constants/queues'
import { CronJobProcessor } from './cron-job.processor'
import { InvestModule } from 'modules/invest/invest.module'

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: CRON_JOB_QUEUE_NAME,
    }),
    InvestModule,
  ],
  providers: [CronJobService, CronJobProcessor],
  exports: [CronJobService],
})
export class CronJobModule {}
