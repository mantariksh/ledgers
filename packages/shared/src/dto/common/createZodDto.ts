import { ZodSchema, ZodTypeDef } from 'zod'

export interface ZodDto<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TOutput = any,
  TDef extends ZodTypeDef = ZodTypeDef,
  TInput = TOutput,
> {
  new (): TOutput
  isZodDto: true
  schema: ZodSchema<TOutput, TDef, TInput>
}

export function createZodDto<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TOutput = any,
  TDef extends ZodTypeDef = ZodTypeDef,
  TInput = TOutput,
>(schema: ZodSchema<TOutput, TDef, TInput>) {
  // eslint-disable-next-line @typescript-eslint/no-extraneous-class
  class AugmentedZodDto {
    public static isZodDto = true
    public static schema = schema
  }

  return AugmentedZodDto as unknown as ZodDto<TOutput, TDef, TInput>
}

export function isZodDto(metatype: unknown): metatype is ZodDto<unknown> {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  return metatype?.isZodDto
}
