import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from 'src/config/config.module';
import { Payment, PaymentSchema } from './entities/payment.entity';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
    imports:[ MongooseModule.forFeature([
        { name: Payment.name, schema: PaymentSchema },
    ])
    ,HttpModule
    ,ConfigModule.Deferred,
],
    providers:[PaymentService],
    controllers:[PaymentController],
    exports:[PaymentService],
})
export class PaymentModule {}
