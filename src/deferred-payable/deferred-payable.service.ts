import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { RequestWithUser } from "src/auth/interfaces/user-request.interface";
import { BaseService, Pagination } from "src/core/shared";
import { PayableService } from "src/payable/payable.service";
import { RolesEnum } from "src/users/enums/roles.enum";
import { DeferredPayableSearchOptions } from "./dto/deferred-payable-search-options.dto";
import { UpdateDeferredPayableDto } from "./dto/update-deferred-payable.dto";
import { DeferredPayable, DeferredPayableDoc } from "./entities/deferred-payable.entity";

@Injectable()
export class DeferredPayableService extends BaseService<DeferredPayableDoc> {
    constructor(
        @InjectModel(DeferredPayable.name) readonly m: Model<DeferredPayableDoc>,
        @Inject(forwardRef(() => PayableService)) 
        private readonly payableService: PayableService,

    ) {
        super(m);
    }

    async updateDeferredPayable(req: RequestWithUser,id: string, dto: UpdateDeferredPayableDto ) {
        
        const payableDeferredExist = await this.findOneById(id);
        if(!payableDeferredExist) throw new BadRequestException("this record is not exist");

        // const Payable = await this.payableService.create({
        //     owner:req.user._id,
        //     supplierId:payableDeferredExist.supplierId,
        //     payableAmount:dto.payableAmount,
        //     notes: dto.notes
        // })
        
        if(payableDeferredExist.deferredPayableAmount-dto.payableAmount <0 ) throw new BadRequestException("018,R018");
        const deferredPayable = await this.update(id,{
            deferredPayableAmount:payableDeferredExist.deferredPayableAmount-dto.payableAmount,
            notes: dto.notes
        })

        const payableExist =  await this.payableService.findOne({transactionID:deferredPayable.transactionID})
        const Payable = await this.payableService.updateOne({transactionID: deferredPayable.transactionID},{
  
          payableAmount:payableExist.payableAmount +dto.payableAmount,
         
      })
        return {Payable,deferredPayable};

    }



    /**
     * Search DeferredPayables collection.
     */
    async findAll(
      owner: Types.ObjectId,
      options: DeferredPayableSearchOptions,
      req:RequestWithUser,
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
        // if (req.user.role == RolesEnum.CASHIER) {
        //   aggregation.push({ $match: { owner : req.user._id } });
        // }
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
     * Search DeferredPayables fields.
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
