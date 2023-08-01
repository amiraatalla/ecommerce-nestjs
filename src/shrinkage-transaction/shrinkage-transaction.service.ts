import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseService, Pagination, SearchOptions } from 'src/core/shared';
import {
  ShrinkageTransaction,
  ShrinkageTransactionDoc,
} from './entities/shrinkage-transaction.entity';
import { StockItemDataService } from 'src/stock-item-data/stock-item-data.service';
import { CreateShrinkageTransactionDto } from './dto/create-shrinkage-transaction.dto';
import { RequestWithUser } from 'src/core/interfaces';

@Injectable()
@Injectable()
export class ShrinkageTransactionService extends BaseService<ShrinkageTransactionDoc> {
  constructor(
    @InjectModel(ShrinkageTransaction.name) readonly m: Model<ShrinkageTransactionDoc>,
    private readonly stockItemService: StockItemDataService,
  ) {
    super(m);
  }

  async createShrinkageTransactions(
    req: RequestWithUser,
    dto: CreateShrinkageTransactionDto,
  ) {
    dto.warehouseId = req.user.warehouseId;
    const session = await this.m.startSession();
    let stockitemShrinked, shrinkedQty;
    await session.withTransaction(async (): Promise<any> => {
      for (const item of dto.items) {
        shrinkedQty = item.shrinkQty;
        let aggregation = [];
        aggregation.push(
          { $match: { _id: item.stockItemId } },
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
          throw new BadRequestException({ 'message': '201' });
        }
        const { _id, qtyOnHand } = aggregated[0].warehousestockitem;
        // if (qtyOnHand == item.qtyOnHand) {
        //   throw new BadRequestException({ errorCode: '100' });
        // }
        if (qtyOnHand < item.shrinkQty) {
          throw new BadRequestException({ errorCode: '113' });
        }
        // if (qtyOnHand != item.qtyOnHand + item.shrinkQty) {
        //   throw new BadRequestException({ errorCode: '104' });
        // }
        if (item.batches) {
          let batches = [];
          for (const batch of item.batches) {
            const selectedBatch = await this.stockItemService.stockItemTransaction.findOne(
              {
                stockItemId: item.stockItemId,
                'batches._id': this.toObjectId(batch._id),
              },
              { qtyRemaining: 1, batches: { $elemMatch: { _id: this.toObjectId(batch._id) } } },
            );

            await this.stockItemService.stockItemTransaction.updateOne(
              {
                stockItemId: item.stockItemId,
                'batches._id': this.toObjectId(batch._id),
                warehouseId: req.user.warehouseId,
              },
              {
                qtyRemaining: selectedBatch.qtyRemaining - item.shrinkQty,
                $set: {
                  'batches.$.qtyRemaining': selectedBatch.batches[0].qtyRemaining - item.shrinkQty,
                },
              },
              { returnDocument: 'after' },
            );
            selectedBatch.batches[0]['qty'] = item.shrinkQty;
            batches.push(selectedBatch.batches[0]);
          }
          item.batches = batches;
        } else {
          const sortedDateBatches = await this.stockItemService.stockItemTransaction.aggregate([
            {
              $match: {
                stockItemId: item.stockItemId,
                qtyRemaining: { $ne: 0 },
                warehouseId: req.user.warehouseId,
              },
            },
          ]);
          for (const stockItemDoc of sortedDateBatches) {
            const { qtyRemaining, _id } = stockItemDoc;
            if (shrinkedQty <= qtyRemaining && shrinkedQty != 0) {
              await this.stockItemService.stockItemTransaction.updateOne(
                { _id: stockItemDoc._id },
                { qtyRemaining: qtyRemaining - shrinkedQty },
                { session: session },
              );
              shrinkedQty = 0;
            } else if (shrinkedQty > qtyRemaining) {
              shrinkedQty = shrinkedQty - qtyRemaining;
              await this.stockItemService.stockItemTransaction.updateOne(
                { _id: stockItemDoc._id },
                { qtyRemaining: qtyRemaining - qtyRemaining },
                { session: session },
              );
            }
          }
        }
        let newQty = qtyOnHand - item.shrinkQty;
        await this.stockItemService.warehouseStockItems.updateOne(
          { _id: _id },
          { qtyOnHand: newQty },
          { session: session },
        );
      }
      stockitemShrinked = await this.m.create([{entityId:req.user.entityId,warehouseId: req.user.warehouseId, ...dto }], { session: session });
    });
    session.endSession();
    return stockitemShrinked[0];
  }

  async findAll(
    options: SearchOptions,
    entityId: Types.ObjectId,
    warehouseId?: Types.ObjectId,
  ): Promise<Pagination> {
    const aggregation = [];

    const {
      sort,
      dir,
      offset,
      size,
      searchTerm,
      filterBy,
      attributesToRetrieve,
      filterByDateFrom,
      filterByDateTo,
    } = options;
   
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
      // this.search(aggregation, searchTerm);
    }

    if (attributesToRetrieve?.length) {
      this.project(aggregation, attributesToRetrieve);
    }
    if (filterByDateFrom && filterByDateTo) {
      aggregation.push(
        //change date to string & match
        {
          $addFields: {
            createdAtToString: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          },
        },
        {
          $match: {
            createdAtToString: { $gte: filterByDateFrom, $lte: filterByDateTo },
          },
        },
        {
          $project: {
            createdAtToString: 0,
          },
        },
      );
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
    );
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
