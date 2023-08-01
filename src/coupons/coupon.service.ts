import { Coupon, CouponDoc } from './entities/coupon.entity';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseService, Pagination, SearchOptions } from 'src/core/shared';
import { RequestWithUser } from 'src/core/interfaces';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { StatusEnum } from 'src/users/enums/status.enum';
import { ActionsEnum } from 'src/sysLog/enums/actions.enums';
import { CreateCuoponDto } from './dto/create-coupon.dto';
import { SYSLogService } from 'src/sysLog/sysLog.service';
import { ActivateCuoponDto } from './dto/activate-coupon.dto';
import { CreateMultiCuoponsDto } from './dto/create-multi-coupons.dto';
import { generateMultiCode } from 'src/core/utils';
import { FindCuoponByCodeDto } from './dto/find-coupon-by-code.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class CouponService extends BaseService<CouponDoc> {
  constructor(
    @InjectModel(Coupon.name) private readonly m: Model<CouponDoc>,
    private readonly sysLogsService: SYSLogService,


  ) {
    super(m);
  }
  async createSingleCoupon(req: RequestWithUser, dto: CreateCuoponDto) {
    if (req.user.status !== StatusEnum.COMPLETED) throw new BadRequestException("140,R140")
    const CouponExist = await this.findOne({ owner: req.user._id, code: dto.code });
    if (CouponExist) throw new BadRequestException("141,R141");

    this.sysLogsService.create({
      userId: req.user._id,
      action: ActionsEnum.CREATE_COUPON,
    });

    return await this.create({
      owner: req.user._id,
      ...dto,
    });

  }


  async createMultiCoupons(req: RequestWithUser, dto: CreateMultiCuoponsDto) {
    let codes = []
    codes = generateMultiCode(dto.prefix, dto.startNumberToGenerate, dto.endNumberToGenerate);

    if (req.user.status !== StatusEnum.COMPLETED) throw new BadRequestException("140,R140")
    // const CouponExist = await this.findOne({ owner: req.user._id, code: dto.code });
    // if (CouponExist) throw new BadRequestException("141,R141");

    this.sysLogsService.create({
      userId: req.user._id,
      action: ActionsEnum.CREATE_COUPON,
    });
    let coupons = [];
    for (let code in codes) {
      const coupon = await this.create({
        owner: req.user._id,
        code: codes[code],
        ...dto,
      });
      coupons.push(coupon);
    }
    return coupons;
  }

  /**
   * Edit Coupons collection.
   */

  async findCoupon(req: RequestWithUser, id: string) {
    const Coupon = await this.findOneById(id);
    if (!Coupon) throw new NotFoundException('086,R086');
    this.sysLogsService.create({
      userId: req.user._id,
      action: ActionsEnum.GET_COUPON,
    });
    return Coupon;
  }

  async findCouponByCode(req: RequestWithUser, dto: FindCuoponByCodeDto) {
    // const Coupon = await this.findOne({ code: dto.code });
    const Coupon = await this.findOne({ code: dto.code, used: false, status: true, userIds: { $nin: dto.customerId } });
    if (!Coupon) throw new NotFoundException('086,R086');
    // if (!Coupon) return "Not Vaild";
    this.sysLogsService.create({
      userId: req.user._id,
      action: ActionsEnum.GET_COUPON,
    });
    return Coupon;
  }
  //helper method
  async findCouponCode(req: RequestWithUser, dto: FindCuoponByCodeDto) {
    // const Coupon = await this.findOne({ code: dto.code });
    const Coupon = await this.findOne({ code: dto.code, used: false, status: true, userIds: { $nin: dto.customerId } });
    if (Coupon) return Coupon;
  }

  /**
   * Edit Coupons collection.
   */

  async updateCoupon(req: RequestWithUser, id: string, dto: UpdateCouponDto) {
    if (req.user.status !== StatusEnum.COMPLETED) throw new BadRequestException("140,R140")
    const CouponExist = await this.findOne({ owner: req.user._id, _id: this.toObjectId(id) });
    if (!CouponExist) throw new NotFoundException('086,R086');
    else {
      this.sysLogsService.create({
        userId: req.user._id,
        action: ActionsEnum.UPDATE_COUPON,
      });
      return await this.update(id, {
        ...dto,
      });
    }
  }

  async activeCoupon(req: RequestWithUser, id: string, dto: ActivateCuoponDto) {
    if (req.user.status !== StatusEnum.COMPLETED) throw new BadRequestException("140,R140")
    const CouponExist = await this.findOne({ owner: req.user._id, _id: this.toObjectId(id) });
    if (!CouponExist) throw new NotFoundException('086,R086');
    else {
      this.sysLogsService.create({
        userId: req.user._id,
        action: ActionsEnum.UPDATE_COUPON,
      });
      return await this.update(id, {
        ...dto,
      });
    }
  }

  async findAll(owner: Types.ObjectId, options: SearchOptions, req: RequestWithUser): Promise<Pagination> {
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
  private search(aggregation: any, searchTerm: string): void {
    aggregation.push({
      $match: { code: { $regex: new RegExp(searchTerm), $options: 'i' } }
    });
  }

  //cron job to check expiry

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    let ids = [];
    let date = new Date();
    const CouponsExist = await this.find({ expireOn: { $lte: new Date(Date.now()) } });
    for (const coupon in CouponsExist) {
      ids.push(CouponsExist[coupon]._id);
    }

    if (CouponsExist) {
      // console.log("Coupon ids : ", ids);
      await this.updateMany({ _id: { $in: ids }, status: true }, { status: false });
    }
  }



}
