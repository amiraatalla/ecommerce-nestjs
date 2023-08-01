import { ApiProperty, PartialType } from '@nestjs/swagger';
import { StockItemBatches } from 'src/add-transactions/dto/create-add-transactions.dto';

export class BatchesTransactions extends PartialType(StockItemBatches) {
  @ApiProperty({ type: Number })
  qtyRemaining: number;
}
