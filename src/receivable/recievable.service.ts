import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { RequestWithUser } from "src/auth/interfaces/user-request.interface";
import { BaseService, Pagination } from "src/core/shared";
import { generateCode } from "src/core/utils";
import { CustomerService } from "src/customer/customer.service";
import { DeferredRecievableService } from "src/deferred-recievable/deferred-recievable.service";
import { ActionsEnum } from "src/sysLog/enums/actions.enums";
import { SYSLogService } from "src/sysLog/sysLog.service";
import { StatusEnum } from "src/users/enums/status.enum";
import { UsersService } from "src/users/users.service";
import { CreateRecievableDto } from "./dto/create-recievable.dto";
import { RecievableSearchOptions } from "./dto/recievable-search-options.dto";
import { Recievable, RecievableDoc } from "./entities/recievable.entity";

@Injectable()
export class RecievableService extends BaseService<RecievableDoc> {
  constructor(
    @InjectModel(Recievable.name) readonly m: Model<RecievableDoc>,
    private readonly sysLogsService: SYSLogService,
    private readonly customerService: CustomerService,

    @Inject(forwardRef(() => DeferredRecievableService))
    private readonly deferredRecievableService: DeferredRecievableService,


  ) {
    super(m);
  }

  async createRecievable(req: RequestWithUser, dto: CreateRecievableDto) {

    // console.log(await this.customerService.findOneById(this.toObjectId(dto.customerId)));

    const Recievable = await this.create({
      owner: req.user._id,
      customerId: this.toObjectId(dto.customerId),
      recievableAmount: dto.recievableAmount,
      notes: dto.notes,
      transactionType: dto.transactionType
    })


    // this.sysLogsService.create({
    //     userId: req.user._id,
    //     // action: ActionsEnum.CREATE_Recievable,
    // });


    const deferredRecievable = await this.deferredRecievableService.create({
      owner: req.user._id,
      customerId: this.toObjectId(dto.customerId),
      // recievableId: Recievable._id,
      deferredRecievableAmount: dto.deferredRecievableAmount,
      notes: dto.notes,
      transactionType: dto.transactionType,
      transactionID: Recievable.transactionID,
    })
    return { Recievable, deferredRecievable };
  }


  /**
   * Search Recievables collection.
   */
  async findAll(
    owner: Types.ObjectId,
    options: RecievableSearchOptions,
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
      filterByDateTo

    } = options;

    const sort = 'index';
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
    aggregation.push(
      {
        $lookup: {
          from: 'customers',
          localField: 'customerId',
          foreignField: '_id',
          as: 'customer',
        },
      },

      {
        $lookup: {
          from: 'users',
          localField: 'owner',
          foreignField: '_id',
          as: 'owner',
        }
      },
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
   * Search Recievables fields.
   */
  private search(aggregation: any, searchTerm: string): void {
    aggregation.push({
      $match: {
        $or: [
          { supplierId: { $regex: new RegExp(searchTerm), $options: 'i' } },
        ],
      },
    });
  }





}
