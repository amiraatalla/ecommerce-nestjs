import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Response } from 'express';
import { Model, Types } from 'mongoose';
import { RequestWithUser } from 'src/core/interfaces';
import { BaseService, Pagination, SearchOptions } from 'src/core/shared';
import { UsersService } from 'src/users/users.service';
import { CreateWarehouseDto } from './dto/create-warehouse';
import { Warehouse, WarehouseDoc } from './entities/warehouse.entity';

@Injectable()
export class WarehouseManagementService extends BaseService<WarehouseDoc> {
  constructor(
    @InjectModel(Warehouse.name) private readonly m: Model<WarehouseDoc>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {
    super(m);
  }
  async createWarehouse(
    req: RequestWithUser,
    dto: CreateWarehouseDto,
  ) {
    try {
      // if (!inventoryManagerId) {
      //   dto.inventoryManId = userId;
      // }
      let warehouse = await this.create({ owner : req.user._id, ...dto });
      await this.usersService.updateOne(
        { _id:req.user._id },
        { warehouseId: warehouse._id },
      );
      return warehouse;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async findAll(
    options: SearchOptions,
    owner: Types.ObjectId,
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

    aggregation.push({ $match: { owner } });

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
    return await this.aggregate(aggregation, offset, size);
  }

  /**
   * Search document fields.
   */
  private search(aggregation: any, searchTerm: string): void {
    aggregation.push({
      $match: { name: { $regex: new RegExp(searchTerm), $options: 'i' } },
    });
  }
}
