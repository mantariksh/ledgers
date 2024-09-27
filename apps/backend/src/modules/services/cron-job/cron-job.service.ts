import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'
import { MOCK_CRON_JOB_NAME } from 'common/constants/jobs'
import { CRON_JOB_QUEUE_NAME } from 'common/constants/queues'

@Injectable()
export class CronJobService {
  constructor(@InjectQueue(CRON_JOB_QUEUE_NAME) private cronJobQueue: Queue) {
    void this.cronJobQueue.add(MOCK_CRON_JOB_NAME, null, {
      repeat: { every: 1000 * 60 },
    })
  }
}
