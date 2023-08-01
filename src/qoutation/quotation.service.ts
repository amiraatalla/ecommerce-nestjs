import { MailService } from "@buyby/mail";
import { BadRequestException, forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { RequestWithUser } from "src/auth/interfaces/user-request.interface";
import { BaseService, Pagination } from "src/core/shared";
import { WarehouseStockItems, WarehouseStockItemsDoc } from "src/stock-item-data/entities/stock-item.entity";
import { StockItemDataService } from "src/stock-item-data/stock-item-data.service";
import { SYSLogService } from "src/sysLog/sysLog.service";
import { UsersService } from "src/users/users.service";
import { CreateQuotationDto } from "./dto/create-quotation.dto";
import { Quotation, QuotationDoc } from "./entities/quotation.entity";
import * as CircularJSON from 'circular-json';
import { UploadService } from "src/upload/upload.service";
import * as csvjson from "csvjson";
import { ItemsPricesOutput } from "./classes/items-prices-output";
import { Response } from 'express';
import { QuotationSearchOptions } from "./dto/quotation-search-options.dto";



@Injectable()
export class QuotationService extends BaseService<QuotationDoc> {
  constructor(
    @InjectModel(Quotation.name) readonly m: Model<QuotationDoc>,
    @InjectModel(WarehouseStockItems.name)
    readonly warehouseStockItems: Model<WarehouseStockItemsDoc>,
    private readonly sysLogsService: SYSLogService,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    @Inject(forwardRef(() => StockItemDataService))
    private readonly stockItemService: StockItemDataService,
    private readonly uploadsService: UploadService,



  ) {
    super(m);
  }


  async createQuotation(req: RequestWithUser, dto: CreateQuotationDto, res: Response) {
    let sellingPrice;
    let nameLocalized;
    let name;
    let stockItemId;
    let itemList = {};
    let itemsList = [];
    let itemData = {};
    let data = [];
    for (const item in dto.itemsList) {
      const stockItem = await this.stockItemService.findOneById(
        dto.itemsList[item].stockItemId,
      );
      console.log('stockItem', stockItem);

      if (stockItem) {
        const warehouseItem = await this.warehouseStockItems.findOne({
          _id: stockItem.warehouseStockItemsData,
        });
        console.log('warehouseItem', warehouseItem);

        sellingPrice = warehouseItem.sellingPrice;
        nameLocalized = stockItem.nameLocalized;
        name = stockItem.nameLocalized.mainLanguage;
        stockItemId = dto.itemsList[item].stockItemId;
        itemList = {
          stockItemId: stockItemId,
          nameLocalized: nameLocalized,
          sellingPrice: sellingPrice,

        }
        itemsList.push(itemList);

        itemData = {
          name: name,
          sellingPrice: sellingPrice,
        }

        data.push(itemData)
      }
    }
    const quotation = await this.create({ userId: req.user._id, customerEmail: dto.customerEmail, itemsList: itemsList });

    let str = CircularJSON.stringify(data);
    // let sheet = this.prepareItemsPricesCSV(items, "items-prices.csv", res)
    this.mailService.sendQuotationMail(dto.customerEmail, str);
    res.status(200).json({ data: quotation });

  }


  async deleteQuotation(req: RequestWithUser, id: string) {
    const quotationExist = await this.removeOne({ _id: this.toObjectId(id), userId: req.user._id });
    if (!quotationExist) throw new BadRequestException("025,R025");
    return quotationExist;
  }

  async findQuotation(req: RequestWithUser, id: string) {
    const quotationExist = await this.findOne({ _id: this.toObjectId(id), userId: req.user._id });
    if (!quotationExist) throw new BadRequestException("025,R025");
    return quotationExist;
  }


  /**
  * Search quotation collection.
  */
  async findAll(
    userId: Types.ObjectId,
    options: QuotationSearchOptions,
    req: RequestWithUser,
  ): Promise<Pagination> {
    const aggregation = [];

    const {
      dir,
      offset,
      size,
      searchTerm,
      filterBy,
      attributesToRetrieve,
      filterByDateFrom,
      filterByDateTo,
    } = options;

    const sort = 'index';
    aggregation.push({ $match: { userId } });
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
          $unwind: { path: '$itemsList', preserveNullAndEmptyArrays: false },
        },
        {
          // Get item data
          $lookup: {
             from: 'stockitems', 
             localField: 'itemsList.nameLocalized.mainLanguage', 
             foreignField: 'nameLocalized.mainLanguage',
              as: 'item' 
            },
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
    
        // 
        
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'owner',
          },
        },
        {
          $unwind: { path: '$owner', preserveNullAndEmptyArrays: false },
        },
        {
          $lookup: {
            from: 'entities',
            localField: 'owner.entityId',
            foreignField: '_id',
            as: 'entityData',
          },
        },



        ///
       
   
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
   * Search quotation fields.
   */
  private search(aggregation: any, searchTerm: string): void {
    aggregation.push({
      $match: {
        $or: [
          {
            'itemsList.nameLocalized.mainLanguage': {
              $regex: new RegExp(searchTerm),
              $options: 'i',
            }
          },
        ],
      },
    });
  }

  // async prepareItemsPricesCSV(
  //   itemsData: ItemsPricesOutput[],
  //   sheetName: string,
  //   res: Response,
  // ) {
  //   let modifiedStockItems = [];
  //   itemsData.forEach((itemData) => {
  //     let modifyItemsData = {
  //       name: itemData.name,
  //       sellingPrice: itemData.sellingPrice,

  //     };

  //     modifiedStockItems.push(modifiedStockItems);
  //   });
  //   const csvData = csvjson.toCSV(modifiedStockItems, { headers: 'key' });
  //   //upload to s3
  //   const uploadedFile: any = await this.uploadsService.s3Upload(
  //     csvData,
  //     sheetName,
  //   );

  //   res.status(200).json({ URL: `${uploadedFile.Location}` });
  // }


}