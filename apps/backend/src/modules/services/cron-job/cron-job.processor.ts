import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job } from 'bullmq'
import { CronJob } from 'common/constants/jobs'
import { CRON_JOB_QUEUE_NAME } from 'common/constants/queues'
import { InvestService } from 'modules/invest/invest.service'

@Processor(CRON_JOB_QUEUE_NAME)
export class CronJobProcessor extends WorkerHost {
  private readonly logger = new Logger(CronJobProcessor.name)

  constructor(private readonly investService: InvestService) {
    super()
  }

  process(job: Job): Promise<void> {
    switch (job.name) {
      case CronJob.AddInvestmentInterest: {
        return this.investService.updateInterestForInvestments()
      }
      default: {
        this.logger.error('Unknown job name:', job.name)
        return Promise.resolve()
      }
    }
  }
}
