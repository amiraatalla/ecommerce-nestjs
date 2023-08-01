import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
// import { UploadsService } from 'src/upload/upload.service';
import { BaseService, Pagination, SearchOptions } from '../core/shared';
import { LogsCSVDto } from './dto/get-logs-csv.dto';
import { SYSLog, SYSLogDoc } from './entities/sysLog.entity';
// const csvjson = require('csvjson');
const csvjson = require('json-csv')
const AWS = require('aws-sdk');

@Injectable()
export class SYSLogService extends BaseService<SYSLogDoc> {
  constructor(
    @InjectModel(SYSLog.name) readonly m: Model<SYSLogDoc>,
    // private readonly uploadsService: UploadsService,
  ) {
    super(m);
  }

  private getuserAggregationPipeline(): any[] {
    return [
      { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      { $project: { 'user.password': 0 } },
    ];
  }

  async findOneLogPopulated(id: string) {
    return await this.aggregateOne([
      { $match: { _id: this.toObjectId(id) } },
      ...this.getuserAggregationPipeline(),
    ]);
  }

  /**
   * Search users collection.
   */
  async findAll(options: SearchOptions): Promise<Pagination> {
    const aggregation = [];
    const { sort, dir, offset, size, searchTerm, filterBy, filterByDateFrom, filterByDateTo } =
      options;
    if (sort?.length && dir) {
      this.sort(aggregation, sort, dir);
    }
    if (filterBy?.length) {
      this.filter(aggregation, filterBy);
    }
    if (searchTerm) {
      this.search(aggregation, searchTerm);
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
    aggregation.push(...this.getuserAggregationPipeline(), {
      $project: { password: 0 , pin: 0 },
    });
    return await this.aggregate(aggregation, offset, size);
  }
  /**
   * Search users fields.
   */
  private search(aggregation: any, searchTerm: string): void {
    aggregation.push({
      $match: {
        $or: [{ email: new RegExp('^' + searchTerm, 'i') }],
      },
    });
  }

  /**
   * get logs by date range from & to
   */
  // async GetLogsByDateRange(res: any, dto: LogsCSVDto) {
  //   const logsData: any[] = await this.m.aggregate([
  //     {
  //       $addFields: {
  //         createdAtToString: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
  //       },
  //     },
  //     {
  //       $match: {
  //         createdAtToString: { $gte: dto.filterByDateFrom, $lte: dto.filterByDateTo },
  //       },
  //     },
  //     {
  //       $project: {
  //         createdAtToString: 0,
  //       },
  //     },
  //     ...this.getuserAggregationPipeline(),
  //   ]);

  //   const data = [];
  //   for (const logData of await logsData) {
  //     data.push({
  //       email: logData?.user?.email || logData?.userEmail,
  //       action: logData.action,
  //       createdAt: logData.createdAt.toISOString(),
  //     });
  //   }

  //   const csvData = csvjson.toSCV(data, { headers: 'key' });
  //   // const csvData = csvtojson.toSCV(data, { headers: 'key' });

  //   const fileName = `${Date.now()}.csv`;
  //   //upload to s3
  //   const uploadedFile: any = await this.uploadsService.s3Upload(csvData, fileName);

  //   return res.status(200).json({ URL: `${uploadedFile.Location}` });
  // }
}
