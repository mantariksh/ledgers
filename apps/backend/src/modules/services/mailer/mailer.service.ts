import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from 'modules/config/config.service'
import { SendMailData } from './mailer.types'
import nodemailer, { Transporter } from 'nodemailer'

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name)
  private readonly mailer: Transporter | null

  constructor(private readonly configService: ConfigService) {
    if (this.configService.isDevEnv) {
      this.mailer = nodemailer.createTransport({
        host: 'localhost',
        port: 1025,
      })
    }
  }

  async sendMail(data: SendMailData) {
    if (this.configService.isDevEnv && this.mailer) {
      this.mailer.sendMail(data)
    }
  }
}
