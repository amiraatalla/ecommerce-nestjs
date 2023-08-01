import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RequestWithUser } from 'src/auth/interfaces/user-request.interface';
import { BaseService, Pagination, SearchOptions } from 'src/core/shared';
import { StockItemReversed } from 'src/reverse-transaction/classes/reverse-stockitem-class';
import { REFTRANSACTIONENUM } from 'src/stock-item-data/enums/ref-transaction-enum';
import { StockItemDataService } from 'src/stock-item-data/stock-item-data.service';
import { CreateRefundTransactionDto } from './dto/create-refund-transaction.dto';
import { RefundTransaction, RefundTransactionDoc } from './entities/refund-transaction-entity';

@Injectable()
export class RefundTransactionService extends BaseService<RefundTransactionDoc> {
  constructor(
    @InjectModel(RefundTransaction.name) readonly m: Model<RefundTransactionDoc>,
    @Inject(forwardRef(() => StockItemDataService))
    private readonly stockItemService: StockItemDataService,
  ) {
    super(m);
  }
  async createRefundTransactions(req: RequestWithUser, dto: CreateRefundTransactionDto) {
    dto.warehouseId =req.user.warehouseId;
    let entitiesExist;
    dto.userId = req.user._id;
    console.log("entityId1", req.user.entityId,
      " warehouseId1:", req.user.warehouseId,
      // " stockItemId1:", item.stockItemId,
    );
    const session = await this.m.startSession();
    let transIds = [],
      stockitemRefunded,
      refundedQty,
      price = 0,
      totalPrice = 0;
    await session.withTransaction(async (): Promise<any> => {
      for (const item of dto.items) {
        refundedQty = item.qty;
        console.log(refundedQty);
        price = item.qty * item.price;
        console.log(price);
        if (item.batches) {
          const { qty } = item;
          let allQty = 0;
          for (const batch of item.batches) {
            allQty = allQty + batch.qty;
          }
          if (qty != allQty) {
            throw new BadRequestException('110');
          }
        }
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
          throw new BadRequestException('201');
        }
        const { _id, qtyOnHand } = aggregated[0].warehousestockitem;
        let newQty: number = qtyOnHand + item.qty;
        await this.stockItemService.warehouseStockItems.updateOne(
          { _id: _id },
          { qtyOnHand: newQty },
          { session: session },
        );
        console.log(
          " warehouseId:// ", req.user.warehouseId);

        let batches = [];
        // if (item.batches) {
        //   for (const batch of item.batches) {
        //     const selectedBatch = await this.stockItemService.stockItemTransaction.findOne(
        //       {
        //         stockItemId: this.toObjectId(item.stockItemId),
        //         warehouseId: this.toObjectId(req.user.warehouseId),
        //         'batches._id': this.toObjectId(batch._id),
        //       },
        //       { qtyRemaining: 1, batches: { $elemMatch: { _id: this.toObjectId(batch._id) } } },
        //     );
        //     console.log("stockItemId:", item.stockItemId,
        //       " warehouseId: ", req.user.warehouseId,
        //       " 'batches._id': ", this.toObjectId(batch._id),);

        //     await this.stockItemService.stockItemTransaction.updateOne(
        //       {
        //         stockItemId: this.toObjectId(item.stockItemId),
        //         warehouseId: this.toObjectId(req.user.warehouseId),
        //         'batches._id': this.toObjectId(batch._id),
        //       },
        //       {
        //         qtyRemaining: selectedBatch.qtyRemaining - batch.qty,
        //         $set: {
        //           'batches.$.qtyRemaining': selectedBatch.batches[0].qtyRemaining - batch.qty,
        //         },
        //       },
        //       { returnDocument: 'after' },
        //     );
        //     selectedBatch.batches[0]['qty'] = batch.qty;

        //     batches.push(selectedBatch.batches[0]);
        //     selectedBatch.batches[0]['qtyRemaining'] = batch.qty;
        //   }

        //   item.batches = batches;
        // } 
        // else {
          // const sortedDateBatches = await this.stockItemService.stockItemTransaction.aggregate([
          //   {
          //     $match: {
          //       stockItemId: this.toObjectId(item.stockItemId),
          //       qtyRemaining: { $ne: 0 },
          //       warehouseId: this.toObjectId(req.user.warehouseId),
          //     },
          //   },
          // ]);
          // console.log("stockItemId:/", item.stockItemId,
          //   " warehouseId:/ ", req.user.warehouseId,
          // );
          // const stockItemExist = await this.stockItemService.findOneById(item.stockItemId);
          // entitiesExist = stockItemExist.entityId;
          // for (const stockItemDoc of sortedDateBatches) {
          //   const { qtyRemaining, _id } = stockItemDoc;
          //   if (refundedQty <= qtyRemaining && refundedQty != 0) {
          //     await this.stockItemService.stockItemTransaction.updateOne(
          //       { _id: stockItemDoc._id },
          //       { qtyRemaining: qtyRemaining - refundedQty },
          //       { session: session },
          //     );
          //     refundedQty = 0;
          //   } else if (refundedQty > qtyRemaining) {
          //     refundedQty = refundedQty - qtyRemaining;
          //     await this.stockItemService.stockItemTransaction.updateOne(
          //       { _id: stockItemDoc._id },
          //       { qtyRemaining: qtyRemaining - qtyRemaining },
          //       { session: session },
          //     );
          //   }
          // }
        // }
        // console.log("entityId", entitiesExist,
        //   " warehouseId:", req.user.warehouseId,
        //   " stockItemId:", item.stockItemId,);

        const stockItemTrans = await this.stockItemService.stockItemTransaction.create(
          [
            {
              entityId: req.user.entityId,

              // entityId: entitiesExist,
              warehouseId: this.toObjectId(req.user.warehouseId),
              stockItemId: this.toObjectId(item.stockItemId),
              //refTransactionId: stockitemRefunded[0]._id,
              transactionType: REFTRANSACTIONENUM.REFUND,
              qty: item.qty,
              qtyRemaining: item.qty,
              price: item.price,
              //  batches: item.batches,
            },
          ],
          { session: session },
        );
        if (item.batches) {
          await this.stockItemService.stockItemTransaction.updateOne(
            { _id: stockItemTrans[0]._id },
            { batches: batches },
            { session: session },
          );
        }
        transIds.push(stockItemTrans[0]._id);

        totalPrice = totalPrice + price;
      }

      stockitemRefunded = await this.m.create([{ entityId: entitiesExist, warehouseId: req.user.warehouseId, ...dto }], { session: session });
      console.log("entitiesExist",entitiesExist);
      
      for (const Id of transIds) {
        await this.stockItemService.stockItemTransaction.updateOne(
          { _id: Id },
          { refTransactionId: stockitemRefunded[0]._id },
          { session: session },
        );
      }
    });
    session.endSession();
    return await this.updateOne({ _id: stockitemRefunded[0]._id }, { price: totalPrice });
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
          from: 'users',
          localField: 'customerId',
          foreignField: '_id',
          as: 'user',
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
