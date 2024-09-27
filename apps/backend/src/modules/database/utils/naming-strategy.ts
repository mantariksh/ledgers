import * as crypto from 'crypto'
import { DefaultNamingStrategy, NamingStrategyInterface, Table } from 'typeorm'
import { snakeCase } from 'typeorm/util/StringUtils'

function isMoreThan63Bytes(str: string) {
  return Buffer.from(str).length > 63
}

function generatePgCompliantName(rawName: string, prefix?: string) {
  const name = prefix ? `${prefix}_${rawName}` : rawName

  if (!isMoreThan63Bytes(name)) {
    return name
  }

  const hashedName = crypto
    .createHash('md5')
    .update(rawName, 'base64')
    .digest('hex')

  return prefix ? `${prefix}_${hashedName}` : hashedName
}

export class NamingStrategy
  extends DefaultNamingStrategy
  implements NamingStrategyInterface
{
  tableName(targetName: string, userSpecifiedName?: string): string {
    return userSpecifiedName ? userSpecifiedName : snakeCase(targetName)
  }

  columnName(
    propertyName: string,
    customName: string | undefined,
    embeddedPrefixes: string[]
  ): string {
    const name =
      snakeCase(embeddedPrefixes.concat('').join('_')) +
      (customName ? customName : snakeCase(propertyName))

    if (isMoreThan63Bytes(name)) {
      throw new Error(
        `Please manually rename the column "${name}" as it goes beyond 64 bytes`
      )
    }

    return name
  }

  relationName(propertyName: string): string {
    return snakeCase(propertyName)
  }

  joinColumnName(relationName: string, referencedColumnName: string): string {
    return generatePgCompliantName(
      `${snakeCase(relationName)}_${snakeCase(referencedColumnName)}`
    )
  }

  foreignKeyName(tableOrName: Table | string, columnNames: string[]): string {
    const tableName = this.getTableName(tableOrName)
    return generatePgCompliantName(
      `${tableName}_${columnNames.map(snakeCase).join('_')}`,
      `FK`
    )
  }

  indexName(tableOrName: Table | string, columnNames: string[]): string {
    const tableName = this.getTableName(tableOrName)
    return generatePgCompliantName(
      `${tableName}_${columnNames.map(snakeCase).join('_')}`,
      `IDX`
    )
  }

  primaryKeyName(tableOrName: Table | string, columnNames: string[]): string {
    const tableName = this.getTableName(tableOrName)
    return generatePgCompliantName(
      `${tableName}_${columnNames.map(snakeCase).join('_')}`,
      `PK`
    )
  }

  uniqueConstraintName(
    tableOrName: Table | string,
    columnNames: string[]
  ): string {
    const tableName = this.getTableName(tableOrName)
    return generatePgCompliantName(
      `${tableName}_${columnNames.map(snakeCase).join('_')}`,
      `UQ`
    )
  }

  checkConstraintName(tableOrName: Table | string): string {
    const tableName = this.getTableName(tableOrName)
    if (typeof tableOrName !== 'string' || !tableName.startsWith('CHK_')) {
      throw Error(
        `Please manually name @Check constraint like 'CHK_${tableName}_\${description}`
      )
    }
    return tableName
  }

  relationConstraintName(
    tableOrName: Table | string,
    columnNames: string[]
  ): string {
    const tableName = this.getTableName(tableOrName)
    return generatePgCompliantName(
      `${columnNames.map(snakeCase).join('_')}`,
      `REL_${tableName}`
    )
  }
}
