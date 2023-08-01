import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession } from 'mongodb';
import { Model, Types } from 'mongoose';
import { RequestWithUser } from 'src/core/interfaces';
import { BaseService, Pagination, SearchOptions } from 'src/core/shared';
import { StockItemDataService } from 'src/stock-item-data/stock-item-data.service';
import { CreateReleaseTransactionsDto, ItemRelease } from './dto/create-release-transactions.dto';
import { ReleaseTransactions, ReleaseTransactionsDoc } from './entities/release-transaction.entity';

@Injectable()
export class ReleaseTransactionsService extends BaseService<ReleaseTransactionsDoc> {
  constructor(
    @InjectModel(ReleaseTransactions.name) readonly m: Model<ReleaseTransactionsDoc>,
    @Inject(forwardRef(() => StockItemDataService))
    private readonly stockItemService: StockItemDataService,
  ) {
    super(m);
  }
  async calculateExpiryPrice(releaseQty: number, stockItem, session: ClientSession) {
    let totalPrice = 0;

    for (const stockItemDoc of stockItem) {
      const { qtyRemaining, price, _id } = stockItemDoc.batches;
      if (releaseQty <= qtyRemaining && releaseQty != 0) {
        const stockitemQty = await this.stockItemService.stockItemTransaction.findById(
          stockItemDoc._id,
        );
        totalPrice = totalPrice + releaseQty * price;
        await this.stockItemService.stockItemTransaction.updateOne(
          {
            _id: stockItemDoc._id,
            'batches._id': _id,
          },
          {
            qtyRemaining: stockitemQty.qtyRemaining - releaseQty,
            $set: { 'batches.$.qtyRemaining': qtyRemaining - releaseQty },
          },
        );
        releaseQty = 0;
      } else if (releaseQty > qtyRemaining) {
        const stockitemQty = await this.stockItemService.stockItemTransaction.findById(
          stockItemDoc._id,
        );
        releaseQty = releaseQty - qtyRemaining;
        totalPrice = totalPrice + qtyRemaining * price;
        await this.stockItemService.stockItemTransaction.updateOne(
          {
            _id: stockItemDoc._id,
            'batches._id': _id,
          },
          {
            qtyRemaining: stockitemQty.qtyRemaining - qtyRemaining,
            $set: { 'batches.$.qtyRemaining': qtyRemaining - qtyRemaining },
          },
        );
      }
    }
    return totalPrice;
  }
  async calculatePrice(releaseQty: number, stockItem, trackBatch: boolean, session: ClientSession) {
    let totalPrice = 0;

    for (const stockItemDoc of stockItem) {
      const { qtyRemaining, price } = stockItemDoc;

      if (releaseQty <= qtyRemaining && releaseQty != 0) {
        totalPrice = totalPrice + releaseQty * price;
        await this.stockItemService.stockItemTransaction.updateOne(
          { _id: stockItemDoc._id },
          { qtyRemaining: qtyRemaining - releaseQty },
          { session: session },
        );
        if (trackBatch) {
          for (let n = 0; n < stockItemDoc.batches.length; n++) {
            const { qtyRemaining } = stockItemDoc.batches[n];
            if (releaseQty <= qtyRemaining && releaseQty != 0) {
              await this.stockItemService.stockItemTransaction.updateOne(
                {
                  _id: stockItemDoc._id,
                },
                { [`batches.${n}.qtyRemaining`]: qtyRemaining - releaseQty },
                { session: session },
              );
              releaseQty = 0;
            } else if (releaseQty > qtyRemaining) {
              releaseQty = releaseQty - qtyRemaining;
              await this.stockItemService.stockItemTransaction.updateOne(
                {
                  _id: stockItemDoc._id,
                },
                { [`batches.${n}.qtyRemaining`]: qtyRemaining - qtyRemaining },
                { session: session },
              );
            }
          }
        }
        releaseQty = 0;
      } else if (releaseQty > qtyRemaining) {
        totalPrice = totalPrice + qtyRemaining * price;
        releaseQty = releaseQty - qtyRemaining;
        await this.stockItemService.stockItemTransaction.updateOne(
          { _id: stockItemDoc._id },
          { qtyRemaining: qtyRemaining - qtyRemaining },
          { session: session },
        );
        if (trackBatch) {
          stockItemDoc.batches.map(async (batch, n) => {
            await this.stockItemService.stockItemTransaction.updateOne(
              { _id: stockItemDoc._id },
              { [`batches.${n}.qtyRemaining`]: 0 },
              { session: session },
            );
          });
        }
      }
    }
    return totalPrice;
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
    const { _id, qtyOnHand, qtyOnHold } = aggregated[0].warehousestockitem;
    let newQty: number = qtyOnHand - qty;
    // let newHoldQty: number = qtyOnHold - qty;  // remove from relase  but exist in invoice release
    await this.stockItemService.warehouseStockItems.updateOne(
      { _id: _id },
      // { qtyOnHand: newQty, qtyOnHold: newHoldQty },
      { qtyOnHand: newQty },
      { session: session },
    );
  }
  async checkQty(stockItemId: Types.ObjectId, warehouseId: Types.ObjectId, qty: number) {
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
    const { qtyOnHand } = aggregated[0].warehousestockitem;
    if (qtyOnHand < qty) {
      throw new BadRequestException('113');
    }
  }
  async createReleaseTransactions(
    req: RequestWithUser,
    dto?: CreateReleaseTransactionsDto,
    options?: {},
  ) {
    dto.warehouseId = req.user.warehouseId;
    dto.userId = req.user._id;
    const session = await this.m.startSession();
    let stockItemsReleased,
      stockitems,
      warehouseId,
      totalPrice: number = 0,
      price: number = 0;
    await session.withTransaction(async (): Promise<any> => {
      if (dto) {
        stockitems = dto.items;
        warehouseId = req.user.warehouseId;
      }

      for (const item of stockitems) {
        const stockItem = await this.stockItemService.findOneAndErr({ _id: item.stockItemId });
        await this.checkQty(stockItem._id, warehouseId, item.qty);
        const pricing = stockItem.pricingMethod;
        const trackBatch = stockItem.trackBatches;
        let releaseQty = item.qty;
        if (pricing == 'FIFO') {
          const stockItemBatches = await this.stockItemService.stockItemTransaction.find(
            {
              stockItemId: item.stockItemId,
              qtyRemaining: { $ne: 0 },
              warehouseId: this.toObjectId(warehouseId),
            },
            { _id: 1, qtyRemaining: 1, price: 1, batches: 1 },
          );
          totalPrice = await this.calculatePrice(releaseQty, stockItemBatches, trackBatch, session);
          item.totalPrice = totalPrice;
          this.decreaseTotalQty(item.stockItemId, warehouseId, item.qty, session);
        } else if (pricing == 'LIFO') {
          const stockItemBatches = await this.stockItemService.stockItemTransaction.find(
            {
              stockItemId: item.stockItemId,
              qtyRemaining: { $ne: 0 },
              warehouseId: this.toObjectId(warehouseId),
            },
            { _id: 1, qtyRemaining: 1, price: 1, batches: 1 },
          );
          let stockItemBatchesLifo = [];
          for (let i = stockItemBatches.length - 1; i >= 0; i--) {
            stockItemBatchesLifo.push(stockItemBatches[i]);
          }
          totalPrice = await this.calculatePrice(
            releaseQty,
            stockItemBatchesLifo,
            trackBatch,
            session,
          );
          item.totalPrice = totalPrice;
          this.decreaseTotalQty(item.stockItemId, warehouseId, item.qty, session);
        } else if (pricing == 'EXPIRY') {
          const sortedDateBatches = await this.stockItemService.stockItemTransaction.aggregate([
            {
              $match: {
                stockItemId: item.stockItemId,
                qtyRemaining: { $ne: 0 },
                warehouseId: this.toObjectId(warehouseId),
              },
            },
            { $unwind: '$batches' },
            {
              $sort: {
                'batches.expiryDate': 1,
              },
            },
            {
              $project: {
                qtyRemaining: 1,
                batches: 1,
                _id: 1,
              },
            },
          ]);
          totalPrice = await this.calculateExpiryPrice(releaseQty, sortedDateBatches, session);
          item.totalPrice = totalPrice;
          this.decreaseTotalQty(item.stockItemId, warehouseId, item.qty, session);
        }
        // price = price + totalPrice;
      }
      // let warehouseid = req.user.warehouseId;
      stockItemsReleased = await this.m.create({ entityId: req.user.entityId, warehouseId: req.user.warehouseId, userId: req.user._id, ...dto }, {
        session: session,
      });

    });
    session.endSession();
    return stockItemsReleased[0];
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
          from: 'customers',
          localField: 'customerId',
          foreignField: '_id',
          as: 'customer ',
        },
      },
      // {
      //   $lookup: {
      //     from: 'users',
      //     localField: 'userId.toString()',
      //     foreignField: '_id,toString()',
      //     as: 'user',
      //   }
      // },
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