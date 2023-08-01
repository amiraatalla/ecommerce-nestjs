import { BadRequestException, forwardRef, Inject, Injectable, Req, Res } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as exceljs from 'exceljs';
import { parse } from '@fast-csv/parse';
import * as fs from 'fs';
import * as path from 'path';
import * as deepmerge from 'deepmerge';
import {
  StockItem,
  StockItemDoc,
  WarehouseStockItems,
  WarehouseStockItemsDoc,
} from './entities/stock-item.entity';
import { BaseService, Pagination, SearchOptions } from 'src/core/shared';
import { CreateStockItemDto, NameLocalized } from './dto/create-stockitem.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UsersService } from 'src/users/users.service';
import { PurchaseOrderService } from 'src/purchase-order/purchase-order.service';
import { SuppliersService } from 'src/suppliers/suppliers.service';
import { Response } from 'express';
import { WarehouseManagementService } from 'src/warehouse-management/warehouse-management.service';
import {
  StockItemTransactions,
  StockItemTransactionsDoc,
} from './entities/stock-item-transaction.entity';
import { StockItemsWarehousesAssignment } from './dto/stockitems-warehouses-assignment.dto';
import { UpdateWarehoseStockItemDto } from './dto/update-warehouse-stockitem-data.dto';
import { PurchaseOrderClass } from 'src/purchase-order/classes/purchase-order.class';
import { BatchesTypeEnum, PricingMethod } from './enums/pricing-methods';
import { StockItemSearchOptions } from './dto/stock-item-search-option.dto';
import * as AWS from 'aws-sdk';
import { ConfigService } from 'src/config/config.service';
import { StockItemTypeEnum } from './enums/stock-item-type';
import { NotificationService } from 'src/notification/notification.service';
import { generateRandomAlphanumeric } from 'src/core/utils';
import { EmailRequest, MailService } from '@buyby/mail';
import { UploadService } from 'src/upload/upload.service';
import { UnitsEnum } from './enums/units.enum';
import { StockCategoryService } from 'src/stock-category/stock-category.service';
import { RequestWithUser } from 'src/core/interfaces';
import { FindStockItemBySKUDto } from './dto/find-stock-item-by-sku.dto';
import { OrderService } from 'src/order/order.service';
import { ReleaseTransactionsService } from 'src/release-transactions/release-transactions.service';
const csvjson = require('csvjson');

@Injectable()
export class StockItemDataCustomerService extends BaseService<StockItemDoc> {
  constructor(
    @InjectModel(StockItem.name) public readonly m: Model<StockItemDoc>,
    @InjectModel(WarehouseStockItems.name)
    public readonly warehouseStockItems: Model<WarehouseStockItemsDoc>,
    @InjectModel(StockItemTransactions.name)
    public readonly stockItemTransaction: Model<StockItemTransactionsDoc>,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationsService: NotificationService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    @Inject(forwardRef(() => PurchaseOrderService))
    private readonly purchaseOrderService: PurchaseOrderService,
    private readonly suppliersService: SuppliersService,
    @Inject(forwardRef(() => WarehouseManagementService))
    private readonly warehouseService: WarehouseManagementService,
    private readonly uploadsService: UploadService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => StockCategoryService))
    private readonly stockCategoryService: StockCategoryService,
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
    private readonly releaseTransactionsService: ReleaseTransactionsService,


  ) {
    super(m);
  }


  //find stock item by sku and entityId
  async getStockItemBySKU(req: RequestWithUser, dto: FindStockItemBySKUDto) {

    let aggregation = [];
    aggregation.push(
      {
        $match: {
          $and: [{ sku: dto.sku },
          { entityId: this.toObjectId(dto.entityId) }]
        }
      },

      {
        $lookup: {
          from: 'warehousestockitems',
          localField: 'warehouseStockItemsData',
          foreignField: '_id',
          as: 'warehousestockitem',
        },
      },
      {
        $unwind:
        {
          path: '$warehousestockitem',
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $lookup: {
          from: 'entities',
          localField: 'entityId',
          foreignField: '_id',
          as: 'entityData',
        },
      },

    );
    const result = await this.aggregateOne(aggregation);
    if (!result) throw new BadRequestException('201')
    return result;
  }

  async getStockItemById(req: RequestWithUser, id: string) {

    let aggregation = [];
    aggregation.push(
      {
        $match: { _id: this.toObjectId(id) }
      },
      {
        $lookup: {
          from: 'warehousestockitems',
          localField: 'warehouseStockItemsData',
          foreignField: '_id',
          as: 'warehousestockitem',
        },
      },
      {
        $unwind:
        {
          path: '$warehousestockitem',
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $lookup: {
          from: 'entities',
          localField: 'entityId',
          foreignField: '_id',
          as: 'entityData',
        },
      },

    );
    const result = await this.aggregateOne(aggregation);
    if (!result) throw new BadRequestException('201')
    return result;
  }

  async findAllByCustomer(
    options: StockItemSearchOptions,
    entityId?: Types.ObjectId,
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
    if (entityId) {
      aggregation.push({ $match: { entityId } });
    }

    if (sort && dir) {
      this.sort(aggregation, sort, dir);
    }

    if (filterBy?.length) {
      this.filter(aggregation, filterBy);
    }

    if (searchTerm) {
      this.search(aggregation, searchTerm);
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
          as: 'entityData',
        }
      },
      {
        $lookup: {
          from: 'warehousestockitems',
          localField: 'warehouseStockItemsData',
          foreignField: '_id',
          as: 'warehousestockitem',
        }
      },
      {
        $unwind:
        {
          path: '$warehousestockitem',
          preserveNullAndEmptyArrays: true
        }
      }
    );

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
            $and: [
              {
                $or: [
                  {
                    createdAtToString: { $gte: filterByDateFrom, $lte: filterByDateTo },
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

  async findAllCategories(
    entityId: Types.ObjectId,
    req: RequestWithUser,
  ) {
    const aggregation = [];


    if (entityId) {
      aggregation.push({ $match: { entityId } });
    }



    aggregation.push(
      {
        $lookup: {
          from: 'entities',
          localField: 'entityId',
          foreignField: '_id',
          as: 'entityData',
        },
      },
      { $unwind: '$warehouseStockItemsData' },
      {
        $lookup: {
          from: 'warehousestockitems',
          localField: 'warehouseStockItemsData',
          foreignField: '_id',
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
        $group: {
          _id: '$stockCategoryId',
          items: { $push: '$$ROOT' },
        }
      },
     
      {
        $project: {
          'catetgory.items': '$items',
        }
      },
      {
        $match: {
          _id: {
            $ne: null
          }
        }
      },
      {
        $match: {
          'catetgory.items.0': { $exists: true }
        }
      }, 
      {
        $lookup: {
          from: 'stockcategories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
     {
       $unwind: { path: '$category', preserveNullAndEmptyArrays: true },
     },
     {
       $addFields: {
         entityId:'$category.entityId',
         stockategoryName: '$category.stockategoryName',
         parentStockategoryId:'$category.parentStockategoryId', 
         department:'$category.department',
         section:'$category.section',
         createdAt:'$category.createdAt',
         updatedAt:'$category.updatedAt',

       }
     },
     {
      $project: {
        category:0,        
      }},
    );


    return await this.m.aggregate(aggregation);
  }
  async findAllPopularStockItems(
    entityId: Types.ObjectId,
    req: RequestWithUser
  ) {
    const aggregation = [];
    if (entityId) {
      aggregation.push({ $match: { entityId } });
    }

    aggregation.push(

      {
        $unwind: { path: '$items', preserveNullAndEmptyArrays: false },
      },

      {
        $group: {
          _id: '$items.stockItemId',
          item: { $first: '$items.stockItemId' }, //$first accumulator
          count: { $sum: 1 },
        },
      },
      {
        // Get item data
        $lookup: { from: 'stockitems', localField: 'item', foreignField: '_id', as: 'item' },
      },
      {
        $unwind: { path: '$item', preserveNullAndEmptyArrays: false },
      },
      {
        $lookup: {
          from: 'warehousestockitems',
          localField: 'item.warehouseStockItemsData',
          foreignField: '_id',
          as: 'warehousestockitem',
        },
      },
      {
        $unwind: { path: '$warehousestockitem', preserveNullAndEmptyArrays: false },
      },
      {
        $lookup: {
          from: 'entities',
          localField: 'item.entityId',
          foreignField: '_id',
          as: 'entityData',
        },
      },
      { $sort: { count: -1 } },


    )

    return await this.releaseTransactionsService.m.aggregate(aggregation);
  }
  /**
   * Search document fields.
   */
  private search(aggregation: any, searchTerm: string): void {
    aggregation.push({
      $match: {
        $or: [
          {
            'nameLocalized.mainLanguage': {
              $regex: new RegExp(searchTerm),
              $options: 'i',
            },
          },
          { description: { $regex: new RegExp(searchTerm), $options: 'i' } },
          { stockItemCode: { $regex: new RegExp(searchTerm), $options: 'i' } },
          { sku: { $regex: new RegExp(searchTerm), $options: 'i' } },
        ],
      },
    });
  }
}
