import {
  BeforeInsert,
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryColumn,
} from 'typeorm'

import { nanoid } from '@shared/utils/nanoid'
import { BaseEntity } from './base.entity'
import { Account } from './account.entity'

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @PrimaryColumn({ type: 'varchar', length: 24 })
  id: string

  @BeforeInsert()
  setId() {
    this.id = nanoid()
  }

  @Column('varchar', {
    length: 255,
    transformer: {
      to: (val: string) => val.toLowerCase(),
      from: (val: string) => val,
    },
  })
  @Index({ unique: true })
  email: string

  @OneToMany(() => Account, (account) => account.user)
  accounts: Account[]
}
