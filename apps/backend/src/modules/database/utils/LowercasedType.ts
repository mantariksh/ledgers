import { Type } from '@mikro-orm/core'

export class LowercasedType extends Type {
  convertToDatabaseValue(value: string): string {
    return value.toLowerCase()
  }
}
