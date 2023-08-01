import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SYSLogModule } from 'src/sysLog/sysLog.module';
import { StockItemDataModule } from 'src/stock-item-data/stock-item-data.module';
import { Cart, CartSchema } from './entities/cart.entity';
import { CartController } from './cart.controller';
import { WarehouseStockItems, WarehouseStockItemsSchema } from 'src/stock-item-data/entities/stock-item.entity';
import { CartService } from './cart.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cart.name, schema: CartSchema },
      { name: WarehouseStockItems.name, schema: WarehouseStockItemsSchema },
    ]),
    SYSLogModule,
    forwardRef(() => StockItemDataModule),


  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService]
})
export class CartModule { }
