import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { RequestWithUser } from "src/auth/interfaces/user-request.interface";
import { BaseService, Pagination } from "src/core/shared";
import { generateCode } from "src/core/utils";
import { DeferredPayableService } from "src/deferred-payable/deferred-payable.service";
import { ActionsEnum } from "src/sysLog/enums/actions.enums";
import { SYSLogService } from "src/sysLog/sysLog.service";
import { StatusEnum } from "src/users/enums/status.enum";
import { UsersService } from "src/users/users.service";
import { CreatePayableDto } from "./dto/create-payable.dto";
import { PayableSearchOptions } from "./dto/payable-search-options.dto";
import { Payable, PayableDoc } from "./entities/payable.entity";

@Injectable()
export class PayableService extends BaseService<PayableDoc> {
  constructor(
    @InjectModel(Payable.name) readonly m: Model<PayableDoc>,
    private readonly sysLogsService: SYSLogService,

    @Inject(forwardRef(() => DeferredPayableService))
    private readonly deferredPayableService: DeferredPayableService,


  ) {
    super(m);
  }

  async createPayable(req: RequestWithUser, dto: CreatePayableDto) {

    const Payable = await this.create({
      owner: req.user._id,
      supplierId: this.toObjectId(dto.supplierId),
      payableAmount: dto.payableAmount,
      notes: dto.notes, 
      transactionType:dto.transactionType

    })

    // this.sysLogsService.create({
    //   userId: req.user._id,
    //   // action: ActionsEnum.CREATE_PAYABLE,
    // });


    const deferredPayable = await this.deferredPayableService.create({
      owner: req.user._id,
      supplierId: this.toObjectId(dto.supplierId),
      // payableId: Payable._id,
      deferredPayableAmount: dto.deferredPayableAmount,
      notes: dto.notes,
      transactionType:dto.transactionType,
      transactionID : Payable.transactionID

    })
    return { Payable, deferredPayable };

  }


  /**
   * Search Payables collection.
   */
  async findAll(
    owner: Types.ObjectId,
    options: PayableSearchOptions,
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
          from: 'suppliers',
          localField: 'supplierId',
          foreignField: '_id',
          as: 'supplier',
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
   * Search Payables fields.
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
