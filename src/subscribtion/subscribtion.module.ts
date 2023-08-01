import { MailModule } from '@buyby/mail';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from 'src/users/users.module';
import { Subscription, SubscriptionSchema } from './entities/subscribtion.entity';
import { SubscriptionController } from './subscribtion.controller';
import { SubscriptionService } from './subscribtion.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Subscription.name, schema: SubscriptionSchema },
    ]),
    forwardRef(() =>UsersModule),
    MailModule.Deferred,
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
  exports: [SubscriptionService]
})
export class SubscriptionModule { }
