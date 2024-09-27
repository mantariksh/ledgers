import { DataSource, DataSourceOptions } from 'typeorm'

import { ormConfig } from './orm-config'

// This file exists because the TypeORM CLI requires a file which exports a DataSource
export const connectionSource = new DataSource(ormConfig as DataSourceOptions)
