import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import convict from 'convict'
import { join } from 'path'

import { NamingStrategy } from './utils/naming-strategy'

import { schema } from '../config/config.schema'

const config = convict(schema)

const isTest = config.get('environment') === 'test'

export const ormConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  logging: config.get('database.logging'),
  host: config.get('database.host'),
  port: config.get('database.port'),
  username: config.get('database.username'),
  password: config.get('database.password'),
  database: config.get('database.name'),
  // ssl only for AWS proxy environments
  ssl: config.get('database.host').includes('.proxy-') ? true : undefined,
  // https://docs.nestjs.com/techniques/database#auto-load-entities
  synchronize: false, // do not automatically sync entities
  // js for runtime, ts for typeorm cli
  entities: [join(__dirname, 'entities', '**/*.entity{.js,.ts}')],
  migrations: [join(__dirname, 'migrations', '*{.js,.ts}')],
  // ref: https://github.com/typeorm/typeorm/issues/3388 to set pool size
  extra: isTest
    ? undefined
    : {
        // Disconnect pool connection after 10 minutes of inactivity. Set to 0 for infinite.
        // Default is 10 seconds
        // https://node-postgres.com/apis/pool#new-pool
        idleTimeoutMillis: 10 * 60 * 1000,
        max: config.get('database.maxPool'), // Default pg-pool is 20
        keepAlive: true,
      },
  namingStrategy: new NamingStrategy(),
}
