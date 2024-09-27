import { BullModule as NestJsBullModule } from '@nestjs/bullmq'
import { ConfigService } from 'modules/config/config.service'

export const BullModule = NestJsBullModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    return {
      connection: {
        host: configService.get('redis.host'),
        port: configService.get('redis.port'),
      },
    }
  },
})
