import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Response } from 'express';
import { AddTransactionsService } from 'src/add-transactions/add-transactions.service';
import { AuditTransactionsService } from 'src/audit-transactions/audit-transactions.service';
import { RequestWithUser } from 'src/core/interfaces';
import { BaseService, Pagination } from 'src/core/shared';
import { toObjectId } from 'src/core/utils';
import { CouponService } from 'src/coupons/coupon.service';
import { CustomerService } from 'src/customer/customer.service';
import { CustomerSearchOptions } from 'src/customer/dto/customer-search-options.dto';
import { DeferredPayableService } from 'src/deferred-payable/deferred-payable.service';
import { DeferredRecievableService } from 'src/deferred-recievable/deferred-recievable.service';
import { EntitiesService } from 'src/Entities/entity.service';
import { OrderStatusEnum } from 'src/order/enums/order-status.enum';
import { OrderService } from 'src/order/order.service';
import { PayableService } from 'src/payable/payable.service';
import { PurchaseOrderService } from 'src/purchase-order/purchase-order.service';
import { RecievableService } from 'src/receivable/recievable.service';
import { RefundTransactionService } from 'src/refund-transaction/refund-transaction.service';
import { ReleaseTransactionsService } from 'src/release-transactions/release-transactions.service';
import { ReverseTransactionService } from 'src/reverse-transaction/reverse-transaction.service';
import { ServicesService } from 'src/services/services.service';
import { ShrinkageTransactionService } from 'src/shrinkage-transaction/shrinkage-transaction.service';
import { StockCategoryService } from 'src/stock-category/stock-category.service';
import { WarehouseStockItems, WarehouseStockItemsDoc } from 'src/stock-item-data/entities/stock-item.entity';
import { StockItemDataService } from 'src/stock-item-data/stock-item-data.service';
import { SubscriptionService } from 'src/subscribtion/subscribtion.service';
import { ActionsEnum } from 'src/sysLog/enums/actions.enums';
import { RoleGroups, RolesEnum } from 'src/users/enums/roles.enum';
import { SubscriptionTypeEnum } from 'src/users/enums/subscription-type.enum';
import { UsersService } from 'src/users/users.service';
import { WarehouseManagementService } from 'src/warehouse-management/warehouse-management.service';
import { WasteTransactionService } from 'src/waste-transaction/waste-transaction.service';
import { Period } from './classes/period-class';
import { DateFilter } from './dto/date-filter-report.dto';
import { DateToDatePeriodDto } from './dto/date-to-date-period.dto ';
import { DateToDateDto } from './dto/date-to-date.dto';
import { ReportItemSalesOptions } from './dto/report-item-sales.dto';
import { ReportOptions } from './dto/report-search.dto';
import { ReportDto } from './dto/report.dto';
import { WasteReport } from './dto/waste-report.dto';
import { Report, ReportDoc } from './entities/report.entity';
import { ComparisonEnum } from './enums/comparison-enum';
import { PeriodEnum } from './enums/period.enum';
import { UploadService } from 'src/upload/upload.service';
import { AvgBasketSizeOutput, CustomerOutput, GrossSalesOutput, LogsSystemDataOutput, NoMovingOutput, SlowMovingOutput, TopRecordsOutput } from './classes/reports-output.class';
const csvjson = require('csvjson');
import * as exceljs from "exceljs";
import * as csvjson from "csvjson";
import * as AWS from 'aws-sdk'
import { ConfigService } from 'src/config/config.service';
import { StatusEnum } from 'src/users/enums/status.enum';
import { SYSLogService } from 'src/sysLog/sysLog.service';
import { EntityTypeEnum } from 'src/Entities/enum/entity-type.enum';
import { ComparisonDTO } from './dto/comparison.dto';


@Injectable()
export class ReportService extends BaseService<ReportDoc> {
  constructor(
    @InjectModel(Report.name) readonly m: Model<ReportDoc>,
    @InjectModel(WarehouseStockItems.name)
    public readonly warehouseStockItems: Model<WarehouseStockItemsDoc>,
    private readonly sysLogsService: SYSLogService,
    private readonly customerService: CustomerService,
    private readonly entitiesService: EntitiesService,
    private readonly stockItemDataService: StockItemDataService,
    private readonly stockCategoryService: StockCategoryService,
    private readonly wasteTransactionService: WasteTransactionService,
    private readonly warehouseService: WarehouseManagementService,
    private readonly payableService: PayableService,
    private readonly deferredPayableService: DeferredPayableService,
    private readonly recievableService: RecievableService,
    private readonly deferredRecievableService: DeferredRecievableService,
    private readonly usersService: UsersService,
    private readonly couponService: CouponService,
    private readonly addTransactionService: AddTransactionsService,
    private readonly auditTransactionService: AuditTransactionsService,
    private readonly shrinkageTransactionService: ShrinkageTransactionService,
    private readonly reverseTransactionService: ReverseTransactionService,
    private readonly refundTransactionService: RefundTransactionService,
    private readonly releaseTransactionsService: ReleaseTransactionsService,
    private readonly purchaseOrderService: PurchaseOrderService,
    private readonly servicesService: ServicesService,
    private readonly orderService: OrderService,
    private readonly subscriptionService: SubscriptionService,
    private readonly uploadsService: UploadService,
    private readonly configService: ConfigService,


  ) {
    super(m);
  }
  async prepareCustomerCSV(
    customersData: CustomerOutput[],
    sheetName: string,
    res: Response,
  ) {
    let modifiedCustomers = [];
    customersData.forEach((customer) => {
      let customersData = {
        'Category': customer.cat[0],
        'Department Count': customer.customerCount,
        'All Customers': customer.AllCustomersCount,
        '% of Total Customer Count': customer.totalCount.toFixed(0) + "%"
      };

      modifiedCustomers.push(customersData);
    });
    const csvData = csvjson.toCSV(modifiedCustomers, { headers: 'key' });
    //upload to s3
    const uploadedFile: any = await this.uploadsService.s3Upload(
      csvData,
      sheetName,
    );
    res.status(200).json({ URL: `${uploadedFile.Location}` })

  }

  async prepareNoMovingCSV(
    noMovingSales: NoMovingOutput[],
    sheetName: string,
    res: Response,
  ) {
    let modifiedStockItems = [];
    noMovingSales.forEach((noMoving) => {
      let modifyNoMoving = {
        Category: noMoving.cat,
        ItemName: noMoving.name,
        'No Moving Days': noMoving.noMovingDays,
        'Last Transaction': noMoving.lastTransaction.toLocaleDateString(),
      };

      modifiedStockItems.push(modifyNoMoving);
    });
    const csvData = csvjson.toCSV(modifiedStockItems, { headers: 'key' });
    //upload to s3
    const uploadedFile: any = await this.uploadsService.s3Upload(
      csvData,
      sheetName,
    );
    res.status(200).json({ URL: `${uploadedFile.Location}` })

  }

  async prepareSlowMovingCSV(
    noMovingSales: SlowMovingOutput[],
    sheetName: string,
    res: Response,
  ) {
    let modifiedStockItems = [];
    noMovingSales.forEach((noMoving) => {
      let modifyNoMoving = {
        Category: noMoving.cat,
        ItemName: noMoving.name,
        'Expected Monthly Qty Sold': noMoving.expectedMonthlyQtySold,
        'Actual Monthly Qty Sold': noMoving.actualMonthlyQtySold,
      };

      modifiedStockItems.push(modifyNoMoving);
    });
    const csvData = csvjson.toCSV(modifiedStockItems, { headers: 'key' });
    //upload to s3
    const uploadedFile: any = await this.uploadsService.s3Upload(
      csvData,
      sheetName,
    );

    res.status(200).json({ URL: `${uploadedFile.Location}` });
  }


  async prepareTopRecordsCSV(
    noMovingSales: TopRecordsOutput[],
    sheetName: string,
    res: Response,
  ) {
    let modifiedStockItems = [];
    noMovingSales.forEach((noMoving) => {
      let modifyNoMoving = {
        Category: noMoving.cat,
        ItemName: noMoving.name,
        Qty: noMoving.count,
        Value: noMoving.value,
      };

      modifiedStockItems.push(modifyNoMoving);
    });
    const csvData = csvjson.toCSV(modifiedStockItems, { headers: 'key' });
    //upload to s3
    const uploadedFile: any = await this.uploadsService.s3Upload(
      csvData,
      sheetName,
    );

    res.status(200).json({ URL: `${uploadedFile.Location}` });
  }

  async prepareGrossSalesCSV(
    noMovingSales: GrossSalesOutput[],
    sheetName: string,
    res: Response,
  ) {
    let modifiedStockItems = [];
    noMovingSales.forEach((noMoving) => {
      let modifyNoMoving = {
        Category: noMoving.cat[0],
        ItemName: noMoving.name[0],
        totalAmount: noMoving.totalAmount,
        date: noMoving.date,
      };

      modifiedStockItems.push(modifyNoMoving);
    });
    const csvData = csvjson.toCSV(modifiedStockItems, { headers: 'key' });
    //upload to s3
    const uploadedFile: any = await this.uploadsService.s3Upload(
      csvData,
      sheetName,
    );

    res.status(200).json({ URL: `${uploadedFile.Location}` });
  }

  async prepareDateComparison(
    sales
    , sheetName: string,
    res: Response,) {
    let modifiedItems = [], modifyitem, date1, date2;
    sales.forEach((items, index) => {
      const itemCompared = Object.values(items)
      itemCompared.forEach((item: ComparisonDTO[]) => {
        if (item.length == 1) {
          modifyitem = {
            'Cat': item[0].cat[0],
            'Item Name': item[0].name[0],
            'Date 1': item[0].totalAmount ? item[0].totalAmount : 0,
            'Date 2': item[0].totalAmount2 ? item[0].totalAmount2 : 0,
            Variance: 100
          };
        } else if (item.length == 2) {
          date1 = item[0].date
          date2 = item[1].date2
          modifyitem = {
            cat: item[0].cat[0],
            itemName: item[0].name[0],
            date1: item[0].totalAmount,
            date2: item[1].totalAmount2,
            variance: item[0].totalAmount - item[1].totalAmount2
          };
        }
        console.log("modifyitem", modifyitem);

        modifiedItems.push(modifyitem);
      })
    });
    const csvData = csvjson.toCSV(modifiedItems, { headers: 'key' });
    //upload to s3
    const uploadedFile: any = await this.uploadsService.s3Upload(
      csvData,
      sheetName,
    );

    res.status(200).json({ URL: `${uploadedFile.Location}` });
    // return modifiedItems
  }
  async prepareAvgBasketSizeCSV(
    noMovingSales: AvgBasketSizeOutput[],
    sheetName: string,
    res: Response,
  ) {
    let modifiedStockItems = [];
    noMovingSales.forEach((noMoving) => {
      let modifyNoMoving = {
        Qty: noMoving.count,
        avg: noMoving.avg,
      };

      modifiedStockItems.push(modifyNoMoving);
    });
    const csvData = csvjson.toCSV(modifiedStockItems, { headers: 'key' });
    //upload to s3
    const uploadedFile: any = await this.uploadsService.s3Upload(
      csvData,
      sheetName,
    );

    res.status(200).json({ URL: `${uploadedFile.Location}` });
  }
  //end csv


  //
  async grossSales(aggregation) {
    aggregation.push(
      {
        $unwind: { path: '$items', preserveNullAndEmptyArrays: false },
      },
      {
        $group: {
          _id: '$items.stockItemId',
          item: { $first: '$items.stockItemId' },
          totalAmount: { $sum: "$totalPriceWithVatAndService" },
          date: { $push: '$createdAt' }
        },
      },
      {
        $unwind: { path: '$item', preserveNullAndEmptyArrays: false },
      },
      {
        // Get item data
        $lookup: {
          from: 'stockitems',
          localField: 'item',
          foreignField: '_id',
          as: 'item'
        },
      },
      {
        // Get item data
        $lookup: {
          from: 'stockcategories',
          localField: 'item.stockCategoryId',
          foreignField: '_id',
          as: 'stockcategory'
        },
      },
      {
        $project: {
          totalAmount: 1,
          date: { '$last': '$date' },
          cat: '$stockcategory.stockategoryName',
          name: '$item.nameLocalized.mainLanguage',
        }
      }

    )
  }

  async itemReport(
    options: ReportItemSalesOptions,
    entityId: Types.ObjectId,
    res: Response
  ) {
    let aggregation = [], firstDateSales = null, comparison = null, dailyChartData = null, topRecordsData = null, slowMovingData = null,
      noMovingData = null, grossSalesData = null, avgBasketSizeData = null, itemDiscountData = null;


    const { filterBy, filterPeriod, dailyChart, filterByDateFrom, filterByDateTo, topRecords, noMoving, slowMoving,
      // grossSales,avgBasketSize,sectionGrossSales,comparisonByPeriod } = options;
      grossSales, avgBasketSize, comparisonByPeriod } = options;

    if (filterBy?.length) {
      this.orderService.filter(aggregation, filterBy);
    }

    aggregation.push({ $match: { entityId } });

    if (filterPeriod) {
      this.orderService.filterByPeriod(aggregation, filterPeriod);

    }

    if (comparisonByPeriod) {
      let aggregation = []
      if (entityId) {
        aggregation.push({ $match: { entityId } });
      }
      if (comparisonByPeriod.comparingPeriod == ComparisonEnum.DTD) {
        let filter: Period = {
          date: comparisonByPeriod.date,
          period: PeriodEnum.TODAY
        }
        let filterToCompare: Period = {
          date: comparisonByPeriod.dateToCompare,
          period: PeriodEnum.TODAY
        }
        this.orderService.filterByPeriod(aggregation, filter);
        this.grossSales(aggregation)
        firstDateSales = await this.orderService.m.aggregate(aggregation);
        aggregation = []
        this.orderService.filterByPeriod(aggregation, filterToCompare);
        this.grossSales(aggregation)
      }
      else if (comparisonByPeriod.comparingPeriod == ComparisonEnum.WTW) {
        let filter: Period = {
          date: comparisonByPeriod.date,
          period: PeriodEnum.WTD
        }
        let filterToCompare: Period = {
          date: comparisonByPeriod.dateToCompare,
          period: PeriodEnum.WTD
        }
        this.orderService.filterByPeriod(aggregation, filter);
        this.grossSales(aggregation)
        firstDateSales = await this.orderService.m.aggregate(aggregation);
        aggregation = []
        this.orderService.filterByPeriod(aggregation, filterToCompare);
        this.grossSales(aggregation)
      }
      else if (comparisonByPeriod.comparingPeriod == ComparisonEnum.MTM) {
        let filter: Period = {
          date: comparisonByPeriod.date,
          period: PeriodEnum.MTD
        }
        let filterToCompare: Period = {
          date: comparisonByPeriod.dateToCompare,
          period: PeriodEnum.MTD
        }
        this.orderService.filterByPeriod(aggregation, filter);
        this.grossSales(aggregation)
        firstDateSales = await this.orderService.m.aggregate(aggregation);
        aggregation = []
        this.orderService.filterByPeriod(aggregation, filterToCompare);
        this.grossSales(aggregation)
      } else if (comparisonByPeriod.comparingPeriod == ComparisonEnum.YTY) {
        let filter: Period = {
          date: comparisonByPeriod.date,
          period: PeriodEnum.YTD
        }
        let filterToCompare: Period = {
          date: comparisonByPeriod.dateToCompare,
          period: PeriodEnum.YTD
        }
        this.orderService.filterByPeriod(aggregation, filter);
        this.grossSales(aggregation)
        firstDateSales = await this.orderService.m.aggregate(aggregation);
        aggregation = []
        this.orderService.filterByPeriod(aggregation, filterToCompare);
        this.grossSales(aggregation)
      }
      const sales = await this.orderService.m.aggregate(aggregation);
      let updatedSales = []
      for (const filter of firstDateSales) {
        filter['date2'] = filter['date']; delete filter['date']
        filter['totalAmount2'] = filter['totalAmount']; delete filter['totalAmount']
        updatedSales.push(filter);
      }
      let comparedItems: ComparisonDTO[] = [...sales, ...updatedSales]
      let groupedArray = []
      const groupById = comparedItems.reduce((group, item) => {
        const { _id } = item;
        group[_id] = group[_id] ?? [];
        group[_id].push(item);
        console.log("group", group);

        return group;
      }, {});
      groupedArray.push(groupById)
      comparison = await this.prepareDateComparison(groupedArray, 'sheet.csv', res);
    }
    if (dailyChart) {
      this.orderService.dailyChartForMonth(aggregation, dailyChart)
    }
    if (filterByDateFrom && filterByDateTo) {
      this.orderService.customPeriod(aggregation, filterByDateFrom, filterByDateTo);

    }
    if (topRecords) {
      aggregation.push(
        {
          $unwind: { path: '$items', preserveNullAndEmptyArrays: false },
        },
        {
          $group: {
            _id: '$items.stockItemId',
            item: { $first: '$items.stockItemId' }, //$first accumulator
            value: { $sum: "$totalPriceWithVatAndService" },
            count: { $sum: 1 },
          },
        },
        {
          // Get item data
          $lookup: { from: 'stockitems', localField: 'item', foreignField: '_id', as: 'stockitem' },
        },
        {
          $unwind: { path: '$stockitem', preserveNullAndEmptyArrays: false },
        }, {
        // Get item data
        $lookup: { from: 'stockcategories', localField: 'stockitem.stockCategoryId', foreignField: '_id', as: 'stockcategory' },
      },
        {
          $unwind: { path: '$stockcategory', preserveNullAndEmptyArrays: false },
        },
        { $sort: { count: -1 } },
        { $project: { cat: '$stockcategory.stockategoryName', count: 1, name: '$stockitem.nameLocalized.mainLanguage', value: 1 } },
      )

    }

    if (slowMoving) {
      aggregation.push(
        {
          $unwind: { path: '$items', preserveNullAndEmptyArrays: false },
        },
        {
          $group: {
            _id: '$items.stockItemId',
            item: { $first: '$items.stockItemId' }, //$first accumulator
            // content: { $push: '$$ROOT' },
            count: { $sum: 1 },
          },
        },
        {
          // Get item data
          $lookup: { from: 'stockitems', localField: 'item', foreignField: '_id', as: 'stockitem' },
        },
        {
          $unwind: { path: '$stockitem', preserveNullAndEmptyArrays: false },
        },
        {
          $lookup: { from: 'stockcategories', localField: 'stockitem.stockCategoryId', foreignField: '_id', as: 'stockcategory' },
        },
        {
          $unwind: { path: '$stockcategory', preserveNullAndEmptyArrays: false },
        },

        //{ $sort: { count: -1 } },
        {
          $set: {
            slowMoving: {
              $cond: {
                if: { $gt: ['$stockitem.expectedMonthlyQtySold', '$count'] },
                then: true,
                else: false,
              },
            },
          },
        },
        { $match: { slowMoving: true } },
        {
          $project: {
            cat: '$stockcategory.stockategoryName', name: '$stockitem.nameLocalized.mainLanguage', slowMoving: 1, expectedMonthlyQtySold: '$stockitem.expectedMonthlyQtySold'
            , actualMonthlyQtySold: '$count'
          }
        },

      )
    }
    if (noMoving) {
      aggregation.push(
        {
          $unwind: { path: '$items', preserveNullAndEmptyArrays: false },
        },
        {
          $group: {
            _id: '$items.stockItemId',
            item: { $first: '$items.stockItemId' }, //$first accumulator
            content: { $push: '$$ROOT' },
          },
        },

        {
          $project: {
            content: { '$last': '$content' },
            item: 1, _id: 1
          }
        },
        {
          // Get item data
          $lookup: { from: 'stockitems', localField: 'item', foreignField: '_id', as: 'stockitem' },
        },
        {
          $unwind: { path: '$stockitem', preserveNullAndEmptyArrays: false },
        },
        {
          $lookup: { from: 'stockcategories', localField: 'stockitem.stockCategoryId', foreignField: '_id', as: 'stockcategory' },
        },
        {
          $unwind: { path: '$stockcategory', preserveNullAndEmptyArrays: false },
        },
        {
          $set: {
            diffDays: {
              $dateDiff: {
                startDate: '$content.createdAt',
                endDate: new Date(),
                unit: "day",
              }
            },
            noMove: {
              $cond: {
                if: { $gte: ['$stockitem.noMoving', '$diffDays'] },
                then: true,
                else: false,
              },
            },
          },
        },
        { $match: { noMove: true } },
        {
          $project: {
            cat: '$stockcategory.stockategoryName', name: '$stockitem.nameLocalized.mainLanguage', lastTransaction: '$content.createdAt', noMovingDays: '$stockitem.slowMoving'
            , _id: 0
          }
        },
      )
    }
    if (grossSales) {

      this.grossSales(aggregation)
    }
    if (avgBasketSize) {
      aggregation.push(
        {
          $group: {
            _id: '$customerId',
            //content:{$push:'$$ROOT'},
            count: { $sum: 1 },
            totalAmount: { $sum: "$totalPriceWithVatAndService" },
          },
        },
        {
          $project: {
            count: 1, avg: { $divide: ["$totalAmount", "$count"] }, _id: 1
          }
        })
    }
    // if (sectionGrossSales) {

    // }
    if (filterPeriod && !filterBy?.length && !topRecords && !slowMoving && !noMoving && !grossSales && !avgBasketSize ||
      filterByDateFrom && filterByDateTo && !filterBy?.length && !topRecords && !slowMoving && !noMoving && !grossSales && !avgBasketSize) {
      aggregation.push({
        $group: {
          _id: null,
          //item: { $first: '$items.itemId' }, //$first accumulator
          count: { $sum: 1 },
        },
      }, {
        $project: { _id: 0 }
      })
    }
    const sales = await this.orderService.m.aggregate(aggregation);
    if (firstDateSales) {
      let updatedSales = []
      //   for (const filter of firstDateSales) {
      //     delete Object.assign(filter, { ['date']: filter['date2'] })['date2'
      //     ];
      //     if (!isEmpty(filter)) updatedSales.push(filter);
      //   }
      //   console.log(updatedSales)
      let comparedItems = [...sales, ...updatedSales]
      let result = [];

      // comparedItems.forEach(function (a) {
      //   if (!this[a._id]) {
      //     this[a._id] = { _id: a._id, name: a.name,date:a.date,amount:a.total,variance: 100};
      //     result.push(this[a._id]);
      //   }
      //   this[a._id].variance = a.total - a.total;
      // }, Object.create(null));
      return comparedItems
    } else
      if (noMoving) {
        console.log(sales)
        this.prepareNoMovingCSV(sales, "no-moving.csv", res)
      }
      else if (slowMoving) {
        console.log(sales)
        this.prepareSlowMovingCSV(sales, "slow-moving.csv", res)
      } else if (topRecords) {
        console.log(sales)
        this.prepareTopRecordsCSV(sales, "top-records.csv", res)
      } else if (avgBasketSize) {
        console.log(sales)
        this.prepareAvgBasketSizeCSV(sales, "avg-basket-size.csv", res)
      } else if (grossSales) {
        console.log(sales)
        this.prepareGrossSalesCSV(sales, "gross-sales.csv", res)
      }

      else {
        if (sales.length > 0) {
          return res.status(200).send({ data: sales })
        }
        else {
          return res.status(200).send({
            data:
            {
              count: 0
            }
          })
        }

      }
  }
  async addTransactionReport(
    options: DateFilter,
    entityId?: Types.ObjectId,

  ): Promise<any[]> {
    let count = 0;
    const aggregation = [];

    const { filterBy, filterPeriod, filterByDateFrom, filterByDateTo } = options;
    // if (entityId) {
    aggregation.push({ $match: { entityId } });
    // }
    if (filterBy?.length) {
      this.addTransactionService.filter(aggregation, filterBy);
    }

    if (filterPeriod) {

      this.addTransactionService.filterByPeriod(aggregation, filterPeriod);

    }
    if (filterByDateFrom && filterByDateTo) {
      this.addTransactionService.customPeriod(aggregation, filterByDateFrom, filterByDateTo);
    }
    if (!filterBy.length) {
      aggregation.push(
        {
          $group: {
            _id: null,
            //item: { $first: '$items.itemId' }, //$first accumulator
            count: { $sum: 1 },
          },
        }, {
        $project: { _id: 0 }
      })
    }

    const result = await this.addTransactionService.m.aggregate(aggregation);

    if (result.length > 0) {
      return result;
    }
    else {
      return [{ count: 0 }];
    }

  }
  async auditTransactionReport(
    options: DateFilter,
    entityId?: Types.ObjectId,

  ): Promise<any[]> {
    const aggregation = [];

    const { filterBy, filterPeriod, filterByDateFrom, filterByDateTo } = options;
    aggregation.push({ $match: { entityId } })

    if (filterBy?.length) {
      this.auditTransactionService.filter(aggregation, filterBy);
    }

    if (filterPeriod) {
      this.auditTransactionService.filterByPeriod(aggregation, filterPeriod)
    }
    if (filterByDateFrom && filterByDateTo) {
      this.auditTransactionService.customPeriod(aggregation, filterByDateFrom, filterByDateTo)
    }
    if (!filterBy.length) {
      aggregation.push({
        $group: {
          _id: null,
          //item: { $first: '$items.itemId' }, //$first accumulator
          count: { $sum: 1 },
        },
      }, {
        $project: { _id: 0 }
      })
    }
    const result = await this.auditTransactionService.m.aggregate(aggregation);
    if (result.length > 0) {
      return result;
    }
    else {
      return [{ count: 0 }];
    }
  }
  async releaseTransactionReport(
    options: ReportItemSalesOptions,
    entityId: Types.ObjectId,
    res: Response
  ) {
    const aggregation = [];

    const { filterBy, filterPeriod, dailyChart, filterByDateFrom, filterByDateTo, grossSales, noMoving, slowMoving, topRecords } = options;


    aggregation.push({ $match: { entityId } });

    if (filterBy?.length) {
      this.releaseTransactionsService.filter(aggregation, filterBy);
    }

    if (filterPeriod) {
      this.releaseTransactionsService.filterByPeriod(aggregation, filterPeriod)

    }
    if (dailyChart) {
      this.releaseTransactionsService.dailyChartForMonth(aggregation, dailyChart)
    }
    if (filterByDateFrom && filterByDateTo) {
      this.releaseTransactionsService.customPeriod(aggregation, filterByDateFrom, filterByDateTo)

    }
    if (topRecords) {
      aggregation.push(
        {
          $unwind: { path: '$items', preserveNullAndEmptyArrays: false },
        },
        {
          $group: {
            _id: '$items.stockItemId',
            item: { $first: '$items.stockItemId' }, //$first accumulator
            // content: { $push: '$$ROOT' },
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
        { $sort: { count: -1 } },
        { $project: { _id: 1, count: 1, name: '$item.nameLocalized' } },
      )
    }
    if (slowMoving) {
      aggregation.push(
        {
          $unwind: { path: '$items', preserveNullAndEmptyArrays: false },
        },
        {
          $group: {
            _id: '$items.stockItemId',
            item: { $first: '$items.stockItemId' }, //$first accumulator
            // content: { $push: '$$ROOT' },
            count: { $sum: 1 },
          },
        },
        {
          // Get item data
          $lookup: { from: 'stockitems', localField: 'item', foreignField: '_id', as: 'stockitem' },
        },
        {
          $unwind: { path: '$stockitem', preserveNullAndEmptyArrays: false },
        }, {
        // Get item data
        $lookup: { from: 'stockcategories', localField: 'stockitem.stockCategoryId', foreignField: '_id', as: 'stockcategory' },
      },
        {
          $unwind: { path: '$stockcategory', preserveNullAndEmptyArrays: false },
        },

        //{ $sort: { count: -1 } },
        {
          $set: {
            slowMoving: {
              $cond: {
                if: { $gt: ['$stockitem.expectedMonthlyQtySold', '$count'] },
                then: true,
                else: false,
              },
            },
          },
        },
        { $match: { slowMoving: true } },
        {
          $project: {
            cat: '$stockcategory.stockategoryName', name: '$stockitem.nameLocalized.mainLanguage', slowMoving: 1, 'Expected Monthly Qty Sold': '$item.expectedMonthlySold'
            , 'Actual Monthly Qty Sold': '$count'
          }
        },

      )
    }
    if (noMoving) {
      aggregation.push(
        {
          $unwind: { path: '$items', preserveNullAndEmptyArrays: false },
        },
        {
          $group: {
            _id: '$items.stockItemId',
            item: { $first: '$items.stockItemId' }, //$first accumulator
            content: { $push: '$$ROOT' },
          },
        },

        {
          $project: {
            content: { '$last': '$content' },
            item: 1, _id: 1
          }
        }, {
        // Get item data
        $lookup: { from: 'stockitems', localField: 'item', foreignField: '_id', as: 'stockitem' },
      },
        {
          $unwind: { path: '$stockitem', preserveNullAndEmptyArrays: false },
        }, {
        // Get item data
        $lookup: { from: 'stockcategories', localField: 'stockitem.stockCategoryId', foreignField: '_id', as: 'stockcategory' },
      },
        {
          $unwind: { path: '$stockcategory', preserveNullAndEmptyArrays: false },
        },
        {
          $set: {
            diffDays: {
              $dateDiff: {
                startDate: '$content.createdAt',
                endDate: new Date(),
                unit: "day",
              }
            },
            noMoving: {
              $cond: {
                if: { $gte: ['$stockitem.slowMoving', '$diffDays'] },
                then: true,
                else: false,
              },
            },
          },
        },
        { $match: { noMoving: true } },
        {
          $project: {
            cat: '$stockcategory.stockategoryName', name: '$stockitem.nameLocalized.mainLanguage', noMoving: 1, noMovingDays: '$stockitem.slowMoving'
            , lastTransaction: '$content.createdAt'
          }
        },
      )
    }
    if (grossSales) {
      aggregation.push(
        {
          $unwind: { path: '$items', preserveNullAndEmptyArrays: false },
        },
        {
          $group: {
            _id: '$items.stockItemId',
            item: { $first: '$items.stockItemId' }, //$first accumulator
            qty: { $sum: '$items.qty' },
            price: { $sum: '$items.price' }
          },
        },
        {
          // Get item data
          $lookup: { from: 'stockitems', localField: 'item', foreignField: '_id', as: 'stockitem' },
        },
        {
          $unwind: { path: '$stockitem', preserveNullAndEmptyArrays: false },
        }, {
        // Get item data
        $lookup: { from: 'stockcategories', localField: 'stockitem.stockCategoryId', foreignField: '_id', as: 'stockcategory' },
      },
        {
          $unwind: { path: '$stockcategory', preserveNullAndEmptyArrays: false },
        },

        {
          $project: {
            cat: '$stockcategory.stockategoryName', name: '$stockitem.nameLocalized.mainLanguage', qty: 1, price: 1
          }
        }

      )
    }
    if (filterPeriod && !filterBy?.length && !topRecords && !slowMoving && !noMoving && !grossSales ||
      filterByDateFrom && filterByDateTo && !filterBy?.length && !topRecords && !slowMoving && !noMoving && !grossSales) {
      aggregation.push({
        $group: {
          _id: null,
          //item: { $first: '$items.itemId' }, //$first accumulator
          count: { $sum: 1 },
        },
      }, {
        $project: { _id: 0 }
      })
    }
    const items = await this.releaseTransactionsService.m.aggregate(aggregation);
    if (noMoving) {
      this.prepareNoMovingCSV(items, "no-moving.csv", res)
    } else if (slowMoving) {
      this.prepareSlowMovingCSV(items, "slow-moving.csv", res)
    }
    else if (topRecords) {
      this.prepareTopRecordsCSV(items, "top-records.csv", res)
    }
    // else if(avgB){
    //   this.prepareAvgBasketSizeCSV(items, "slow-moving.csv", res)
    // }
    if (items.length > 0) {
      res.status(200).json({ data: items });
    }
    else {
      res.status(200).json({ data: [{ count: 0 }] });
    }
  }
  async reverseTransactionReport(
    options: DateFilter,
    entityId?: Types.ObjectId,

  ): Promise<any[]> {
    const aggregation = [];

    const { filterBy, filterPeriod, filterByDateFrom, filterByDateTo } = options;
    aggregation.push({ $match: { entityId } })

    if (filterBy?.length) {
      this.reverseTransactionService.filter(aggregation, filterBy);
    }

    if (filterPeriod) {
      this.reverseTransactionService.filterByPeriod(aggregation, filterPeriod);
    }
    if (filterByDateFrom && filterByDateTo) {
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
    }
    if (!filterBy.length) {
      aggregation.push({
        $group: {
          _id: null,
          //item: { $first: '$items.itemId' }, //$first accumulator
          count: { $sum: 1 },
        },
      }, {
        $project: { _id: 0 }
      })
    }
    const result = await this.reverseTransactionService.m.aggregate(aggregation);
    if (result.length > 0) {
      return result;
    }
    else {
      return [{ count: 0 }];
    }
  }
  async shrinkageTransactionReport(
    options: DateFilter,
    entityId?: Types.ObjectId,

  ): Promise<any[]> {
    const aggregation = [];

    const { filterBy, filterPeriod, filterByDateFrom, filterByDateTo } = options;
    aggregation.push({ $match: { entityId } })

    if (filterBy?.length) {
      this.shrinkageTransactionService.filter(aggregation, filterBy);
    }

    if (filterPeriod) {
      this.shrinkageTransactionService.filterByPeriod(aggregation, filterPeriod)
    }
    if (filterByDateFrom && filterByDateTo) {
      this.shrinkageTransactionService.customPeriod(aggregation, filterByDateFrom, filterByDateTo)
    }
    if (!filterBy.length) {
      aggregation.push({
        $group: {
          _id: null,
          //item: { $first: '$items.itemId' }, //$first accumulator
          count: { $sum: 1 },
        },
      }, {
        $project: { _id: 0 }
      })
    }
    const result = await this.shrinkageTransactionService.m.aggregate(aggregation);
    if (result.length > 0) {
      return result;
    }
    else {
      return [{ count: 0 }];
    }
  }

  async wasteTransactionReport(
    options: DateFilter,
    entityId?: Types.ObjectId,

  ): Promise<any[]> {
    const aggregation = [];

    const { filterBy, filterPeriod, filterByDateFrom, filterByDateTo } = options;
    aggregation.push({ $match: { entityId } })

    if (filterBy?.length) {
      this.wasteTransactionService.filter(aggregation, filterBy);
    }

    if (filterPeriod) {
      this.wasteTransactionService.filterByPeriod(aggregation, filterPeriod)
    }
    if (filterByDateFrom && filterByDateTo) {
      this.wasteTransactionService.customPeriod(aggregation, filterByDateFrom, filterByDateTo);
    }
    if (!filterBy.length) {
      aggregation.push({
        $group: {
          _id: null,
          //item: { $first: '$items.itemId' }, //$first accumulator
          count: { $sum: 1 },
        },
      }, {
        $project: { _id: 0 }
      })
    }
    const result = await this.wasteTransactionService.m.aggregate(aggregation);
    if (result.length > 0) {
      return result;
    }
    else {
      return [{ count: 0 }];
    }
  }


  async deferredPayableReport(
    options: DateFilter,
    owner?: Types.ObjectId,

  ): Promise<any[]> {
    const aggregation = [];

    const { filterBy, filterPeriod, filterByDateFrom, filterByDateTo } = options;

    aggregation.push({ $match: { owner } })

    if (filterBy?.length) {
      this.deferredPayableService.filter(aggregation, filterBy);
    }

    if (filterPeriod) {
      this.deferredPayableService.filterByPeriod(aggregation, filterPeriod);

    }
    if (filterByDateFrom && filterByDateTo) {
      this.deferredPayableService.customPeriod(aggregation, filterByDateFrom, filterByDateTo);

    }
    if (!filterBy.length) {
      aggregation.push({
        $group: {
          _id: null,
          //item: { $first: '$items.itemId' }, //$first accumulator
          count: { $sum: 1 },
        },
      })
    }
    const result = await this.deferredPayableService.m.aggregate(aggregation);
    if (result.length > 0) {
      return result;
    }
    else {
      return [{ count: 0 }];
    }
  }
  async deferredReceivableReport(
    options: DateFilter,
    owner?: Types.ObjectId,

  ): Promise<any[]> {
    const aggregation = [];

    const { filterBy, filterPeriod, filterByDateFrom, filterByDateTo } = options;
    aggregation.push({ $match: { owner } })

    if (filterBy?.length) {
      this.deferredRecievableService.filter(aggregation, filterBy);
    }

    if (filterPeriod) {
      this.deferredRecievableService.filterByPeriod(aggregation, filterPeriod)
    }
    if (filterByDateFrom && filterByDateTo) {
      this.deferredRecievableService.customPeriod(aggregation, filterByDateFrom, filterByDateTo);
    }
    if (!filterBy.length) {
      aggregation.push({
        $group: {
          _id: null,
          //item: { $first: '$items.itemId' }, //$first accumulator
          count: { $sum: 1 },
        },
      })
    }
    const result = await this.deferredRecievableService.m.aggregate(aggregation);
    if (result.length > 0) {
      return result;
    }
    else {
      return [{ count: 0 }];
    }
  }
  async payableReport(
    options: DateFilter,
    owner?: Types.ObjectId,

  ): Promise<any[]> {
    const aggregation = [];

    const { filterBy, filterPeriod, filterByDateFrom, filterByDateTo } = options;
    aggregation.push({ $match: { owner } })

    if (filterBy?.length) {
      this.payableService.filter(aggregation, filterBy);
    }

    if (filterPeriod) {
      this.payableService.filterByPeriod(aggregation, filterPeriod);
    }
    if (filterByDateFrom && filterByDateTo) {
      this.payableService.customPeriod(aggregation, filterByDateFrom, filterByDateTo);
    }
    if (!filterBy.length) {
      aggregation.push({
        $group: {
          _id: null,
          //item: { $first: '$items.itemId' }, //$first accumulator
          count: { $sum: 1 },
        },
      })
    }
    const result = await this.payableService.m.aggregate(aggregation);
    if (result.length > 0) {
      return result;
    }
    else {
      return [{ count: 0 }];
    }
  }
  async receivableReport(
    options: DateFilter,
    owner?: Types.ObjectId,

  ): Promise<any[]> {
    const aggregation = [];

    const { filterBy, filterPeriod, filterByDateFrom, filterByDateTo } = options;
    aggregation.push({ $match: { owner } })

    if (filterBy?.length) {
      this.recievableService.filter(aggregation, filterBy);
    }


    if (filterPeriod) {
      this.recievableService.filterByPeriod(aggregation, filterPeriod);
    }
    if (filterByDateFrom && filterByDateTo) {
      this.recievableService.customPeriod(aggregation, filterByDateFrom, filterByDateTo);
    }
    if (!filterBy.length) {
      aggregation.push({
        $group: {
          _id: null,
          //item: { $first: '$items.itemId' }, //$first accumulator
          count: { $sum: 1 },
        },
      })
    }
    const result = await this.recievableService.m.aggregate(aggregation);
    if (result.length > 0) {
      return result;
    }
    else {
      return [{ count: 0 }];
    }
  }
  async purchaceOrderReport(
    options: DateFilter,
    restaurantId?: Types.ObjectId,
    warehouseId?: string,
  ): Promise<any[]> {
    const aggregation = [];

    const { filterBy, filterPeriod, filterByDateFrom, filterByDateTo } = options;

    if (filterBy?.length) {
      this.purchaseOrderService.filter(aggregation, filterBy);
    }

    if (filterPeriod) {
      this.purchaseOrderService.filterByPeriod(aggregation, filterPeriod);
    }
    if (filterByDateFrom && filterByDateTo) {
      this.purchaseOrderService.customPeriod(aggregation, filterByDateFrom, filterByDateTo);
    }
    if (!filterBy.length) {
      aggregation.push({
        $group: {
          _id: null,
          //item: { $first: '$items.itemId' }, //$first accumulator
          count: { $sum: 1 },
        },
      })
    }
    return await this.purchaseOrderService.m.aggregate(aggregation);
  }
  async todayBudgetToTarget(req: RequestWithUser) {
    let totalOrder = 0;
    let totalOrders = 0;
    let dailyBudget;
    let percentage;
    let itemName;
    let ItemData = {};
    let ItemsData = [];

    const todayOrders = await this.orderService.find({
      orderStatus: OrderStatusEnum.ACTIVE,
      createdAt: {
        $gt: new Date(Date.now() - 1).toLocaleDateString(),
        $lte: new Date(Date.now()),
      }
    });
    for (const order in todayOrders) {
      const itemOrders = todayOrders[order].items;
      for (const itemOrder in itemOrders) {
        totalOrder += itemOrders[itemOrder].totalUnitPrice;
        console.log("totalOrders", totalOrders);

        const items = await this.stockItemDataService.find({ _id: itemOrders[itemOrder].stockItemId })

        for (const item in items) {
          itemName = items[item].nameLocalized;

          dailyBudget = items[item].dailyBudget;
          const itemsWarehoseData = await this.warehouseStockItems.find({ _id: items[item].warehouseStockItemsData })
          console.log("itemsWarehoseData", itemsWarehoseData);

          for (const data in itemsWarehoseData) {
            console.log("itemsWarehoseData[data]", itemsWarehoseData[data]);

            // dailyBudget = itemsWarehoseData[data].dailyBudget;


          }
          totalOrders += totalOrder;
          percentage = dailyBudget / totalOrders;

          ItemData = {
            "Item Name": itemName,
            "Total Order": totalOrders,
            "Daily Budget": dailyBudget,
            "Daily (Budget / Target)": percentage
          }

          ItemsData.push(ItemData)



        }
      }
    }
    const entityExist = await (await this.entitiesService.findOne({ owner: this.toObjectId(req.user._id) }));
    if (!entityExist) throw new NotFoundException('055,R055');
    const warehouseExist = await (await this.warehouseService.findOne({ _id: this.toObjectId(req.user.warehouseId) }));


    return {
      "Business Name ": entityExist.name,
      "Warehouse": warehouseExist.name,
      "items": ItemsData
    };

  }

  //1. No moving items Report
  // async noMovingItems(req: RequestWithUser) {
  //     //category
  //     //items under category
  //     //slow moving
  //     //last release transactions

  //     const categories = await this.stockCategoryService.find({ entityId: req.user.entityId });
  //     for (const category in categories) {
  //         const stockItems = await this.stockItemDataService.find({ stockCategoryId: categories[category]._id });

  //     }

  // }

  // // Page2  3. Slow moving items Report
  // async slowMovingItemsInSpecificMonth(req: RequestWithUser) {

  // }

  // 4. Top 10 service sold (Value) (MTD | YTD)
  async TopServiceSold(req: RequestWithUser, dto: ReportDto) {
    let aggregation = [];

    //item waste
    aggregation.push(
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
                    $gte: dto.filterByDateFrom,
                    $lte: dto.filterByDateTo,
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
      { $match: { entityId: { $eq: req.user.entityId } } },
      {
        $unwind: { path: '$services', preserveNullAndEmptyArrays: false },
      },

      {
        $group: {
          _id: '$services.serviceId',
          count: { $sum: 1 },
          totalPrice: { $sum: '$services.totalUnitPrice' },
          service: { $first: '$services.serviceId' },
        }
      },
      {
        $unwind: { path: '$service', preserveNullAndEmptyArrays: false },
      },
      {
        // Get item data
        $lookup: {
          from: 'services',
          localField: 'service',
          foreignField: '_id',
          as: 'service'
        },
      },
      { $sort: { count: -1 } },
      {
        $project: {
          count: 1,
          totalPrice: 1,
          name: '$service.name',
        }
      },
    );


    let topService = await this.orderService.m.aggregate(aggregation);
    console.log("topService", topService);


    let modifiedSubscriptions = [];
    topService.forEach((data) => {
      let modifiedSubscription = {
        'service name': data.name[0],
        'total price': data.totalPrice,
      }
      console.log("modifiedSubscription", modifiedSubscription);
      modifiedSubscriptions.push(modifiedSubscription);
    })
    console.log("modifiedSubscriptions", modifiedSubscriptions);

    const csvData = csvjson.toCSV(modifiedSubscriptions, { headers: 'key' });
    //upload to s3
    const uploadedFile: any = await this.uploadsService.s3Upload(
      csvData,
      'topService.csv',
    );
    return { "URL": uploadedFile.Location }

  }


  async customerCountInSection(req: RequestWithUser, dto: ReportDto, res: Response) {

    let aggregation = [];
    const AllCustomers = await this.customerService.count({
      owner: this.toObjectId(req.user._id)

    });
    aggregation.push(
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
                    $gte: dto.filterByDateFrom,
                    $lte: dto.filterByDateTo,
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
      { $match: { entityId: { $eq: req.user.entityId } } },
      {
        $unwind: { path: '$items', preserveNullAndEmptyArrays: false },
      },
      {
        $group: {
          _id: {

            'customerId': '$customerId'
          },
          count: { $sum: 1 },
          item: { $first: '$items.stockItemId' },
          date: { $push: '$createdAt' }


        }
      },
      {
        $unwind: { path: '$item', preserveNullAndEmptyArrays: false },
      },
      {
        // Get item data
        $lookup: {
          from: 'stockitems',
          localField: 'item',
          foreignField: '_id',
          as: 'item'
        },
      },
      {
        // Get item data
        $lookup: {
          from: 'stockcategories',
          localField: 'item.stockCategoryId',
          foreignField: '_id',
          as: 'stockcategory'
        },
      },
      { $match: { 'stockcategory.section': { $eq: true } } },

      {
        $group: {
          _id: {

            'stockategoryName': '$stockcategory.stockategoryName'
          },
          customerCount: { $sum: 1 },
        }
      },
      {
        $addFields: {
          AllCustomersCount: AllCustomers
        }
      },
      {
        $project: {
          cat: '$_id.stockategoryName',
          customerCount: 1,
          AllCustomersCount: 1,
          totalCount: { $multiply: [{ $divide: ['$customerCount', '$AllCustomersCount'] }, 100] },
        }
      },
    );



    let ordersData = await this.orderService.m.aggregate(aggregation);
    console.log("ordersData", ordersData);

    return this.prepareCustomerCSV(ordersData, "section.csv", res);

  }
  async customerCountInDepartment(req: RequestWithUser, dto: ReportDto, res: Response) {

    let aggregation = [];
    const AllCustomers = await this.customerService.count({
      owner: this.toObjectId(req.user._id)

    });
    aggregation.push(
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
                    $gte: dto.filterByDateFrom,
                    $lte: dto.filterByDateTo,
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
      { $match: { entityId: { $eq: req.user.entityId } } },
      {
        $unwind: { path: '$items', preserveNullAndEmptyArrays: false },
      },
      {
        $group: {
          _id: {

            'customerId': '$customerId'
          },
          count: { $sum: 1 },
          item: { $first: '$items.stockItemId' },
          date: { $push: '$createdAt' }


        }
      },
      {
        $unwind: { path: '$item', preserveNullAndEmptyArrays: false },
      },
      {
        // Get item data
        $lookup: {
          from: 'stockitems',
          localField: 'item',
          foreignField: '_id',
          as: 'item'
        },
      },
      {
        // Get item data
        $lookup: {
          from: 'stockcategories',
          localField: 'item.stockCategoryId',
          foreignField: '_id',
          as: 'stockcategory'
        },
      },
      { $match: { 'stockcategory.department': { $eq: true } } },

      {
        $group: {
          _id: {

            'stockategoryName': '$stockcategory.stockategoryName'
          },
          customerCount: { $sum: 1 },
        }
      },
      {
        $addFields: {
          AllCustomersCount: AllCustomers
        }
      },
      {
        $project: {
          cat: '$_id.stockategoryName',
          customerCount: 1,
          AllCustomersCount: 1,
          totalCount: { $multiply: [{ $divide: ['$customerCount', '$AllCustomersCount'] }, 100] },
        }
      },
    );



    let ordersData = await this.orderService.m.aggregate(aggregation);
    console.log("ordersData", ordersData);

    return this.prepareCustomerCSV(ordersData, "department.csv", res);

  }



  //4 done

  async wastedItem(req: RequestWithUser, dto: ReportDto) {
    let aggregation = [];

    //item waste
    aggregation.push(
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
                    $gte: dto.filterByDateFrom,
                    $lte: dto.filterByDateTo,
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
      { $match: { entityId: { $eq: req.user.entityId } } },
      {
        $unwind: { path: '$items', preserveNullAndEmptyArrays: false },
      },

      {
        $group: {
          _id: '$items.stockItemId',
          count: { $sum: 1 },
          wasteQty: { $sum: '$items.wasteQty' },
          item: { $first: '$items.stockItemId' },
          date: { $push: '$createdAt' }


        }
      },
      {
        $unwind: { path: '$item', preserveNullAndEmptyArrays: false },
      },
      {
        // Get item data
        $lookup: {
          from: 'stockitems',
          localField: 'item',
          foreignField: '_id',
          as: 'item'
        },
      },

      {
        $lookup: {
          from: 'warehousestockitems',
          localField: 'item.warehouseStockItemsData',
          foreignField: '_id',
          as: 'warehousestockitem'
        },
      },

      {
        $project: {
          count: 1,
          wasteQty: 1,
          name: '$item.nameLocalized.mainLanguage',
          totalQty: '$warehousestockitem.qtyOnHand',
        }
      },
    );


    let wastedItemsData = await this.wasteTransactionService.m.aggregate(aggregation);
    console.log("wastedItemsData", wastedItemsData);


    let modifiedSubscriptions = [];
    wastedItemsData.forEach((data) => {
      let modifiedSubscription = {
        itemName: data.name[0],
        itemQty: data.totalQty[0],
        totalWaste: data.wasteQty,
        totalWasteOverItemQty: ((data.wasteQty / data.totalQty[0]) * 100).toFixed(0) + ' %'
      }
      console.log("modifiedSubscription", modifiedSubscription);
      modifiedSubscriptions.push(modifiedSubscription);
    })
    console.log("modifiedSubscriptions", modifiedSubscriptions);

    const csvData = csvjson.toCSV(modifiedSubscriptions, { headers: 'key' });
    //upload to s3
    const uploadedFile: any = await this.uploadsService.s3Upload(
      csvData,
      'waste.csv',
    );
    return { "URL": uploadedFile.Location }

  }



  //7 done
  async itemQtys(req: RequestWithUser, dto: ReportDto) {
    let itemId;
    let itemQty;
    let itemName;
    let items = [];
    let Item = {};


    const allItemsAtSpecificPeriod = await this.stockItemDataService.find({
      entityId: this.toObjectId(req.user.entityId),
      createdAt: {
        $gte: dto.filterByDateFrom,
        $lte: dto.filterByDateTo,
      }
    });

    console.log("allItemsAtSpecificPeriod", allItemsAtSpecificPeriod);

    for (const item in allItemsAtSpecificPeriod) {
      console.log("Stock Item Name", allItemsAtSpecificPeriod[item].nameLocalized);
      itemName = allItemsAtSpecificPeriod[item].nameLocalized.mainLanguage;
      console.log("itemName", itemName);


      let stockData = allItemsAtSpecificPeriod[item].warehouseStockItemsData;
      console.log("stockData", stockData);

      //  for(const data in stockData){
      const allWarehouseItemsAtSpecificPeriod = await this.warehouseStockItems.find({
        _id: stockData,
        createdAt: {
          $gte: dto.filterByDateFrom,
          $lte: dto.filterByDateTo,
        }
      });

      for (const item in allWarehouseItemsAtSpecificPeriod) {
        console.log("Total Add Quantities in specific period", allWarehouseItemsAtSpecificPeriod[item].qtyOnHand);
        itemQty = allWarehouseItemsAtSpecificPeriod[item].qtyOnHand;

        console.log("itemQty", itemQty);

        Item = {
          itemName: itemName,
          itemQty: itemQty
        }
        items.push(Item)


      }
    }


    const entityExist = await (await this.entitiesService.findOne({ owner: this.toObjectId(req.user._id) }));
    if (!entityExist) throw new NotFoundException('055,R055');
    const warehouseExist = await (await this.warehouseService.findOne({ _id: this.toObjectId(req.user.warehouseId) }));


    const result = {
      "Business Name ": entityExist.name,
      "Warehouse": warehouseExist.name,
      "period": {
        "From": dto.filterByDateFrom,
        "To": dto.filterByDateTo,
      },
      "items": items
    };

    let modifiedSubscriptions = [];
    items.forEach((data) => {
      let modifiedSubscription = {
        itemName: data.itemName,
        itemQty: data.itemQty
      }
      console.log("modifiedSubscription", modifiedSubscription);
      modifiedSubscriptions.push(modifiedSubscription);
    })
    console.log("modifiedSubscriptions", modifiedSubscriptions);

    const csvData = csvjson.toCSV(modifiedSubscriptions, { headers: 'key' });
    //upload to s3
    const uploadedFile: any = await this.uploadsService.s3Upload(
      csvData,
      'itemsQty.csv',
    );
    return { "URL": uploadedFile.Location }

  }

  //5 done
  async itemWithZeroQtys(req: RequestWithUser, dto: ReportDto) {
    let itemId;
    let itemQty;
    let itemName;
    let items = [];
    let Item = {};


    const allItemsAtSpecificPeriod = await this.stockItemDataService.find({
      entityId: this.toObjectId(req.user.entityId),
      createdAt: {
        $gte: dto.filterByDateFrom,
        $lte: dto.filterByDateTo,
      }
    });

    console.log("allItemsAtSpecificPeriod", allItemsAtSpecificPeriod);

    for (const item in allItemsAtSpecificPeriod) {
      console.log("Stock Item Name", allItemsAtSpecificPeriod[item].nameLocalized);
      itemName = allItemsAtSpecificPeriod[item].nameLocalized.mainLanguage;
      console.log("itemName", itemName);


      let stockData = allItemsAtSpecificPeriod[item].warehouseStockItemsData;
      console.log("stockData", stockData);

      //  for(const data in stockData){
      const allWarehouseItemsAtSpecificPeriod = await this.warehouseStockItems.find({
        _id: stockData,
        createdAt: {
          $gte: dto.filterByDateFrom,
          $lte: dto.filterByDateTo,
        }
      });

      for (const item in allWarehouseItemsAtSpecificPeriod) {
        console.log("Total Add Quantities in specific period", allWarehouseItemsAtSpecificPeriod[item].qtyOnHand);
        itemQty = allWarehouseItemsAtSpecificPeriod[item].qtyOnHand;
        if (itemQty == 0) {
          console.log("itemQty", itemQty);

          Item = {
            itemName: itemName,
            itemQty: itemQty
          }
          items.push(Item)


        }
      }
    }


    const entityExist = await (await this.entitiesService.findOne({ owner: this.toObjectId(req.user._id) }));
    if (!entityExist) throw new NotFoundException('055,R055');
    const warehouseExist = await (await this.warehouseService.findOne({ _id: this.toObjectId(req.user.warehouseId) }));


    const result = {
      "Business Name ": entityExist.name,
      "Warehouse": warehouseExist.name,
      "period": {
        "From": dto.filterByDateFrom,
        "To": dto.filterByDateTo,
      },
      "items": items
    };

    let modifiedSubscriptions = [];
    items.forEach((data) => {
      let modifiedSubscription = {
        itemName: data.itemName,
        itemQty: data.itemQty
      }
      console.log("modifiedSubscription", modifiedSubscription);
      modifiedSubscriptions.push(modifiedSubscription);
    })
    console.log("modifiedSubscriptions", modifiedSubscriptions);

    const csvData = csvjson.toCSV(modifiedSubscriptions, { headers: 'key' });
    //upload to s3
    const uploadedFile: any = await this.uploadsService.s3Upload(
      csvData,
      'zeroQtyItems.csv',
    );
    return { "URL": uploadedFile.Location }

  }


  //6 done
  async itemMarginReport(req: RequestWithUser, dto: ReportDto) {
    let itemId;
    let itemCode;
    let itemName;
    let itemCostPrice;
    let itemSellingPrice;
    let itemMargin = 0;
    let items = [];
    let Item = {};


    const allItemsAtSpecificPeriod = await this.stockItemDataService.find({
      entityId: this.toObjectId(req.user.entityId),
      createdAt: {
        $gte: dto.filterByDateFrom,
        $lte: dto.filterByDateTo,
      }
    });

    console.log("allItemsAtSpecificPeriod", allItemsAtSpecificPeriod);

    for (const item in allItemsAtSpecificPeriod) {
      console.log("Stock Item Name", allItemsAtSpecificPeriod[item].nameLocalized);
      itemName = allItemsAtSpecificPeriod[item].nameLocalized;
      itemCode = allItemsAtSpecificPeriod[item].stockItemCode;
      console.log("itemName", itemName, "stockItemCode", itemCode);


      let stockData = allItemsAtSpecificPeriod[item].warehouseStockItemsData;

      const allWarehouseItemsAtSpecificPeriod = await this.warehouseStockItems.find({
        _id: stockData,
        createdAt: {
          $gte: dto.filterByDateFrom,
          $lte: dto.filterByDateTo,
        }
      });

      for (const item in allWarehouseItemsAtSpecificPeriod) {
        console.log("Total Add Quantities in specific period", allWarehouseItemsAtSpecificPeriod[item].qtyOnHand);
        itemCostPrice = allWarehouseItemsAtSpecificPeriod[item].purchasePrice;
        itemSellingPrice = allWarehouseItemsAtSpecificPeriod[item].sellingPrice;
        itemMargin = itemSellingPrice - itemCostPrice;

        Item = {
          itemCode: itemCode,
          itemName: itemName,
          itemCostPrice: itemCostPrice,
          itemSellingPrice: itemSellingPrice,
          itemMargin: itemMargin,
        }
        items.push(Item)


      }
    }


    const entityExist = await (await this.entitiesService.findOne({ owner: this.toObjectId(req.user._id) }));
    if (!entityExist) throw new NotFoundException('055,R055');
    const warehouseExist = await (await this.warehouseService.findOne({ _id: this.toObjectId(req.user.warehouseId) }));


    const result = {
      "Business Name ": entityExist.name,
      "Warehouse": warehouseExist.name,
      "period": {
        "From": dto.filterByDateFrom,
        "To": dto.filterByDateTo,
      },
      "items": items
    };
    let modifiedSubscriptions = [];
    items.forEach((data) => {
      let modifiedSubscription = {
        itemCode: data.itemCode,
        itemName: data.itemName,
        itemCostPrice: data.itemCostPrice,
        itemSellingPrice: data.itemSellingPrice,
        itemMargin: data.itemMargin,
      }
      console.log("modifiedSubscription", modifiedSubscription);
      modifiedSubscriptions.push(modifiedSubscription);
    })
    console.log("modifiedSubscriptions", modifiedSubscriptions);

    const csvData = csvjson.toCSV(modifiedSubscriptions, { headers: 'key' });
    //upload to s3
    const uploadedFile: any = await this.uploadsService.s3Upload(
      csvData,
      'margin.csv',
    );
    return { "URL": uploadedFile.Location }

  }


  // 7-

  //8
  async payablesAndDeferredPayablesLists(req: RequestWithUser, dto: ReportDto) {
    let transactionId;
    let transactionType;
    let payable;
    let deferredPayable;
    let totalAmount = 0;
    let items = [];
    let Item = {};



    const allPayablesAtSpecificPeriod = await this.payableService.find({
      owner: this.toObjectId(req.user._id),
      createdAt: {
        $gte: dto.filterByDateFrom,
        $lte: dto.filterByDateTo,
      }
    });

    for (const payableItem in allPayablesAtSpecificPeriod) {


      const allDeferredPayablesAtSpecificPeriod = await this.deferredPayableService.find({
        transactionId: allPayablesAtSpecificPeriod[payableItem].transactionID
      });
      for (const deferredPayableItem in allDeferredPayablesAtSpecificPeriod) {


        transactionId = allPayablesAtSpecificPeriod[payableItem].transactionID;
        transactionType = allPayablesAtSpecificPeriod[payableItem].transactionType;
        payable = allPayablesAtSpecificPeriod[payableItem].payableAmount;
        deferredPayable = allDeferredPayablesAtSpecificPeriod[deferredPayableItem].deferredPayableAmount;
        totalAmount = payable + deferredPayable;

        Item = {
          transactionId: transactionId,
          transactionType: transactionType,
          totalAmount: totalAmount,
          payable: payable,
          deferredPayable: deferredPayable,

        }
        items.push(Item)

      }
    }
    const entityExist = await (await this.entitiesService.findOne({ owner: this.toObjectId(req.user._id) }));
    if (!entityExist) throw new NotFoundException('055,R055');
    const warehouseExist = await (await this.warehouseService.findOne({ _id: this.toObjectId(req.user.warehouseId) }));


    const result = {
      "Business Name ": entityExist.name,
      // "Warehouse": warehouseExist.name,
      "period": {
        "From": dto.filterByDateFrom,
        "To": dto.filterByDateTo,
      },
      "items": items
    };
    let modifiedSubscriptions = [];
    items.forEach((data) => {
      let modifiedSubscription = {
        transactionId: transactionId,
        transactionType: transactionType,
        totalAmount: totalAmount,
        payable: payable,
        deferredPayable: deferredPayable,
      }
      console.log("modifiedSubscription", modifiedSubscription);
      modifiedSubscriptions.push(modifiedSubscription);
    })
    console.log("modifiedSubscriptions", modifiedSubscriptions);

    const csvData = csvjson.toCSV(modifiedSubscriptions, { headers: 'key' });
    //upload to s3
    const uploadedFile: any = await this.uploadsService.s3Upload(
      csvData,
      'payable.csv',
    );
    return { "URL": uploadedFile.Location }
  }

  //9
  async recievablesAndDeferredrecievablesLists(req: RequestWithUser, dto: ReportDto) {
    let transactionId;
    let transactionType;
    let recievable;
    let deferredRecievable;
    let totalAmount = 0;
    let items = [];
    let Item = {};



    const allRecievablesAtSpecificPeriod = await this.recievableService.find({
      owner: this.toObjectId(req.user._id),
      createdAt: {
        $gte: dto.filterByDateFrom,
        $lte: dto.filterByDateTo,
      }
    });

    for (const recievableItem in allRecievablesAtSpecificPeriod) {


      const allDeferredRecievablesAtSpecificPeriod = await this.deferredRecievableService.find({
        transactionId: allRecievablesAtSpecificPeriod[recievableItem].transactionID
      });
      for (const deferredRecievableItem in allDeferredRecievablesAtSpecificPeriod) {


        transactionId = allRecievablesAtSpecificPeriod[recievableItem].transactionID;
        transactionType = allRecievablesAtSpecificPeriod[recievableItem].transactionType;
        recievable = allRecievablesAtSpecificPeriod[recievableItem].recievableAmount;
        deferredRecievable = allDeferredRecievablesAtSpecificPeriod[deferredRecievableItem].deferredRecievableAmount;
        totalAmount = recievable + deferredRecievable;

        Item = {
          transactionId: transactionId,
          transactionType: transactionType,
          totalAmount: totalAmount,
          recievable: recievable,
          deferredRecievable: deferredRecievable,

        }
        items.push(Item)

      }
    }

    const entityExist = await (await this.entitiesService.findOne({ owner: this.toObjectId(req.user._id) }));
    if (!entityExist) throw new NotFoundException('055,R055');
    const warehouseExist = await (await this.warehouseService.findOne({ _id: this.toObjectId(req.user.warehouseId) }));


    const result = {
      "Business Name ": entityExist.name,
      // "Warehouse": warehouseExist.name,
      "period": {
        "From": dto.filterByDateFrom,
        "To": dto.filterByDateTo,
      },
      "items": items
    };

    let modifiedSubscriptions = [];
    items.forEach((data) => {
      let modifiedSubscription = {
        transactionId: data.transactionId,
        transactionType: data.transactionType,
        totalAmount: data.totalAmount,
        recievable: data.recievable,
        deferredRecievable: data.deferredRecievable,

      }
      console.log("modifiedSubscription", modifiedSubscription);
      modifiedSubscriptions.push(modifiedSubscription);
    })
    console.log("modifiedSubscriptions", modifiedSubscriptions);

    const csvData = csvjson.toCSV(modifiedSubscriptions, { headers: 'key' });
    //upload to s3
    const uploadedFile: any = await this.uploadsService.s3Upload(
      csvData,
      'recievables.csv',
    );
    return { "URL": uploadedFile.Location }

  }

  //10 done

  async PrepareLogsSystemReport(
    logsData: LogsSystemDataOutput[],
    sheetName: string,
    res: Response
  ) {

    let modifiedLogsData = [];
    logsData.forEach((data) => {
      let modifiedLogData = {
        email: data.email,
        role: data.role,
        action: data.action,
        date: data.date.toLocaleDateString(),
        time: data.time.toLocaleTimeString(),
      }
      modifiedLogsData.push(modifiedLogData);
    })

    const csvData = csvjson.toCSV(modifiedLogsData, { headers: 'key' });
    //upload to s3
    const uploadedFile: any = await this.uploadsService.s3Upload(
      csvData,
      sheetName,
    );
    res.status(200).json({ URL: `${uploadedFile.Location}` });
    // return { "URL": uploadedFile.Location }

  }
  async logsList(
    options: ReportOptions,
    res: Response,
  ) {
    const aggregation = [];

    const { filterBy, filterPeriod, filterByDateFrom, filterByDateTo } = options;


    if (filterBy?.length) {
      this.sysLogsService.filter(aggregation, filterBy);
    }

    if (filterPeriod) {
      this.sysLogsService.filterByPeriod(aggregation, filterPeriod);
    }
    if (filterByDateFrom && filterByDateTo) {
      this.sysLogsService.customPeriod(aggregation, filterByDateFrom, filterByDateTo);
    }
    aggregation.push({
      $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' },
    },
      {
        $unwind: { path: '$user', preserveNullAndEmptyArrays: false },
      }, {
      $project: {
        email: '$user.email', role: '$user.role', action: 1, date: '$createdAt', time: '$createdAt', _id: 0

      }
    })
    const result = await this.sysLogsService.m.aggregate(aggregation);
    this.PrepareLogsSystemReport(result, 'log-sys.csv', res)

  }

  async customersAccountReportSA(dto: ReportDto) {
    const customerList = await this.usersService.find({
      role: RolesEnum.CUSTOMER,
      createdAt: {
        $gte: dto.filterByDateFrom,
        $lte: dto.filterByDateTo,
      },
    });

    const customersData = customerList.map(({ name, email, phoneNumber, createdAt }) => ({
      name,
      email,
      phone: phoneNumber,
      joinDate: createdAt.toLocaleDateString(),
    }));

    const result = {
      period: {
        From: dto.filterByDateFrom,
        To: dto.filterByDateTo,
      },
      Data: customersData,
    };

    const modifiedSubscriptions = Array.from(customersData, ({ name, email, phone, joinDate }) => ({
      name,
      email,
      phone,
      joinDate,
    }));

    const csvData = csvjson.toCSV(modifiedSubscriptions, { headers: 'key' });

    const uploadedFile = await this.uploadsService.s3Upload(csvData, 'customer.csv');

    return { URL: uploadedFile.Location };
  }

  async customersAccountReport(req: RequestWithUser, dto: ReportDto) {

    const customers = await this.usersService.find({
      role: RolesEnum.CUSTOMER,
      createdAt: {
        $gte: dto.filterByDateFrom,
        $lte: dto.filterByDateTo,
      }
    });

    const customersData = customers.map(customer => ({
      name: customer.name,
      email: customer.email,
      phone: customer.phoneNumber,
      joinDate: customer.createdAt.toLocaleDateString()
    }));

    const entity = await this.entitiesService.findOne({ owner: this.toObjectId(req.user._id) });
    if (!entity) {
      throw new NotFoundException('055,R055');
    }
    console.log("Business Name ", entity.name);

    const result = {
      "Business Name": entity.name,
      "period": {
        "From": dto.filterByDateFrom,
        "To": dto.filterByDateTo,
      },
      "Data": customersData,
    };

    const modifiedSubscriptions = customersData.map(data => ({
      name: data.name,
      email: data.email,
      phone: data.phone,
      joinDate: data.joinDate
    }));
    console.log("modifiedSubscriptions", modifiedSubscriptions);

    const csvData = csvjson.toCSV(modifiedSubscriptions, { headers: 'key' });

    // Upload to S3
    const uploadedFile = await this.uploadsService.s3Upload(csvData, 'customer.csv');

    return { "URL": uploadedFile.Location };
  }

  async businessAccountReport(req: RequestWithUser, dto: ReportDto) {
    const { user } = req;
    const { filterByDateFrom, filterByDateTo } = dto;

    const entity = await this.entitiesService.findOne({ owner: this.toObjectId(user._id) });
    if (!entity) {
      throw new NotFoundException('055,R055');
    }

    const users = await this.usersService.find({
      owner: this.toObjectId(user._id),
      role: RoleGroups.PROFILE,
      createdAt: {
        $gte: filterByDateFrom,
        $lte: filterByDateTo,
      },
    });

    const data = users.map((user) => {
      const { name, email, phoneNumber: phone, role: subscription, createdAt: joinDate } = user;
      return { name, email, phone, subscription, joinDate };
    });

    const period = { from: filterByDateFrom, to: filterByDateTo };
    const result = {
      'Business Name': entity.name,
      period,
      data,
    };

    const modifiedData = data.map(({ name, email, phone, subscription, joinDate }) => {
      return { name, email, phone, subscription, joinDate };
    });

    const csvData = csvjson.toCSV(modifiedData, { headers: 'key' });
    const uploadedFile = await this.uploadsService.s3Upload(csvData, 'business.csv');

    return { URL: uploadedFile.Location };
  }

  async couponsList(req: RequestWithUser) {
    const coupons = await this.couponService.find({ owner: req.user._id }, { owner: 0, });
    const entityExist = await (await this.entitiesService.findOne({ owner: this.toObjectId(req.user._id) }));
    if (!entityExist) throw new NotFoundException('055,R055');
    return {
      "Business Name ": entityExist.name,
      "Data": coupons,
    };
  }

  // done
  async couponDetails(req: RequestWithUser, id: string) {
    const coupon = await this.couponService.findOne({ owner: toObjectId(req.user._id), _id: toObjectId(id) }, { owner: 0 });
    if (!coupon) throw new NotFoundException('086,R086');

    const entityExist = await (await this.entitiesService.findOne({ owner: this.toObjectId(req.user._id) }));
    if (!entityExist) throw new NotFoundException('055,R055');
    return {
      "Business Name ": entityExist.name,
      "Data": coupon,
    };
  }

  // 14 Single Add Transaction (Input: Select Transaction)
  async addTransactionDetails(req: RequestWithUser, id: string) {
    const transactionDetails = await this.addTransactionService.findOne({ owner: toObjectId(req.user._id), _id: toObjectId(id) }, { owner: 0 });
    if (!transactionDetails) throw new NotFoundException('019,R019');

    const entityExist = await (await this.entitiesService.findOne({ owner: this.toObjectId(req.user._id) }));
    if (!entityExist) throw new NotFoundException('055,R055');
    return {
      "Business Name ": entityExist.name,
      "Data": transactionDetails,
    };
  }


  // 15 Single Release Transaction (Input: Select Transaction)
  async releaseTransactionDetails(req: RequestWithUser, id: string) {
    const transactionDetails = await this.releaseTransactionsService.findOne({ owner: toObjectId(req.user._id), _id: toObjectId(id) }, { owner: 0 });
    if (!transactionDetails) throw new NotFoundException('019,R019');

    const entityExist = await (await this.entitiesService.findOne({ owner: this.toObjectId(req.user._id) }));
    if (!entityExist) throw new NotFoundException('055,R055');
    return {
      "Business Name ": entityExist.name,
      "Data": transactionDetails,
    };
  }


  // 16 Single Aduit Transaction (Input: Select Transaction)
  async wasteTransactionDetails(req: RequestWithUser, id: string) {
    const transactionDetails = await this.wasteTransactionService.findOne({ owner: toObjectId(req.user._id), _id: toObjectId(id) }, { owner: 0 });
    if (!transactionDetails) throw new NotFoundException('019,R019');

    const entityExist = await (await this.entitiesService.findOne({ owner: this.toObjectId(req.user._id) }));
    if (!entityExist) throw new NotFoundException('055,R055');
    return {
      "Business Name ": entityExist.name,
      "Data": transactionDetails,
    };
  }



  // 17 Single Aduit Transaction (Input: Select Transaction)
  async aduitTransactionDetails(req: RequestWithUser, id: string) {
    const transactionDetails = await this.auditTransactionService.findOne({ owner: toObjectId(req.user._id), _id: toObjectId(id) }, { owner: 0 });
    if (!transactionDetails) throw new NotFoundException('019,R019');

    const entityExist = await (await this.entitiesService.findOne({ owner: this.toObjectId(req.user._id) }));
    if (!entityExist) throw new NotFoundException('055,R055');
    return {
      "Business Name ": entityExist.name,
      "Data": transactionDetails,
    };
  }


  // 19 Single shrinkage Transaction (Input: Select Transaction)
  async shrinkageTransactionDetails(req: RequestWithUser, id: string) {
    const transactionDetails = await this.shrinkageTransactionService.findOne({ owner: toObjectId(req.user._id), _id: toObjectId(id) }, { owner: 0 });
    if (!transactionDetails) throw new NotFoundException('019,R019');

    const entityExist = await (await this.entitiesService.findOne({ owner: this.toObjectId(req.user._id) }));
    if (!entityExist) throw new NotFoundException('055,R055');
    return {
      "Business Name ": entityExist.name,
      "Data": transactionDetails,
    };
  }

  // 22 Single reverse Transaction (Input: Select Transaction)
  async reverseTransactionDetails(req: RequestWithUser, id: string) {
    const transactionDetails = await this.reverseTransactionService.findOne({ owner: toObjectId(req.user._id), _id: toObjectId(id) }, { owner: 0 });
    if (!transactionDetails) throw new NotFoundException('019,R019');

    const entityExist = await (await this.entitiesService.findOne({ owner: this.toObjectId(req.user._id) }));
    if (!entityExist) throw new NotFoundException('055,R055');
    return {
      "Business Name ": entityExist.name,
      "Data": transactionDetails,
    };
  }

  //  Single refund Transaction (Input: Select Transaction)
  async refundTransactionDetails(req: RequestWithUser, id: string) {
    const transactionDetails = await this.refundTransactionService.findOne({ owner: toObjectId(req.user._id), _id: toObjectId(id) }, { owner: 0 });
    if (!transactionDetails) throw new NotFoundException('019,R019');

    const entityExist = await (await this.entitiesService.findOne({ owner: this.toObjectId(req.user._id) }));
    if (!entityExist) throw new NotFoundException('055,R055');
    return {
      "Business Name ": entityExist.name,
      "Data": transactionDetails,
    };
  }

  //  Warehouses List 
  async warehousesList(req: RequestWithUser) {
    const warehouses = await this.warehouseService.find({ _id: req.user.warehouseId }, { owner: 0, });
    const entityExist = await (await this.entitiesService.findOne({ owner: this.toObjectId(req.user._id) }));
    if (!entityExist) throw new NotFoundException('055,R055');
    return {
      "Business Name ": entityExist.name,
      "Data": warehouses,
    };
  }

  //  24 Stock Category List 
  async stockCategoryList(req: RequestWithUser) {
    const stockCategory = await this.stockCategoryService.find({ entityId: req.user.entityId }, { entityId: 0, });
    const entityExist = await (await this.entitiesService.findOne({ owner: this.toObjectId(req.user._id) }));
    if (!entityExist) throw new NotFoundException('055,R055');
    return {
      "Business Name ": entityExist.name,
      "Data": stockCategory,
    };
  }

  // 26 Stock items List 
  async stockItemsList(req: RequestWithUser) {
    const stockItems = await this.stockItemDataService.find({ entityId: req.user.entityId }, { entityId: 0, });
    const entityExist = await (await this.entitiesService.findOne({ owner: this.toObjectId(req.user._id) }));
    if (!entityExist) throw new NotFoundException('055,R055');
    return {
      "Business Name": entityExist.name,
      "Data": stockItems,
    };
  }

  //  25- Services List 
  async servicesList(req: RequestWithUser) {
    const servicesList = await this.servicesService.find({ entityId: req.user.entityId }, { entityId: 0, });
    return { "Services": servicesList };
  }



  async subscription(req: RequestWithUser, dto: DateToDatePeriodDto) {

    let cashierCount1 = 0;
    let cashierCount2 = 0;
    let proCashierCount1 = 0;
    let proCashierCount2 = 0;
    let premiumCashierCount1 = 0;
    let premiumCashierCount2 = 0;
    let packageName;
    let Variance;
    let bussinessName;
    let dataInfo = {};
    let Data = [];
    let Data1 = 0;
    let Data2 = 0;
    let Package;
    let date1;
    let date2;
    let date3;
    let date4;


    const startDate1 = new Date(new Date(dto.firstDate)).toISOString();
    const endDate1 = new Date(new Date(dto.secondDate)).toISOString();
    console.log(startDate1, endDate1);

    const firstDateSubscription = await this.subscriptionService.find({
      createdAt: {
        $gte: startDate1,
        $lt: endDate1,
      }
    });
    console.log("firstDateSubscription", firstDateSubscription);

    for (const fCount in firstDateSubscription) {

      const user = await this.usersService.findOne({ _id: { $in: [firstDateSubscription[fCount].ownerId[0]] }, status: StatusEnum.COMPLETED });
      if (user) {
        packageName = user.subscriptionType;
        const entities = await this.entitiesService.findOne({ _id: user.entityId });
        bussinessName = entities.name;
        if (packageName == SubscriptionTypeEnum.CASHIER) {
          cashierCount1 += 1;
        }
        if (packageName == SubscriptionTypeEnum.PRO_CASHIER) {
          proCashierCount1 += 1;
        }
        if (packageName == SubscriptionTypeEnum.PREMIUM_CASHIER) {
          premiumCashierCount1 += 1
        }
      }
    }
    console.log("Date1", cashierCount1, proCashierCount1, premiumCashierCount1);

    //
    const startDate2 = new Date(new Date(dto.thirdDate)).toISOString();
    const endDate2 = new Date(new Date(dto.fourthDate)).toISOString();
    console.log(startDate2, endDate2);

    const secondDateSubscription = await this.subscriptionService.find({
      createdAt: {
        $gte: startDate2,
        $lt: endDate2,
      }
    });
    console.log("secondDateSubscription", secondDateSubscription);

    for (const sCount in secondDateSubscription) {

      const user = await this.usersService.findOne({ _id: { $in: [secondDateSubscription[sCount].ownerId[0]] }, status: StatusEnum.COMPLETED });
      if (user) {
        packageName = user.subscriptionType;
        const entities = await this.entitiesService.findOne({ _id: user.entityId });
        bussinessName = entities.name;
        console.log("Package", packageName, "user", user, "bussinessName", bussinessName);

        if (packageName == SubscriptionTypeEnum.CASHIER) {
          cashierCount2 += 1;
        }
        if (packageName == SubscriptionTypeEnum.PRO_CASHIER) {
          proCashierCount2 += 1;
        }
        if (packageName == SubscriptionTypeEnum.PREMIUM_CASHIER) {
          premiumCashierCount2 += 1
        }
      }
      console.log("Date2", cashierCount1, proCashierCount1, premiumCashierCount1);
    }
    dataInfo = {
      Package: SubscriptionTypeEnum.CASHIER,
      Data1: cashierCount1,
      Data2: cashierCount2,
      Variance: cashierCount2 - cashierCount1

    }
    Data.push(dataInfo);
    dataInfo = {
      Package: SubscriptionTypeEnum.PRO_CASHIER,
      Data1: proCashierCount1,
      Data2: proCashierCount2,
      Variance: proCashierCount2 - proCashierCount1

    }
    Data.push(dataInfo);
    dataInfo = {
      Package: SubscriptionTypeEnum.PREMIUM_CASHIER,
      Data1: premiumCashierCount1,
      Data2: premiumCashierCount2,
      Variance: premiumCashierCount2 - premiumCashierCount1
    }
    Data.push(dataInfo);
    let period = [];
    period.push(
      {
        date1: dto.firstDate,
        date2: dto.secondDate,
        date3: dto.thirdDate,
        date4: dto.fourthDate
      }
    )
    const result = { "period": { "From Date": { "date1": dto.firstDate, "date2": dto.secondDate }, "To Date": { "date3": dto.thirdDate, "date4": dto.fourthDate } }, "Data": Data };
    // const result = { "period": period, "Data": Data };


    let modifiedSubscriptions = [];
    // modifiedSubscriptions.push(period)
    Data.forEach((data) => {
      let modifiedSubscription = {
        Package: data.Package,
        Data1: data.Data1,
        Data2: data.Data2,
        Variance: data.Variance,
      }
      console.log("modifiedSubscription", modifiedSubscription);
      modifiedSubscriptions.push(modifiedSubscription);
    })
    console.log("modifiedSubscriptions", modifiedSubscriptions);

    const csvData = csvjson.toCSV(modifiedSubscriptions, { headers: 'key' });
    //upload to s3
    const uploadedFile: any = await this.uploadsService.s3Upload(
      csvData,
      'subscription.csv',
    );
    return { "URL": uploadedFile.Location }
  }


 

  async statisticsReport(dto: ReportDto) {

    const stores = await this.entitiesService.count({
      entityType: EntityTypeEnum.STORE,
      createdAt: {
        $gte: dto.filterByDateFrom,
        $lte: dto.filterByDateTo,
      }
    });
    const restaurants = await this.entitiesService.count({
      entityType: EntityTypeEnum.RESTURANT,
      createdAt: {
        $gte: dto.filterByDateFrom,
        $lte: dto.filterByDateTo,
      }
    });

    const customers = await this.usersService.count({
      role: RolesEnum.CUSTOMER,
      createdAt: {
        $gte: dto.filterByDateFrom,
        $lte: dto.filterByDateTo,
      }
    });


    const packages = await this.subscriptionService.find({
      createdAt: {
        $gte: dto.filterByDateFrom,
        $lte: dto.filterByDateTo,
      }
    });

    let totalPrice = 0;
    packages.find(e => {
      totalPrice += e.price;
    })

    return {
      "Stores": stores,
      "Restaurants": restaurants,
      "Customers": customers,
      "Revenue": totalPrice
    };


  }



}






