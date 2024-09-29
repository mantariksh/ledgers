import { PrimaryKey, Property } from '@mikro-orm/core'
import { nanoid } from '@shared/utils/nanoid'

export abstract class BaseEntity {
  @PrimaryKey()
  id = nanoid()

  @Property({ type: 'timestamp with time zone' })
  createdAt = new Date()

  @Property({ type: 'timestamp with time zone' })
  updatedAt = new Date()
}
