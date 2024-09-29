import { Collection, Entity, OneToMany, Property } from '@mikro-orm/core'
import { BaseEntity } from './base.entity'
import { Entry } from './entry.entity'

@Entity()
export class Transaction extends BaseEntity {
  @Property({ type: 'text' })
  description: string

  @OneToMany(() => Entry, (entry) => entry.transaction)
  entries = new Collection<Entry>(this)
}
