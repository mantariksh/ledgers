import { addFormats, Schema } from 'convict'

addFormats({
  'required-string': {
    validate: (val?: string): void => {
      if (val == undefined || val === '') {
        throw new Error('Required value cannot be empty')
      }
    },
    coerce: (val: unknown) => String(val),
  },
})

const ENVIRONMENTS = ['development', 'test', 'staging', 'production'] as const
export type Environment = (typeof ENVIRONMENTS)[number]

export interface ConfigSchema {
  environment: Environment
  database: {
    host: string
    username: string
    password: string
    port: number
    name: string
    logging: boolean
    maxPool: number
  }
  redis: {
    host: string
    port: number
  }
}

export const schema: Schema<ConfigSchema> = {
  environment: {
    env: 'NODE_ENV',
    format: ENVIRONMENTS,
    default: 'development',
  },
  database: {
    host: {
      env: 'DB_HOST',
      default: 'localhost',
      format: 'required-string',
    },
    username: {
      env: 'DB_USERNAME',
      sensitive: true,
      default: '',
      format: 'required-string',
    },
    password: {
      env: 'DB_PASSWORD',
      sensitive: true,
      default: '',
      format: 'required-string',
    },
    port: {
      env: 'DB_PORT',
      default: 5432,
      format: Number,
    },
    name: {
      env: 'DB_NAME',
      default: '',
      format: 'required-string',
    },
    logging: {
      env: 'DB_LOGGING',
      format: 'Boolean',
      default: false,
    },
    maxPool: {
      env: 'DB_MAX_POOL_SIZE',
      // Inbuilt formatter for natural numbers (positive integers)
      format: 'nat',
      default: 25,
    },
  },
  redis: {
    host: {
      env: 'REDIS_HOST',
      default: 'localhost',
      format: 'required-string',
    },
    port: {
      env: 'DB_PORT',
      default: 6379,
      format: Number,
    },
  },
}
