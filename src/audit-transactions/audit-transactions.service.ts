import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RequestWithUser } from 'src/core/interfaces';
import { BaseService, Pagination, SearchOptions } from 'src/core/shared';
import { BatchesTransactions } from 'src/stock-item-data/classes/batches-transaction.class';
import { REFTRANSACTIONENUM } from 'src/stock-item-data/enums/ref-transaction-enum';
import { StockItemDataService } from 'src/stock-item-data/stock-item-data.service';
import { CreateAuditTransactionsDto } from './dto/audit-transactions.dto';
import { AuditTransactions, AuditTransactionsDoc } from './entities/audit-transaction.entity';
import { AuditTypeEnum } from './enums/audit-type.enum';

@Injectable()
export class AuditTransactionsService extends BaseService<AuditTransactionsDoc> {
  constructor(
    @InjectModel(AuditTransactions.name)  readonly m: Model<AuditTransactionsDoc>,
    private readonly stockItemService: StockItemDataService,
  ) {
    super(m);
  }

  async createAuditTransactions(req: RequestWithUser, dto: CreateAuditTransactionsDto) {
    dto.warehouseId =req.user.warehouseId;
    const session = await this.m.startSession();
    let stockItemsAudited,
      batchesArray = [],
      auditQty: number,
      transIds = [];

    await session.withTransaction(async (): Promise<any> => {
      for (const item of dto.items) {
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
          throw new BadRequestException({ errorCode: '201' });
        }
        const { _id, qtyOnHand } = aggregated[0].warehousestockitem;
        if (qtyOnHand == item.adjustment) {
          throw new BadRequestException({ errorCode: '100' });
        }
        auditQty = Math.abs(item.adjustment - qtyOnHand);
        if (item.batches) {
          // const { adjustment } = item;
          let allQty = 0;
          for (const batch of item.batches) {
            allQty = allQty + batch.qty;
          }
          if (auditQty != allQty) {
            throw new BadRequestException({ errorCode: '110' });
          }
        }
        if (item.adjustment > qtyOnHand) {
          item.auditType = AuditTypeEnum.Surplus;
          if (item.batches) {
            for (const itemId of item.batches) {
              itemId._id = new Types.ObjectId();
              itemId.price = item.price;
              let batches: BatchesTransactions = {
                _id: itemId._id,
                price: itemId.price,
                qty: itemId.qty,
                qtyRemaining: itemId.qty,
                dateTimeReceived: itemId.dateTimeReceived,
                expiryDate: itemId.expiryDate,
              };
              batchesArray.push(batches);
            }
          }
          const stockItemTrans = await this.stockItemService.stockItemTransaction.create(
            [
              {
              entityId:req.user.entityId,
                warehouseId: req.user.warehouseId,
                stockItemId: item.stockItemId,
                transactionType: REFTRANSACTIONENUM.AUDIT,
                qty: auditQty,
                qtyRemaining: auditQty,
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
        } else if (item.adjustment < qtyOnHand) {
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
                },
                {
                  qtyRemaining: selectedBatch.qtyRemaining - batch.qty,
                  $set: {
                    'batches.$.qtyRemaining': selectedBatch.batches[0].qtyRemaining - batch.qty,
                  },
                },
                { returnDocument: 'after' },
              );
              selectedBatch.batches[0]['qty'] = batch.qty;
              batches.push(selectedBatch.batches[0]);
            }
            item.batches = batches;
          } else {
            const sortedDateBatches = await this.stockItemService.stockItemTransaction.aggregate([
              {
                $match: {
                  stockItemId: item.stockItemId,
                  qtyRemaining: { $ne: 0 },
                  warehouseId: dto.warehouseId,
                },
              },
            ]);
            for (const stockItemDoc of sortedDateBatches) {
              const { qtyRemaining, _id } = stockItemDoc;
              if (auditQty <= qtyRemaining && auditQty != 0) {
                await this.stockItemService.stockItemTransaction.updateOne(
                  { _id: stockItemDoc._id },
                  { qtyRemaining: qtyRemaining - auditQty },
                  { session: session },
                );
                auditQty = 0;
              } else if (auditQty > qtyRemaining) {
                auditQty = auditQty - qtyRemaining;
                await this.stockItemService.stockItemTransaction.updateOne(
                  { _id: stockItemDoc._id },
                  { qtyRemaining: qtyRemaining - qtyRemaining },
                  { session: session },
                );
              }
            }
          }
        }

        await this.stockItemService.warehouseStockItems.updateOne(
          { _id: _id },
          { qtyOnHand: item.adjustment },
          { session: session },
        );
      }
      stockItemsAudited = await this.m.create([{entityId:req.user.entityId, ...dto }], { session: session });
      for (const Id of transIds) {
        await this.stockItemService.stockItemTransaction.updateOne(
          { _id: Id },
          { refTransactionId: stockItemsAudited[0]._id },
          { session: session },
        );
      }
    });
    session.endSession();

    return stockItemsAudited[0];
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
          $match: {createdAtToString: { $gte: filterByDateFrom, $lte: filterByDateTo },
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