import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'
import { CronJob } from 'common/constants/jobs'
import { CRON_JOB_QUEUE_NAME } from 'common/constants/queues'

@Injectable()
export class CronJobService {
  constructor(@InjectQueue(CRON_JOB_QUEUE_NAME) private cronJobQueue: Queue) {
    void this.cronJobQueue.add(CronJob.AddInvestmentInterest, null, {
      repeat: { every: 1000 },
    })
    void this.cronJobQueue.add(CronJob.AddLoanInterest, null, {
      repeat: { every: 1000 },
    })
    void this.cronJobQueue.add(CronJob.MakeLoanPayment, null, {
      repeat: { every: 1000 },
    })
  }
}
