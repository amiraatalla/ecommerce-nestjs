import { Global, Module } from '@nestjs/common';
import { SYSLogsController } from './sysLog.controller';
import { SYSLogService } from './sysLog.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SYSLog, SYSLogSchema } from './entities/sysLog.entity';
import { MulterExtendedModule } from 'nestjs-multer-extended';
import { MulterModuleConfig } from '../config/options/multer.config';
import { ConfigModule } from 'src/config/config.module';
// import { UploadsModule } from 'src/upload/upload.module';

@Global()
@Module({
  controllers: [SYSLogsController],
})
@Module({
  imports: [
    MongooseModule.forFeature([{ name: SYSLog.name, schema: SYSLogSchema }]),
    MulterExtendedModule.registerAsync({
      useClass: MulterModuleConfig,
      imports: [ConfigModule.Deferred],
    }),
    // UploadsModule,
  ],
  controllers: [SYSLogsController],
  providers: [SYSLogService],
  exports: [SYSLogService],
})
export class SYSLogModule {}
