import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException, Req, Res } from '@nestjs/common';
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
import { UpdateStockItemDto } from './dto/update-stockitem.dto';
import { UpdateIsFeaturesDto } from './dto/update-is-features.dto';
const csvjson = require('csvjson');

@Injectable()
export class StockItemDataService extends BaseService<StockItemDoc> {
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

  bufferFile(relPath) {
    return fs.readFileSync(relPath); // zzzz....
  }
  async prepareCSV(
    stockItems: StockItemDoc[],
    sheetName: string,
    res: Response,
  ) {
    let modifiedStockItems = [];
    stockItems.forEach((stockItem) => {
      let modifyStockItem = {
        ItemName: stockItem.nameLocalized.mainLanguage,
        Description: stockItem.description,
        Type: stockItem.type,
        StorageUnit: stockItem.storageUnit,
        PricingMethod: stockItem.pricingMethod,
        BatchesType: null,
        // TrackBatches: stockItem.trackBatches,
        // TrackExpiry: stockItem.trackExpiry,
        SellingPrice: stockItem.warehousestockitem.sellingPrice,
        SKU: stockItem.sku,
        MinQty: stockItem.warehousestockitem.minQty,
        MaxQty: stockItem.warehousestockitem.maxQty,
        MinQtyAlert: stockItem.warehousestockitem.minQtyAlert,
        MaxQtyAlert: stockItem.warehousestockitem.maxQtyAlert,
        ReorderPoint: stockItem.warehousestockitem.reOrderPoint,
        qtyToReorder: stockItem.warehousestockitem.qtyToOrder,
        unCodedItem: stockItem.unCodedItem,
        StockItemCode: stockItem.stockItemCode,
      };
      if (stockItem.trackExpiry == true && stockItem.trackBatches == true) {
        modifyStockItem['BatchesType'] = 'EXPIRY';
      }
      if (stockItem.trackExpiry == false && stockItem.trackBatches == true) {
        modifyStockItem['BatchesType'] = 'BATCH';
      }
      if (stockItem.trackExpiry == false && stockItem.trackBatches == false) {
        modifyStockItem['BatchesType'] = 'NONE';
      }
      console.log(modifyStockItem);
      modifiedStockItems.push(modifyStockItem);
    });
    const csvData = csvjson.toCSV(modifiedStockItems, { headers: 'key' });
    //upload to s3
    const uploadedFile: any = await this.uploadsService.s3Upload(
      csvData,
      sheetName,
    );

    res.status(200).json({ URL: `${uploadedFile.Location}` });
  }
  async checkData(dto) {
    let typeFlag = true,
      unitFlag = true,
      pricingFlag = true,
      priceTpyeFlag = true;
    if (!Object.values(StockItemTypeEnum).includes(dto.type)) {
      typeFlag = false;
    }
    if (!Object.values(UnitsEnum).includes(dto.storageUnit)) {
      unitFlag = false;
    }
    if (!Object.values(PricingMethod).includes(dto.pricingMethod)) {
      pricingFlag = false;
    }

    if (!Object.values(BatchesTypeEnum).includes(dto.batchesType)) {
      priceTpyeFlag = false;
    }

    if (typeFlag && unitFlag && pricingFlag && priceTpyeFlag) {
      return true;
    } else {
      return false;
    }
  }
  async createStockItem(req: RequestWithUser, dto: CreateStockItemDto) {
   
    if(dto.sku){
    const stockItemExist = await this.findOne({
      entityId: req.user.entityId,
      sku :  dto.sku
    });
    if(stockItemExist) throw new BadRequestException("032,R032");
  }
  let stockItemCode;
    if (dto.unCodedItem) {
      stockItemCode = generateRandomAlphanumeric();
    }
    if (dto.sku && dto.unCodedItem) {
      throw new BadRequestException('102');
    }
    if (!dto.sku && !dto.unCodedItem) {
      throw new BadRequestException('103');
    }

    const warehouse = await this.warehouseService.findOneAndErr({
      _id: req.user.warehouseId,
      entityId: req.user.entityId,
    });
    if (!warehouse) throw new BadRequestException("163,R163")
    dto.warehouseId = req.user.warehouseId;
    const warehouseStockItemsData = await this.warehouseStockItems.create({ warehouseId: req.user.warehouseId, entity: req.user.entityId, ...dto });
    let writes = [];
    writes.push(warehouseStockItemsData._id);
    for (const name in dto.nameLocalized) {
      const stockCategory = await this.stockCategoryService.find({ stockategoryName: { $in: [dto.nameLocalized.mainLanguage, dto.nameLocalized.secondLanguage, dto.nameLocalized.thirdLanguage] } });
      console.log(stockCategory);
      for (const stockName in stockCategory) {
        if ((stockCategory[stockName].stockategoryName == dto.nameLocalized.mainLanguage || dto.nameLocalized.secondLanguage || dto.nameLocalized.thirdLanguage)) throw new BadRequestException("020,R20");
      }

    }
    const newStockItem = await this.create({
      entityId: req.user.entityId,
      stockItemCode: stockItemCode,
      warehouseStockItemsData: writes,
      ...dto,
    });
    
    let aggregation = [];
    aggregation.push(
      {
        $match:
          { _id: this.toObjectId(newStockItem._id) }
      },
      
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
    const data = await this.m.aggregate(aggregation);
    return data[0];
  
  }

  
  async exportStockItems(
    entityId: Types.ObjectId,
    warehouseId: Types.ObjectId,
    res: Response,
    type?: string,
  ) {
    let aggregation = [],
      sheetName;
    sheetName = 'stock items.csv';
    aggregation.push(
      {
        $match: { entityId },
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
      { $match: { 'warehousestockitem.warehouseId': warehouseId } },
    );
    if (type == 'uncoded') {
      sheetName = 'uncoded stock items.csv';
      aggregation.push({ $match: { unCodedItem: true } });
    }
    const stockItems = await this.m.aggregate(aggregation);
    this.prepareCSV(stockItems, sheetName, res);
  }
  async parseCsvFile(
    entityId: Types.ObjectId,
    warehouseId: Types.ObjectId,
    file: any,
    res: Response,
  ) {
    const table = [];
    const { originalname } = file;

    //upload to s3
    const uploadedFile: any = await this.uploadsService.s3Upload(
      file.buffer,
      originalname,
    );
    // if (file.mimetype === 'text/csv') {
    const s3 = new AWS.S3();
    //stream file data from s3 bucket
    s3.getObject({
      Bucket: this.configService.aws.bucket,
      Key: uploadedFile.key,
    })
      .createReadStream()
      .pipe(parse({ headers: true, trim: true }))
      .on('error', (error) => console.error(error))
      .on('data', (row) => table.push(row))
      .on('end', async () => {
        await this.importStockItems(entityId, warehouseId, res, table);
      });
  }
  async importStockItems(
    entityId: Types.ObjectId,
    warehouseId: Types.ObjectId,
    res: Response,
    data: any[],
  ) {
    let stockitem: any,
      fail = [],
      success = [],
      writes = [];
    try {
      for (stockitem of await data) {
        const name: NameLocalized = {
          mainLanguage: stockitem.ItemName,
          secondLanguage: 'string',
          thirdLanguage: 'string',
        };
        let sku;
        let unCodedItem;
        if (stockitem.SKU) {
          unCodedItem = false;
        } else {
          unCodedItem = true;
        }
        let dto = {
          nameLocalized: name,
          description: stockitem.Description,
          type: stockitem.Type,
          storageUnit: stockitem.StorageUnit.toUpperCase(),
          pricingMethod: stockitem.PricingMethod.toUpperCase(),
          batchesType: stockitem.BatchesType.toUpperCase(),
          sellingPrice: stockitem.SellingPrice,
          sku: stockitem.SKU,
          minQty: stockitem.MinQty,
          maxQty: stockitem.MaxQty,
          minQtyAlert: stockitem.MinQtyAlert,
          maxQtyAlert: stockitem.MaxQtyAlert,
          reOrderPoint: stockitem.ReorderPoint,
          qtyToOrder: stockitem.qtyToReorder,
          unCodedItem: unCodedItem,
          purchasePrice: stockitem.PurchasePrice,
        };

        let stockItemCode, trackExpiry, trackBatches;
        const checkResult = await this.checkData(dto);
        if (checkResult) {
          if (dto.unCodedItem && !dto.sku) {
            stockItemCode = generateRandomAlphanumeric();
          }
          if (dto.batchesType == 'EXPIRY') {
            (trackExpiry = true), (trackBatches = true);
          }
          if (dto.batchesType == 'BATCH') {
            (trackExpiry = false), (trackBatches = true);
          }
          if (dto.batchesType == 'NONE') {
            (trackExpiry = false), (trackBatches = false);
          }
          const warehouseStockItemsData = await this.warehouseStockItems.create(
            { warehouseId, ...dto },
          );
          let warehouseData = [];
          warehouseData.push(warehouseStockItemsData._id);
          const newStockItem = await this.create({
            entityId,
            stockItemCode,
            trackBatches,
            trackExpiry,
            warehouseStockItemsData: warehouseData,
            ...dto,
          });
          success.push(stockitem.ItemName);
          writes.push(newStockItem);
        } else {
          fail.push(stockitem.ItemName);
        }
      }
      const response = {
        success: success,
        Fail: fail,
        Imported: writes,
      };
      return res.status(200).send({ message: 'Done', data: response });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async assignStockItemToAnotherWarehouse(
    req: RequestWithUser,
    dto: StockItemsWarehousesAssignment,
  ) {
    await this.warehouseService.findOneAndErr({
      _id: req.user.warehouseId,
      entityId: req.user.entityId,
    });
    await this.findOneById(dto.idToAssign);
    const subStockItem = await this.warehouseStockItems.create(dto);
    await this.updateOne(
      { _id: dto.idToAssign },
      { $push: { warehouseStockItemsData: subStockItem._id } },
    );
    return await this.aggregateOne([
      {
        $match: { _id: dto.idToAssign },
      },
       
      {
        $lookup: {
          from: 'entities',
          localField: 'entityId',
          foreignField: '_id',
          as: 'entityData',
        }
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
      { $match: { 'warehousestockitem.warehouseId': req.user.warehouseId } },
    ]);
  }
  async getOneWarehoseStockItem(
    stockitemId: Types.ObjectId,
    entityId: Types.ObjectId,
    warehouseId: Types.ObjectId,
  ) {
    let aggregation = [];
    aggregation.push(
      { $match: { _id: stockitemId, entityId } },
 
      {
        $lookup: {
          from: 'entities',
          localField: 'entityId',
          foreignField: '_id',
          as: 'entityData',
        }
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
        $match: { 'warehousestockitem.warehouseId': warehouseId },
      },
    );
    const aggregated = await this.aggregateOne(aggregation);
    if (!aggregated) {
      throw new BadRequestException('201');
    }
    return aggregated;
  }
  async getOneStockItem(
    stockitemId: Types.ObjectId,
    entityId: Types.ObjectId,
  ) {
    let aggregation = [];
    aggregation.push(
      { $match: { _id: stockitemId, entityId } },
 
      {
        $lookup: {
          from: 'entities',
          localField: 'entityId',
          foreignField: '_id',
          as: 'entityData',
        }
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
      
    );
    const aggregated = await this.aggregateOne(aggregation);
    if (!aggregated) {
      throw new BadRequestException('201');
    }
    return aggregated;
  }
  async removeFromOneWarehouse(
    stockitemId: Types.ObjectId,
    entityId: Types.ObjectId,
    warehouseId: Types.ObjectId,
  ) {
    const stockItemSelected = await this.aggregateOne([
      { $match: { _id: stockitemId, entityId } },
 
      
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
        $match: { 'warehousestockitem.warehouseId': warehouseId },
      },
    ]);
    if(!stockItemSelected) throw new BadRequestException("202");
    
    await this.warehouseStockItems.findOneAndDelete({
      _id: stockItemSelected.warehouseStockItemsData,
    });
    const updatedData =  await this.updateOne(
      { _id: stockitemId, entityId },
      {
        $pull: {
          warehouseStockItemsData: stockItemSelected.warehouseStockItemsData,
        },
      },
    );
    const result = await this.aggregateOne([
      { $match: { _id: updatedData._id} },
 
      {
        $lookup: {
          from: 'entities',
          localField: 'entityId',
          foreignField: '_id',
          as: 'entityData',
        }
        
      }   
      
    ]);
    if(!result) throw new BadRequestException("201");
    return result;
  }
  async updateOneWarehoseStockItem(
    stockitemId: Types.ObjectId,
    entityId: Types.ObjectId,
    warehouseId: Types.ObjectId,
    dto: UpdateWarehoseStockItemDto,
  ) {
    const stockItemSelected = await this.aggregateOne([
      { $match: { _id: stockitemId, entityId } },
 
      
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
        $match: { 'warehousestockitem.warehouseId': warehouseId },
      },
    ]);

     await this.warehouseStockItems.findOneAndUpdate(
      { _id: stockItemSelected.warehouseStockItemsData },
      { ...dto },
      { returnDocument: 'after' },
    );
    return await this.aggregateOne([
      { $match: { _id: stockItemSelected._id} },
 
      {
        $lookup: {
          from: 'entities',
          localField: 'entityId',
          foreignField: '_id',
          as: 'entityData',
        }
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
      
    ]);
  }
  async updateStockItem(
    stockitemId: Types.ObjectId,
    entityId: Types.ObjectId,
    dto: UpdateStockItemDto,
  ) {
    const stockItemSelected = await this.aggregateOne([
      { $match: { _id: stockitemId, entityId } }
    ]);

     const updatedData= await this.updateOne(
      { _id: stockItemSelected._id },
      { ...dto },
    );
    return await this.aggregateOne([
      { $match: { _id: updatedData._id} },
 
      {
        $lookup: {
          from: 'entities',
          localField: 'entityId',
          foreignField: '_id',
          as: 'entityData',
        }
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
      
    ]);
  }
  async sendPurchaseOrderEmail(
    email: string,
    stockItem: string,
    qtyToOrder: number,
  ) {
    const emailObject: EmailRequest = {
      to: email,
      //cc:[],
      from: '',
      subject: `Purchase Order`,
      text: `Dear Supplier,
      This is purchase order for ${stockItem} with quantity ${qtyToOrder}`,
      html: `<p>Dear Supplier,
      This is purchase order for ${stockItem} with quantity ${qtyToOrder}</p>`,
    };

    return await this.mailService.sendEmail(emailObject);
  }
  async removeFromBatches(
    stockItemId: Types.ObjectId,
    entityId: Types.ObjectId,
    branchId: Types.ObjectId,
  ) {
    try {
      return await this.updateOne(
        { _id: stockItemId, entityId },
        { $pull: { stockItemBatches: { qty: 0 } } },
      );
    } catch (err) {
      throw new BadRequestException();
    }
  }
  async sendAlertStockEmail(
    email: string,
    name: string,
    stockItem: string,
    reOrderPoint: number,
    qtyOnHand: number,
    qtyToOrder: number,
  ) {
    const emailObject: EmailRequest = {
      to: email,
      from: '',
      subject: `Alert Stock items shortage`,
      text: `The ${name} warehouse has a shortage of ${stockItem} with quantity ${qtyOnHand}.
      It reached the re-order point of ${reOrderPoint} and the quantity to order is ${qtyToOrder}`,
      html: `<p>The ${name} warehouse has a shortage of ${stockItem} with quantity ${qtyOnHand}.
      It reached the re-order point of ${reOrderPoint} and the quantity to order is ${qtyToOrder}</p>`,
    };

    return await this.mailService.sendEmail(emailObject);
  }
  async sendExpiryStockEmail(
    email: string,
    name: string,
    stockItem: string,
    qtyToExpire: number,
  ) {
    const emailObject: EmailRequest = {
      to: email,
      from: '',
      subject: `Alert Stock items expiry`,
      text: `The ${stockItem} in ${name} warehouse has a quantity of ${qtyToExpire} about to expire.`,
      html: `<p>The ${stockItem} in ${name} warehouse has a quantity of ${qtyToExpire} about to expire.</p>`,
    };

    return await this.mailService.sendEmail(emailObject);
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleCron() {
    const stockItems = await this.m.aggregate([
      {
        $lookup: {
          from: 'warehousestockitems',
          let: { pid: '$warehouseStockItemsData' },
          pipeline: [{ $match: { $expr: { $in: ['$_id', '$$pid'] } } }],
          as: 'warehousestockitem',
        },
      },
      {
        $match: {
          $expr: {
            $lte: [
              '$warehousestockitem.qtyOnHand',
              '$warehousestockitem.reOrderPoint',
            ],
          },
        },
      },
      {
        $lookup: {
          from: 'warehouses',
          localField: 'warehousestockitem.warehouseId',
          foreignField: '_id',
          as: 'warehouse',
        },
      },
    ]);

    let sheetName = 'order alert.csv';
    let res;
    this.prepareCSV(stockItems, sheetName, res);
    for (const stockItem of stockItems) {
      const { entityId, preferredSupplierId, nameLocalized, _id } = stockItem;
      const {
        warehouseId,
        qtyOnHand,
        qtyToOrder,
        reOrderPoint,
        purchasePrice,
      } = stockItem.warehousestockitem[0];
      const { name } = stockItem.warehouse[0];
      const user = await this.usersService.findOne({
        entityId: this.toObjectId(entityId),
      });
      this.notificationsService.createAlertNotification(
        user._id,
        name,
        nameLocalized.mainLanguage,
        reOrderPoint,
        qtyOnHand,
        qtyToOrder,
      );
      this.sendAlertStockEmail(
        user.email,
        name,
        nameLocalized.mainLanguage,
        reOrderPoint,
        qtyOnHand,
        qtyToOrder,
      );
      if (preferredSupplierId) {
        const supplier = await this.suppliersService.findOneById(
          preferredSupplierId,
        );
        if (supplier.acceptsOrderByEmail) {
          let supplierMail = supplier.contactPersonDetails.ContactPersonEmail;
          this.sendPurchaseOrderEmail(supplierMail, name, qtyToOrder);
        }
      }
      let purchaseItem: PurchaseOrderClass = {
        stockItemId: _id,
        qtyToOrder,
        purchasePrice,
      };
      let writes = [];
      writes.push(purchaseItem);
      this.purchaseOrderService.create({
        entityId,
        warehouseId,
        supplierId: preferredSupplierId,
        items: writes,
      });
    }
  }
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleCron2() {
    const sortedDateBatches = await this.stockItemTransaction.aggregate([
      {
        $match: {
          qtyRemaining: { $ne: 0 },
        },
      },
      {
        $lookup: {
          from: 'warehouses',
          localField: 'warehouseId',
          foreignField: '_id',
          as: 'warehouses',
        },
      },
      {
        $lookup: {
          from: 'stockitems',
          localField: 'stockItemId',
          foreignField: '_id',
          as: 'stockitem',
        },
      },
    ]);
    await Promise.all(
      sortedDateBatches.map(async (stockItem) => {
        const { warehouses, entityId, stockitem } = stockItem;

        const user = await this.usersService.findOne({
          entityId: this.toObjectId(entityId),
        });
        stockItem.batches.map(async (batches) => {
          const nearDate = Math.abs(
            Date.now() - new Date(batches.expiryDate).getTime(),
          );

          const criticalDate = nearDate / (1000 * 3600 * 24);
          if (criticalDate <= 7 && batches.qtyRemaining) {
            this.notificationsService.createExpiryNotification(
              user._id,
              warehouses[0].name,
              stockitem[0].nameLocalized.mainLanguage,
              batches.qtyRemaining,
            );
            this.sendExpiryStockEmail(
              user.email,
              warehouses[0].name,
              stockitem[0].nameLocalized.mainLanguage,
              batches.qtyRemaining,
            );
          }
        });
      }),
    );
  }
  async findAllTest(entityId?: Types.ObjectId) {
    return await this.stockItemTransaction.aggregate([
      { $match: { entityId} },
 
      {
        $lookup: {
          from: 'entities',
          localField: 'entityId',
          foreignField: '_id',
          as: 'entityData',
        }
      },
      
    ]);
  }
  async findAllBatches(
    entityId: Types.ObjectId,
    warehouseId: Types.ObjectId,
    stockItemId: Types.ObjectId,
  ) {
    const sortedDateBatches = await this.stockItemTransaction.aggregate([
      {
        $match: {
          stockItemId,
          qtyRemaining: { $ne: 0 },
          warehouseId,
        },
      },
      { $unwind: { path: '$batches', preserveNullAndEmptyArrays: true } },

      {
        $match: {
          'batches.qtyRemaining': { $ne: 0 },
        },
      },
      {
        $project: {
          batches: 1,
        },
      },
    ]);
    if (sortedDateBatches[0].batches) {
      let stockItemBatches = [];
      for (const stockItemBatch of sortedDateBatches) {
        stockItemBatches.push(stockItemBatch.batches);
      }
      return stockItemBatches;
    }
  }
  async calculateExpiryPrice(releaseQty: number, stockItem) {
    let totalPrice = 0;

    for (const stockItemDoc of stockItem) {
      const { qtyRemaining, price, _id } = stockItemDoc.batches;
      if     (releaseQty <= qtyRemaining && releaseQty != 0) {
        const stockitemQty = await this.stockItemTransaction.findById(
          stockItemDoc._id,
        );
        console.log(stockitemQty.qtyRemaining);
        totalPrice = totalPrice + releaseQty * price;
        releaseQty = 0;
      } else if (releaseQty > qtyRemaining) {
        const stockitemQty = await this.stockItemTransaction.findById(
          stockItemDoc._id,
        );
        console.log(stockitemQty.qty);
        releaseQty = releaseQty - qtyRemaining;
        totalPrice = totalPrice + qtyRemaining * price;
      }
    }
    return totalPrice;
  }
  async calculatePrice(releaseQty: number, stockItem, trackBatch: boolean) {
    let totalPrice = 0;

    for (const stockItemDoc of stockItem) {
      const { qtyRemaining, price } = stockItemDoc;

      if (releaseQty <= qtyRemaining && releaseQty != 0) {
        totalPrice = totalPrice + releaseQty * price;
        if (trackBatch) {
          for (let n = 0; n < stockItemDoc.batches.length; n++) {
            const { qtyRemaining } = stockItemDoc.batches[n];
            if (releaseQty <= qtyRemaining && releaseQty != 0) {
              releaseQty = 0;
            } else if (releaseQty > qtyRemaining) {
              releaseQty = releaseQty - qtyRemaining;
            }
          }
        }
        releaseQty = 0;
      } else if (releaseQty > qtyRemaining) {
        totalPrice = totalPrice + qtyRemaining * price;
        releaseQty = releaseQty - qtyRemaining;
      }
    }
    return totalPrice;
  }
  async getPrice(
    entityId: Types.ObjectId,
    warehouseId: Types.ObjectId,
    stockItemId: Types.ObjectId,
    qty: number,
  ) {
    const stockItem = await this.findOneAndErr({ _id: stockItemId });
    const pricing = stockItem.pricingMethod;
    const trackBatch = stockItem.trackBatches;
    const stockItemBatches = await this.stockItemTransaction.find(
      {
        stockItemId: stockItemId,
        qtyRemaining: { $ne: 0 },
        warehouseId: this.toObjectId(warehouseId),
      },
      { _id: 1, qtyRemaining: 1, price: 1, batches: 1 },
    );
    if (pricing == 'FIFO') {
      return await this.calculatePrice(qty, stockItemBatches, trackBatch);
    } else if (pricing == 'LIFO') {
      let stockItemBatchesLifo = [];
      for (let i = stockItemBatches.length - 1; i >= 0; i--) {
        stockItemBatchesLifo.push(stockItemBatches[i]);
      }
      return await this.calculatePrice(qty, stockItemBatchesLifo, trackBatch);
    } else if (pricing == 'EXPIRY') {
      const sortedDateBatches = await this.stockItemTransaction.aggregate([
        {
          $match: {
            stockItemId: stockItemId,
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
      return await this.calculateExpiryPrice(qty, sortedDateBatches);
    }
  }
  async findAll(
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


  //
  async findAllIsFeatured(
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

    aggregation.push({  $match: {isFeatures: true}  });

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



  async updateIsFeatures(
    req: RequestWithUser,
    id: string,
    dto: UpdateIsFeaturesDto,
  ) {
    const itemExist = await this.findOneById(id);
      if (!itemExist) throw new NotFoundException('201');
      else {
        return await this.update(id, {
          ...dto,
        });
      }
  }

}
