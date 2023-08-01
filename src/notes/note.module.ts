import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerModule } from 'src/customer/customer.module';
import { SYSLogModule } from 'src/sysLog/sysLog.module';
import { Note, NoteSchema } from './entities/notes.entity';
import { NoteController } from './note.controller';
import { NoteService } from './note.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Note.name, schema: NoteSchema },
        ]),
        SYSLogModule,
        CustomerModule
    ],
    controllers: [NoteController],
    providers: [NoteService],
    exports: [NoteService]
})
export class NoteModule { }
