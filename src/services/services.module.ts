import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Services, ServicesSchema } from './entities/services.entity';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Services.name, schema: ServicesSchema }])],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
