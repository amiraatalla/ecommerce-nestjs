import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from 'src/users/users.module';
import { Tutorial, TutorialSchema } from './entities/tutorial.entity';
import { TutorialController } from './tutorial.controller';
import { TutorialService } from './tutorial.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tutorial.name, schema: TutorialSchema },
    ]),
    UsersModule
  ],
  controllers: [TutorialController],
  providers: [TutorialService],
  exports: [TutorialService]
})
export class TutorialModule { }
