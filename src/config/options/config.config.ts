import { ModuleConfigFactory } from '@golevelup/nestjs-modules';
import { Injectable } from '@nestjs/common';
import { ConfigModuleOptions } from '../interfaces/config-options.interface';

@Injectable()
export class ConfigModuleConfig implements ModuleConfigFactory<ConfigModuleOptions> {
  createModuleConfig(): ConfigModuleOptions {
    const env = process.env.NODE_ENV;

    return {
      filename: !env ? '.env.development' : `.env.${env}`,
      useProcess: false,
    };
  }
}
