import { Module } from '@nestjs/common';
import { MulterExtendedModule } from 'nestjs-multer-extended';
import { ConfigModule } from '../config/config.module';
import { MulterModuleConfig } from '../config/options';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  imports: [
    MulterExtendedModule.registerAsync({
      useClass: MulterModuleConfig,
      imports: [ConfigModule.Deferred],
    }),
    ConfigModule.Deferred,
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
