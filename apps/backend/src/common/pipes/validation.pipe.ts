import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common'
import { isZodDto } from '@shared/dto/common/createZodDto'
import { ConfigService } from 'modules/config/config.service'

@Injectable()
export class GlobalValidationPipe implements PipeTransform {
  constructor(private readonly configService: ConfigService) {}

  public transform(value: unknown, metadata: ArgumentMetadata) {
    const { metatype } = metadata

    if (!isZodDto(metatype)) {
      return value
    }

    const result = metatype.schema.safeParse(value)

    if (!result.success) {
      if (this.configService.get('environment') === 'development') {
        throw new BadRequestException(result.error.issues)
      } else {
        throw new BadRequestException()
      }
    }

    return result.data
  }
}
