import { PostgreSqlDriver } from '@mikro-orm/postgresql'
import convict from 'convict'
import { join } from 'path'

import { MikroOrmModuleOptions } from '@mikro-orm/nestjs'
import { schema } from '../config/config.schema'
import { Migrator } from '@mikro-orm/migrations'

const config = convict(schema)

const isTest = config.get('environment') === 'test'

const ormConfig: MikroOrmModuleOptions = {
  driver: PostgreSqlDriver,
  debug: config.get('database.logging'),
  host: config.get('database.host'),
  port: config.get('database.port'),
  user: config.get('database.username'),
  password: config.get('database.password'),
  dbName: config.get('database.name'),
  driverOptions: {
    connection: {
      // ssl only for AWS proxy environments
      ssl: config.get('database.host').includes('.proxy-') ? true : undefined,
      keepAlive: isTest ? undefined : true,
    },
  },
  // js for runtime, ts for cli
  entities: [join(__dirname, 'entities', '**/*.entity{.js,.ts}')],
  pool: isTest
    ? undefined
    : {
        // Disconnect pool connection after 10 minutes of inactivity. Set to 0 for infinite.
        // Default is 10 seconds
        // https://node-postgres.com/apis/pool#new-pool
        idleTimeoutMillis: 10 * 60 * 1000,
        max: config.get('database.maxPool'), // Default pg-pool is 20
      },
  extensions: [Migrator],
  migrations: {
    path: join(__dirname, 'migrations'),
  },
}

export default ormConfig
