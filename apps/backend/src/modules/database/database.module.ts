import { TypeOrmModule } from '@nestjs/typeorm'
import { ormConfig } from './orm-config'

export const DatabaseModule = TypeOrmModule.forRootAsync({
  useFactory: () => ormConfig,
})
