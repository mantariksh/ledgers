import { ConfigService } from 'modules/config/config.service'
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino'

export const LoggerModule = PinoLoggerModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    if (config.isDevEnv) {
      return {
        pinoHttp: {
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
            },
          },
        },
      }
    }

    return {
      pinoHttp: {
        redact: ['req.headers.cookie', 'req.headers.authorization'],
      },
    }
  },
})
