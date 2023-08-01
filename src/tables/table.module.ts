import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerModule } from 'src/customer/customer.module';
import { SYSLogModule } from 'src/sysLog/sysLog.module';
import { Table, TableSchema } from './entities/tables.entity';
import { TableController } from './table.controller';
import { TableService } from './table.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Table.name, schema: TableSchema },
        ]),
        SYSLogModule,
    ],
    controllers: [TableController],
    providers: [TableService],
    exports: [TableService]
})
export class TableModule { }
