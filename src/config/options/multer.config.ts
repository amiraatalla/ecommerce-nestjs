import { Injectable } from '@nestjs/common';
// import { MulterExtendedawsOptions, MulterExtendedawsOptionsFactory } from 'nestjs-multer-extended';
import { MulterExtendedS3Options, MulterExtendedS3OptionsFactory } from 'nestjs-multer-extended';
import { ConfigService } from '../config.service';

@Injectable()
export class MulterModuleConfig implements MulterExtendedS3OptionsFactory {
  constructor(private readonly configService: ConfigService) {}
  createMulterExtendedS3Options(): MulterExtendedS3Options | Promise<MulterExtendedS3Options> {
    return {
      accessKeyId: this.configService.aws.accessKeyId,
      secretAccessKey: this.configService.aws.secretAccessKey,
      region: this.configService.aws.region,
      bucket: this.configService.aws.bucket,
      basePath: '/assets',
      fileSize: 50 * 1024 * 1024,
    };
  }
}
