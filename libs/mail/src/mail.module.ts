import { createConfigurableDynamicRootModule } from '@golevelup/nestjs-modules';
import { Module } from '@nestjs/common';
import { MailModuleOptions } from './interfaces';
import { MAIL_MODULE_OPTIONS } from './mail.constants';
import { MailService } from './mail.service';

@Module({
    providers: [MailService],
    exports: [MailService],
  })
  export class MailModule extends createConfigurableDynamicRootModule<MailModule, MailModuleOptions>(
    MAIL_MODULE_OPTIONS,
  ) {
    static Deferred = MailModule.externallyConfigured(MailModule, 0);
  }