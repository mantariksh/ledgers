import { BeforeInsert, Column, Entity, OneToMany, PrimaryColumn } from 'typeorm'

import { nanoid } from '@shared/utils/nanoid'
import { BaseEntity } from './base.entity'
import { Entry } from './entry.entity'

@Entity({ name: 'transactions' })
export class Transaction extends BaseEntity {
  @PrimaryColumn({ type: 'varchar', length: 24 })
  id: string

  @BeforeInsert()
  setId() {
    this.id = nanoid()
  }

  @Column('text')
  description: string

  @OneToMany(() => Entry, (entry) => entry.transaction)
  entries: Entry[]
}
