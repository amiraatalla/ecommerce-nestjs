import { PartialType } from '@nestjs/swagger';
import { ItemDetails } from '../dto/create-reverse-transaction.dto';

export class StockItemReversed extends PartialType(ItemDetails) {}
