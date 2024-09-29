import {
  BeforeInsert,
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
} from 'typeorm'

import { nanoid } from '@shared/utils/nanoid'
import { Account } from './account.entity'
import { BaseEntity } from './base.entity'

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @PrimaryColumn({ type: 'varchar', length: 24 })
  id: string

  @BeforeInsert()
  setId() {
    if (!this.id) {
      this.id = nanoid()
    }
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

  @OneToOne(() => Account, { eager: true })
  @JoinColumn()
  wallet_account: Account
}
