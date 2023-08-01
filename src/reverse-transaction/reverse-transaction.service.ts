import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { AddTransactionsService } from 'src/add-transactions/add-transactions.service';
import { RequestWithUser } from 'src/core/interfaces';
import { BaseService, Pagination, SearchOptions } from 'src/core/shared';
import { StockItemDataService } from 'src/stock-item-data/stock-item-data.service';
import { StockItemReversed } from './classes/reverse-stockitem-class';
import { CreateReverseTransactionsDto } from './dto/create-reverse-transaction.dto';
import { ReverseTransactions, ReverseTransactionsDoc } from './entities/reverse-transaction.entity';

@Injectable()
export class ReverseTransactionService extends BaseService<ReverseTransactionsDoc> {
  constructor(
    @InjectModel(ReverseTransactions.name)  readonly m: Model<ReverseTransactionsDoc>,
    @Inject(forwardRef(() => StockItemDataService))
    private readonly stockItemService: StockItemDataService,
    @Inject(forwardRef(() => AddTransactionsService))
    private readonly addTransactionsService: AddTransactionsService,
  ) {
    super(m);
  }
  async decreaseTotalQty(
    stockItemId: Types.ObjectId,
    warehouseId: Types.ObjectId,
    qty: number,
    session: ClientSession,
  ) {
    let aggregation = [];
    aggregation.push(
      { $match: { _id: stockItemId } },
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
        $match: { 'warehousestockitem.warehouseId': warehouseId },
      },
    );
    const aggregated = await this.stockItemService.m.aggregate(aggregation);
    const { _id, qtyOnHand } = aggregated[0].warehousestockitem;
    let newQty: number = qtyOnHand - qty;
    await this.stockItemService.warehouseStockItems.updateOne(
      { _id: _id },
      { qtyOnHand: newQty },
      { session: session },
    );
  }

  async createReverseTransactions(req:RequestWithUser, dto: CreateReverseTransactionsDto) {
    const session = await this.m.startSession();
    let reversedTransaction,
      price: number = 0,
      stockItemObj: StockItemReversed,
      writes = [],
      totalPrice = 0;
    const { supplierId, warehouseId } = await this.addTransactionsService.findOneAndErr({
      _id: dto.addTransactionId,
    });
    await session.withTransaction(async (): Promise<any> => {
      if (dto.partialReverse) {
        let totalQty = 0,
          batches = [];
        for (const selectedStockId of dto.partialReverse) {
          const addTrans = await this.stockItemService.stockItemTransaction.findOne({
            refTransactionId: dto.addTransactionId,
            stockItemId: selectedStockId.stockItemId,
          });
          (batches = []), (totalQty = 0);
          if (selectedStockId.batches) {
            for (const batch of selectedStockId.batches) {
              const selectedBatch = await this.stockItemService.stockItemTransaction.findOne(
                {
                  _id: addTrans._id,
                  'batches._id': this.toObjectId(batch.batchId),
                },
                {
                  _id: 0,
                  qtyRemaining: 1,
                  batches: { $elemMatch: { _id: this.toObjectId(batch.batchId) } },
                },
              );
              await this.stockItemService.stockItemTransaction.updateOne(
                {
                  _id: addTrans._id,
                  'batches._id': this.toObjectId(batch.batchId),
                },
                {
                  $set: {
                    'batches.$.qtyRemaining': selectedBatch.batches[0].qtyRemaining - batch.qty,
                  },
                },
                { session: session },
              );
              selectedBatch.batches[0]['qty'] = batch.qty;
              totalQty += batch.qty;
              batches.push(selectedBatch.batches[0]);
            }
            await this.stockItemService.stockItemTransaction.updateOne(
              { _id: addTrans._id },
              { qtyRemaining: addTrans.qtyRemaining - totalQty },
              { session: session },
            );
            price = addTrans.price * totalQty;
          } else {
            await this.stockItemService.stockItemTransaction.updateOne(
              { _id: addTrans._id },
              { qtyRemaining: addTrans.qtyRemaining - selectedStockId.qty },
              { session: session },
            );
            if (addTrans.batches) {
              for (const batch of addTrans.batches) {
                await this.stockItemService.stockItemTransaction.updateOne(
                  {
                    _id: addTrans._id,
                    'batches._id': this.toObjectId(batch._id),
                  },
                  { $set: { 'batches.$.qtyRemaining': batch.qtyRemaining - selectedStockId.qty } },
                  { session: session },
                );
              }
            }
            (batches = []), (totalQty = 0);
            batches = addTrans.batches;
            price = selectedStockId.qty * addTrans.price;
            totalQty = addTrans.qty - selectedStockId.qty;
          }
          stockItemObj = {
            stockItemId: addTrans.stockItemId,
            qty: selectedStockId.qty,
            price: addTrans.price,
          };
          if (addTrans.batches) {
            stockItemObj['batches'] = batches;
          }
          totalPrice += price;
          writes.push(stockItemObj);
          this.decreaseTotalQty(addTrans.stockItemId, warehouseId, selectedStockId.qty, session);
        }
      } else {
        const addTrans = await this.stockItemService.stockItemTransaction.find({
          refTransactionId: dto.addTransactionId,
        });
        for (const stockitem of addTrans) {
          stockItemObj = {
            stockItemId: stockitem.stockItemId,
            qty: stockitem.qty,
            price: stockitem.price,
          };
          if (stockitem.batches) {
            stockItemObj['batches'] = stockitem.batches;
            for (const batch of stockitem.batches) {
              await this.stockItemService.stockItemTransaction.updateOne(
                {
                  _id: stockitem._id,
                  'batches._id': this.toObjectId(batch._id),
                },
                { $set: { 'batches.$.qtyRemaining': 0 } },
                { session: session },
              );
            }
          }
          price = stockitem.qty * stockitem.price;
          writes.push(stockItemObj);
          await this.stockItemService.stockItemTransaction.updateOne(
            { _id: stockitem._id },
            { qtyRemaining: 0 },
            { session: session },
          );

          this.decreaseTotalQty(stockitem.stockItemId, warehouseId, stockitem.qty, session);
          totalPrice = totalPrice + price;
        }
      }

      reversedTransaction = await this.m.create(
        [
          {
            entityId:req.user.entityId,
            warehouseId:req.user.warehouseId,
            supplierId,
            date: new Date(),
            price: totalPrice,
            items: writes,
          },
        ],
        { session: session },
      );
    });
    session.endSession();
    return reversedTransaction[0];
  }
  async findAll(
    options: SearchOptions,
    entityId: Types.ObjectId,
    warehouseId?: Types.ObjectId,
  ): Promise<Pagination> {
    const aggregation = [];

    const { sort, dir, offset, size, searchTerm, filterBy, attributesToRetrieve, filterByDateTo, filterByDateFrom } = options;
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
  private search(aggregation: any, searchTerm: string): void {
    aggregation.push({
      $match: { createdAt: { $regex: new RegExp(searchTerm), $options: 'i' } },
    });
  }
}
