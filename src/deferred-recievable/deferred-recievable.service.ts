import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model,Types } from "mongoose";
import { RequestWithUser } from "src/auth/interfaces/user-request.interface";
import { BaseService, Pagination } from "src/core/shared";
import { RecievableService } from "src/receivable/recievable.service";
import { DeferredRecievableSearchOptions } from "./dto/deferred-recievable-search-options.dto";
import { UpdateDeferredRecievableDto } from "./dto/update-deferred-recievable.dto";
import { DeferredRecievable, DeferredRecievableDoc } from "./entities/deferred-recievable.entity";

@Injectable()
export class DeferredRecievableService extends BaseService<DeferredRecievableDoc> {
  constructor(
    @InjectModel(DeferredRecievable.name) readonly m: Model<DeferredRecievableDoc>,
    @Inject(forwardRef(() => RecievableService))
    private readonly recievableService: RecievableService,

  ) {
    super(m);
  }

  async updateDeferredRecievable(req: RequestWithUser, id: string, dto: UpdateDeferredRecievableDto) {

    const recievableDeferredExist = await this.findOneById(id);
    if (!recievableDeferredExist) throw new BadRequestException("this record is not exist");

    // const Recievable = await this.recievableService.create({
    //   owner: req.user._id,
    //   customerId: recievableDeferredExist.customerId,
    //   recievableAmount: dto.recievableAmount,
    //   notes: dto.notes
    // })

  
    if(recievableDeferredExist.deferredRecievableAmount-dto.recievableAmount <0 ) throw new BadRequestException("018,R018");

    const deferredRecievable = await this.update(id, {
      deferredRecievableAmount: recievableDeferredExist.deferredRecievableAmount - dto.recievableAmount,
      notes: dto.notes
    })

    const recievableExist =  await this.recievableService.findOne({transactionID:deferredRecievable.transactionID})

    const Recievable = await this.recievableService.updateOne({transactionID : deferredRecievable.transactionID},{
      recievableAmount: recievableExist.recievableAmount + dto.recievableAmount,
    })

    return { Recievable, deferredRecievable };

  }



  /**
   * Search DeferredRecievables collection.
   */
  async findAll(
    owner: Types.ObjectId,
    options: DeferredRecievableSearchOptions,
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
   * Search DeferredRecievables fields.
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
