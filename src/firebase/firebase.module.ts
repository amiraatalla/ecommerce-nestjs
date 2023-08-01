import { forwardRef, Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { FireBaseService } from './firebase.service';

@Module({
  imports: [forwardRef(() => UsersModule)],
  providers: [FireBaseService],
  exports: [FireBaseService],
})
export class FireBaseModule {}
