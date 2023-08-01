import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RequestWithUser } from 'src/auth/interfaces/user-request.interface';
import { BaseService, Pagination } from 'src/core/shared';
import { CustomerService } from 'src/customer/customer.service';
import { ActionsEnum } from 'src/sysLog/enums/actions.enums';
import { SYSLogService } from 'src/sysLog/sysLog.service';
import { StatusEnum } from 'src/users/enums/status.enum';
import { CodeDto } from './dto/code.dto';
import { CreateTableDto } from './dto/create-table.dto';
import { TablesSearchOptions } from './dto/table-search-options.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { Table, TableDoc } from './entities/tables.entity';

@Injectable()
export class TableService extends BaseService<TableDoc> {
  constructor(
    @InjectModel(Table.name) readonly m: Model<TableDoc>,
    private readonly sysLogsService: SYSLogService,
  ) {
    super(m);
  }

  async createTable(req: RequestWithUser, dto: CreateTableDto) {
    if (req.user.status !== StatusEnum.COMPLETED)
      throw new BadRequestException('140,R140');


    const tableExist = await this.findOne({
      entityId: this.toObjectId(req.user.entityId),
      code: dto.code,
    });
    console.log("table", tableExist);

    if (tableExist) throw new BadRequestException('035,R035');
    this.sysLogsService.create({
      userId: req.user._id,
      action: ActionsEnum.CREATE_TABLE,
    });
    const table = await this.create({
      entityId: this.toObjectId(req.user.entityId),
      ...dto,
    });

    const result = await this.aggregateOne([
      { $match: { _id: table._id } },
      {
        $lookup: {
          from: 'entities',
          localField: 'entityId',
          foreignField: '_id',
          as: 'entityData',
        }
      },

    ]);
    return result;
  }

  /**
   * Edit Tables collection.
   */

  async findTable(req: RequestWithUser, id: string) {
    const Table = await this.findOne({ _id: this.toObjectId(id), entityId: req.user.entityId });
    if (!Table) throw new NotFoundException('036,R036');
    this.sysLogsService.create({
      userId: req.user._id,
      action: ActionsEnum.GET_TABLE,
    });
    const result = await this.aggregateOne([
      { $match: { _id: Table._id } },
      {
        $lookup: {
          from: 'entities',
          localField: 'entityId',
          foreignField: '_id',
          as: 'entityData',
        }
      },

    ]);
    return result;
  }

  async getTableByCode(req: RequestWithUser, dto: CodeDto) {
    const Table = await this.findOne({ code: dto.code });
    if (!Table) throw new NotFoundException('036,R036');
    this.sysLogsService.create({
      userId: req.user._id,
      action: ActionsEnum.GET_TABLE,
    });
    const result = await this.aggregateOne([
      { $match: { _id: Table._id } },
      {
        $lookup: {
          from: 'entities',
          localField: 'entityId',
          foreignField: '_id',
          as: 'entityData',
        }
      },

    ]);
    return result;
  }


  /**
   * Edit Tables collection.
   */

  async updateTable(req: RequestWithUser, id: string, dto: UpdateTableDto) {
    if (req.user.status !== StatusEnum.COMPLETED)
      throw new BadRequestException('140,R140');
    const TableExist = await this.findOneById(id);
    if (!TableExist) throw new NotFoundException('036,R036');

    this.sysLogsService.create({
      userId: req.user._id,
      action: ActionsEnum.UPDATE_TABLE,
    });
    const table = await this.update(id, {
      ...dto,
    });

    const result = await this.aggregateOne([
      { $match: { _id: table._id } },
      {
        $lookup: {
          from: 'entities',
          localField: 'entityId',
          foreignField: '_id',
          as: 'entityData',
        }
      },

    ]);
    return result;
  }

  async deleteTable(req: RequestWithUser, id: string) {
    if (req.user.status !== StatusEnum.COMPLETED)
      throw new BadRequestException('140,R140');
    const TableExist = await this.findOneById(id);
    if (!TableExist) throw new NotFoundException('036,R036');
    else {
      this.sysLogsService.create({
        userId: req.user._id,
        action: ActionsEnum.DELETE_TABLE,
      });
      return await this.remove(id);
    }
  }

  /**
   * Search Tables collection.
   */
  async findAll(
    entityId: Types.ObjectId,
    req: RequestWithUser,
    options: TablesSearchOptions,
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
    aggregation.push({ $match: { entityId } });
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
   * Search Tables fields.
   */
  private search(aggregation: any, searchTerm: string): void {
    aggregation.push({
      $match: {
        $or: [{ code: { $regex: new RegExp(searchTerm), $options: 'i' } },
        { name: { $regex: new RegExp(searchTerm), $options: 'i' } }],
      },
    });
  }
}
