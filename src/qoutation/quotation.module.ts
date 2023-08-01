import { MailModule } from '@buyby/mail';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WarehouseStockItems, WarehouseStockItemsSchema } from 'src/stock-item-data/entities/stock-item.entity';
import { StockItemDataModule } from 'src/stock-item-data/stock-item-data.module';
import { SYSLogModule } from 'src/sysLog/sysLog.module';
import { UploadModule } from 'src/upload/upload.module';
import { UsersModule } from 'src/users/users.module';
import { Quotation, QuotationSchema } from './entities/quotation.entity';
import { QuotationController } from './quotation.controller';
import { QuotationService } from './quotation.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Quotation.name, schema: QuotationSchema },
            { name: WarehouseStockItems.name, schema: WarehouseStockItemsSchema },
        ]),
        forwardRef(() => StockItemDataModule),
        SYSLogModule,
        UsersModule,
        MailModule.Deferred,
        UploadModule,
        
    ],
    controllers: [QuotationController],
    providers: [QuotationService],
    exports: [QuotationService]
})
export class QuotationModule { }
