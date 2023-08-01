import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RequestWithUser } from 'src/core/interfaces';
import { BaseService, Pagination, SearchOptions } from 'src/core/shared';
import { CreateStockCategoryDto } from './dto/create-stock-category';
import { StockCategory, StockCategoryDoc } from './entities/stock-category.entity';

@Injectable()
export class StockCategoryService extends BaseService<StockCategoryDoc> {
  constructor(@InjectModel(StockCategory.name) private readonly m: Model<StockCategoryDoc>) {
    super(m);
  }
  async createStockategory(req: RequestWithUser, dto: CreateStockCategoryDto) {
    if (dto.parentStockategoryId) {
      const result = await this.findOneById(dto.parentStockategoryId);
      if (!result) {
        throw new NotFoundException('111');
      }
    }
    if (
      (!dto.parentStockategoryId && dto.section) ||
      (dto.parentStockategoryId && dto.department) ||
      (dto.parentStockategoryId && !dto.section) ||
      (!dto.parentStockategoryId && !dto.department)
    ) {
      throw new BadRequestException('112');
    }
    return await this.create({ entityId: req.user.entityId, ...dto });
  }

  async findAll(options: SearchOptions, entityId?: Types.ObjectId): Promise<Pagination> {
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
    } = options; if (entityId) {
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

  async findAllById(
    entityId: Types.ObjectId,
    req: RequestWithUser,
    options: SearchOptions
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
    } = options; if (entityId) {
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
          from: 'stockitems',
          localField: '_id',
          foreignField: 'stockCategoryId',
          as: 'items',
        },
      },
      
      {
        $unwind:
        {
          path: '$items',
          preserveNullAndEmptyArrays: false
        }
      },
      // {
      //   $lookup: {
      //     from: 'warehousestockitems',
      //     localField: 'items.warehouseStockItemsData',
      //     foreignField: '_id',
      //     as: 'items.warehouseItem',
      //   }
      // },

      {
        $lookup: {
          from: 'warehousestockitems',
          let: { pid: '$items.warehouseStockItemsData' },
          pipeline: [{ $match: { $expr: { $in: ['$_id', '$$pid'] } } }],
          as: 'warehouseItem',
        },
      },
      // {
      //   $match: { items: { $gt: {$size: 0 } } },
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
  private search(aggregation: any, searchTerm: string): void {
    aggregation.push({
      $match: { stockategoryName: { $regex: new RegExp(searchTerm), $options: 'i' } },
    });
  }
}
