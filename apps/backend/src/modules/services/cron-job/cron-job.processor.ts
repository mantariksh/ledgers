import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job } from 'bullmq'
import { MOCK_CRON_JOB_NAME } from 'common/constants/jobs'
import { CRON_JOB_QUEUE_NAME } from 'common/constants/queues'

@Processor(CRON_JOB_QUEUE_NAME)
export class CronJobProcessor extends WorkerHost {
  private readonly logger = new Logger(CronJobProcessor.name)

  process(job: Job): Promise<void> {
    switch (job.name) {
      case MOCK_CRON_JOB_NAME: {
        this.logger.log('Bing bong, this is a cron job song')
        return Promise.resolve()
      }
      default: {
        this.logger.error('Unknown job name:', job.name)
        return Promise.resolve()
      }
    }
  }
}
