import { MikroOrmModule } from '@mikro-orm/nestjs'
import ormConfig from './orm-config'

export const DatabaseModule = MikroOrmModule.forRootAsync({
  useFactory: () => ormConfig,
})
