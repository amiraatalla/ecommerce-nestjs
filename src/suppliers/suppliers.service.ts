import { Supplier, SupplierDoc } from './entities/suppliers.entity';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseService, Pagination, SearchOptions } from 'src/core/shared';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { SupplierOutput } from './classes/output.class';
import * as csvjson from "csvjson";
import { UploadService } from 'src/upload/upload.service';
import { Response } from 'express';
import { DownloadSupplierSearchOptions } from './dto/download-supplier-options.dto';
@Injectable()
export class SuppliersService extends BaseService<SupplierDoc> {
  constructor(
    @InjectModel(Supplier.name) private readonly m: Model<SupplierDoc>,
    private readonly uploadsService: UploadService,

  ) {
    super(m);
  }
  async createSupplier(dto: CreateSupplierDto) {
    return await this.create(dto);
  }

  async findAll(
    options: SearchOptions,
  ){
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
    } = options; if (sort && dir) {
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

  async downloadAll(
    res: Response,
    options: DownloadSupplierSearchOptions,
  ){
    const aggregation = [];

    const {
      sort,
      dir,
      searchTerm,
      filterBy,
      attributesToRetrieve,
      filterByDateFrom,
      filterByDateTo,
    } = options; 
    
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
    const result = await this.m.aggregate(aggregation);
    return this.exportToCSV(res ,result, 'supplier.csv');
  }
  private search(aggregation: any, searchTerm: string): void {
    aggregation.push({
      $match: { name: { $regex: new RegExp(searchTerm), $options: 'i' } },
    });
  }


  async exportToCSV(res, data , fileName) {
    const csvData = csvjson.toCSV(data, { headers: 'key' });

    //upload to s3
    const uploadedFile: any = await this.uploadsService.s3Upload(csvData, fileName);

    res.status(200).json({ URL: `${uploadedFile.Location}` });
  }
}
