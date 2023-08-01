import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Response } from 'express';
import { Model, Types } from 'mongoose';
import { RequestWithUser } from 'src/core/interfaces';
import { BaseService, Pagination, SearchOptions } from 'src/core/shared';
import { BatchesTransactions } from 'src/stock-item-data/classes/batches-transaction.class';
import { REFTRANSACTIONENUM } from 'src/stock-item-data/enums/ref-transaction-enum';
import { StockItemDataService } from 'src/stock-item-data/stock-item-data.service';
import { CreateAddTransactionsDto, StockItemBatches } from './dto/create-add-transactions.dto';
import { AddTransactions, AddTransactionsDoc } from './entities/add-transactions.entity';

@Injectable()
export class AddTransactionsService extends BaseService<AddTransactionsDoc> {
  constructor(
    @InjectModel(AddTransactions.name)  readonly m: Model<AddTransactionsDoc>,
    @Inject(forwardRef(() => StockItemDataService))
    private readonly stockItemService: StockItemDataService,
  ) {
    super(m);
  }
  async createAddTransactions(req: RequestWithUser, dto: CreateAddTransactionsDto) {
    dto.warehouseId = req.user.warehouseId;
    const session = await this.m.startSession();
    let stockItemsAdded,
      batchesArray = [],
      transIds = [];
    await session.withTransaction(async (): Promise<any> => {
      for (const item of dto.items) {
        let aggregation = [];
        aggregation.push(
          { $match: { _id: this.toObjectId(item.stockItemId) } },
          {
            $lookup: {
              from: 'warehousestockitems',
              let: { pid: '$warehouseStockItemsData' },
              pipeline: [{ $match: { $expr: { $in: ['$_id', '$$pid'] } } }],
              as: 'warehousestockitem',
            },
          },
          {
            $unwind: {
              path: '$warehousestockitem',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $match: { 'warehousestockitem.warehouseId': req.user.warehouseId },
          },
        );
        const aggregated = await this.stockItemService.m.aggregate(aggregation);
        if (!aggregated[0]) {
          throw new BadRequestException('201');
        }
        const { trackExpiry, trackBatches } = aggregated[0];
        if ((trackExpiry && !item.batches) || (trackBatches && !item.batches)) {
          throw new BadRequestException('203');
        }
        if  (!trackBatches && item.batches){
            throw new BadRequestException('204');
        }
        const { _id, qtyOnHand } = aggregated[0].warehousestockitem;
        let newQty: number = qtyOnHand + item.qty;
        if (item.batches) {
          for (const itemId of item.batches) {
            const { qty } = item;
            let allQty = 0;
            for (const batch of item.batches) {
              allQty = allQty + batch.qty;
            }
            if (qty != allQty) {
              throw new BadRequestException('110');
            }
            itemId._id = new Types.ObjectId();
            // itemId.price = item.price;
            let batches: BatchesTransactions = {
              _id: itemId._id,
              batchNo:itemId.batchNo,
              price: itemId.price,
              qty: itemId.qty,
              qtyRemaining: itemId.qty,
              dateTimeReceived: itemId.dateTimeReceived,
              expiryDate: itemId.expiryDate,
            };
            batchesArray.push(batches);
          }
        }

        await this.stockItemService.warehouseStockItems.updateOne(
          { _id: _id },
          { qtyOnHand: newQty },
          { session: session },
        );

        const stockItemTrans = await this.stockItemService.stockItemTransaction.create(
          [
            {
             entityId:req.user.entityId,
              warehouseId: req.user.warehouseId,
              stockItemId: item.stockItemId,
              transactionType: REFTRANSACTIONENUM.ADD,
              qty: item.qty,
              qtyRemaining: item.qty,
              price: item.price,
            },
          ],
          { session: session },
        );
        if (item.batches) {
          await this.stockItemService.stockItemTransaction.updateOne(
            { _id: stockItemTrans[0]._id },
            { batches: batchesArray },
            { session: session },
          );
        }
        transIds.push(stockItemTrans[0]._id);
      }
      stockItemsAdded = await this.m.create([{entityId:req.user.entityId, ...dto }], { session: session });
      for (const Id of transIds) {
        await this.stockItemService.stockItemTransaction.updateOne(
          { _id: Id },
          { refTransactionId: stockItemsAdded[0]._id },
          { session: session },
        );
      }
    });
    session.endSession();
    return stockItemsAdded[0];
  }
  async findAll(
    options: SearchOptions,
    entityId: Types.ObjectId,
    warehouseId?: Types.ObjectId,
  ): Promise<Pagination> {
    const aggregation = [];

    const { sort, dir, offset, size, searchTerm, filterBy, attributesToRetrieve , filterByDateFrom , filterByDateTo} = options;
    aggregation.push({ $match: { entityId } });
    if (warehouseId) {
      aggregation.push({ $match: { warehouseId } });
    }
    if (sort && dir) {
      this.sort(aggregation, sort, dir);
    }

    if (filterBy?.length) {
      this.filter(aggregation, filterBy);
    }

    if (searchTerm) {
      //this.search(aggregation, searchTerm);
    }

    if (attributesToRetrieve?.length) {
      this.project(aggregation, attributesToRetrieve);
    }
    aggregation.push(
      {
        $lookup: {
          from: 'entities',
          localField: 'entityId',
          foreignField: '_id',
          as: 'entity',
        },
      },
      {
        $lookup: {
          from: 'warehouses',
          localField: 'warehouseId',
          foreignField: '_id',
          as: 'warehouse',
        },
      },
      {
        $lookup: {
          from: 'suppliers',
          localField: 'supplierId',
          foreignField: '_id',
          as: 'supplier',
        },
      },
    );

    if (filterByDateFrom && filterByDateTo) {
      aggregation.push(
        //change date to string & match
        {
          $addFields: {
            createdAtToString: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
          },
        },
        {
          $match: {
            $and: [
              {
                $or: [
                  {
                    createdAtToString: {
                      $gte: filterByDateFrom,
                      $lte: filterByDateTo,
                    },
                  },
                ],
              },
            ],
          },
        },
        {
          $project: {
            createdAtToString: 0,
          },
        },
      );
    }
    return await this.aggregate(aggregation, offset, size);
  }

  /**
   * Search document fields.
   */
  // private search(aggregation: any, searchTerm: string): void {
  //   aggregation.push({
  //     $match: { date: { $regex: new RegExp(searchTerm), $options: 'i' } },
  //   });
  // }
}
