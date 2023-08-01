import { EmailRequest, MailService } from '@buyby/mail';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSync } from 'aws-sdk';
import { isDataURI } from 'class-validator';
import { database } from 'firebase-admin';
import { Model } from 'mongoose';
import { RequestWithUser } from 'src/core/interfaces';
import { BaseService, Pagination } from 'src/core/shared';
import { ProfileStatusEnum } from 'src/users/enums/profile-status.enum';
import { RolesEnum } from 'src/users/enums/roles.enum';
import { StatusEnum } from 'src/users/enums/status.enum';
import { SubscriptionTypeEnum } from 'src/users/enums/subscription-type.enum';
import { UsersService } from 'src/users/users.service';
import { CreatePackageDto } from './dtos/create-package.dto';
import { SubscriptionSearchOptions } from './dtos/subscription-search-options.dto';
import { UpdatePackageExtraLimitDto } from './dtos/update-package-extra-limit.dto';
import { UpdatePackageTypeDto } from './dtos/update-package-type.dto';
import { UpdatePackageDto } from './dtos/update-package.dto';
import { Subscription, SubscriptionDoc } from './entities/subscribtion.entity';
import { PricingEnum } from './enum/pricing.enum';
import * as Packages from './objects/packages';
import * as pricing from './objects/pricing';

@Injectable()
export class SubscriptionService extends BaseService<SubscriptionDoc> {
  constructor(
    @InjectModel(Subscription.name) readonly m: Model<SubscriptionDoc>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly mailService: MailService,

  ) {
    super(m);
  }

  private  calculatePackagePrice(req: RequestWithUser) {
    const packageLimits = Packages.packages[req.user.subscriptionType];
    const packageExist =  this.findOne({ ownerId: req.user._id });
    if (!packageExist) throw new NotFoundException('084,R084');
    let Pricing = pricing.pricing[req.user.subscriptionType];
    let price = 0;
    let packagePrice = 0;

    if (req.user.pricing == PricingEnum.QUARTERLY) {
      packagePrice = Pricing.quarterly_vat;
    } else {
      packagePrice = Pricing.annually_vat_discount;
    }
    let extraUserPrice = 0;
    if (req.user.extraLimit > 0) {
      if (req.user.pricing == PricingEnum.QUARTERLY) {
        extraUserPrice =
          pricing.pricing.EXTRA_USER.quarterly_vat * req.user.extraLimit;
      } else {
        extraUserPrice =
          pricing.pricing.EXTRA_USER.annually_vat_discount * req.user.extraLimit;
      }
    }

    price = packagePrice + extraUserPrice;
    return price;
  }

  private calculateExpiry(req: RequestWithUser) {
    const packageLimits = Packages.packages[req.user.subscriptionType];
    let Pricing = pricing.pricing[req.user.subscriptionType];
    const date = new Date();
    let expireOn = date;

    if (req.user.pricing == PricingEnum.QUARTERLY) {
      expireOn = new Date(date.setMonth(date.getMonth() + 3));
    } else {
      expireOn = new Date(date.setMonth(date.getMonth() + 12));
    }
    return expireOn;
  }

  private calaculateLimits(req: RequestWithUser) {
    const packageLimits = Packages.packages[req.user.subscriptionType];
    return packageLimits;
  }

  async createPackage(req: RequestWithUser) {

    const packageExist = await this.findOne({ ownerId: req.user._id });
    if (packageExist) throw new BadRequestException('082,R082');

    if (req.user.status == StatusEnum.PENDING) {
      const Package = await this.create({
        ownerId: req.user._id,
        limits: this.calaculateLimits(req),
        extraLimit: req.user.extraLimit,
        price: this.calculatePackagePrice(req),
        expireOn: this.calculateExpiry(req),
        subscriptionType: req.user.subscriptionType,
        pricing: req.user.pricing,
      });
      await this.usersService.updateOne(
        { _id: req.user._id },
        { status: StatusEnum.PAID, packageId: Package._id, price: this.calculatePackagePrice(req) },
        { password: 0 , pin: 0 },
      );
      return Package;
    } else {
      throw new BadRequestException('043,R043');
    }
  }


  async getPackage(id: string) {
    const Package = await this.findOneById(id);
    console.log(Package.ownerId);
    return Package;
  }

  async getMyPackage(req: RequestWithUser) {
    console.log(req.user._id);
    const Package = await this.findOne({ ownerId: req.user._id });
    if (!Package) throw new BadRequestException('017,R017');
    return Package;
  }

  /**
   * update package type and limit
   */
  async upgradeOrDownGradePackage(
    req: RequestWithUser,
    dto: UpdatePackageTypeDto,
  ) {

    const packageLimits = Packages.packages[dto.subscriptionType];
    const packageExist = await this.findOne({ ownerId: req.user._id });
    if (!packageExist) throw new NotFoundException('084,R084');
    let Pricing = pricing.pricing[dto.subscriptionType];
    let price = 0;
    let packagePrice = 0;

    if (dto.pricing == PricingEnum.QUARTERLY) {
      packagePrice = Pricing.quarterly_vat;
    } else {
      packagePrice = Pricing.annually_vat_discount;
    }
    let extraUserPrice = 0;
    if (req.user.extraLimit > 0) {
      if (dto.pricing == PricingEnum.QUARTERLY) {
        extraUserPrice =
          pricing.pricing.EXTRA_USER.quarterly_vat * req.user.extraLimit;
      } else {
        extraUserPrice =
          pricing.pricing.EXTRA_USER.annually_vat_discount * req.user.extraLimit;
      }
    }

    price = packagePrice + extraUserPrice;
    const updatedPackage = await this.update(packageExist._id, {
      limits: packageLimits,
      price: price,
      subscriptionType: dto.subscriptionType,
      pricing: dto.pricing,

    });
    await this.usersService.updateOne(
      { _id: req.user._id },
      { subscriptionType: dto.subscriptionType, pricing: dto.pricing, price: price },
    );

    if (packageLimits.limit < packageExist.users.length) {
      let limit = packageExist.users.length - packageLimits.limit;
      for (let user = 0; user < limit; user++) {
        const updatedUser = await this.usersService.updateOne(
          {
            _id: packageExist.users[user],
          },
          { profileStatus: ProfileStatusEnum.PENDING_ALLOCATE, active: false },
          { password: 0 , pin: 0 },
        );
        await this.update(packageExist._id, { $pull: { users: updatedUser._id } });
      }
    }
    return await this.findOneById(packageExist._id);
  }

  /**
   * update package type and limit
   */
  async renewPackage(req: RequestWithUser) {
    if (req.user.status !== StatusEnum.COMPLETED)
      throw new BadRequestException('140,R140');
    const packageExist = await this.findOne({ ownerId: req.user._id });
    if (!packageExist) throw new NotFoundException('084,R084');
    const date = new Date();
    let expireOn = date;

    if (req.user.pricing == PricingEnum.QUARTERLY) {
      expireOn = new Date(date.setMonth(date.getMonth() + 3));
    } else {
      expireOn = new Date(date.setMonth(date.getMonth() + 12));
    }
    return await this.update(packageExist._id, { expireOn: expireOn, active: true });
  }

  async addUsersToPackage(
    req: RequestWithUser,
    dto: UpdatePackageDto,
  ) {
    const packageLimits = Packages.packages[req.user.subscriptionType];
    if (req.user.status !== StatusEnum.COMPLETED)
      throw new BadRequestException('140,R140');
    const packageExist = await this.findOne({ ownerId: req.user._id });
    if (!packageExist) throw new NotFoundException('084,R084');
    for (let user = 0; user < dto.users.length; user++) {
      if (
        packageExist.users.length >= packageLimits.limit + req.user.extraLimit ||
        dto.users.length > packageLimits.limit + req.user.extraLimit
      )
        throw new BadRequestException(' 057,R057');
      if (
        req.user.role == RolesEnum.MERCHANT &&
        (dto.users[user] == RolesEnum.CHEF ||
          dto.users[user] == RolesEnum.WAITER)
      )
        throw new BadRequestException('155,R155');
      const updatedUser = await this.usersService.updateOne(
        {
          _id: dto.users[user],
        },
        { profileStatus: ProfileStatusEnum.COMPLETED, active: true },
        { password: 0 , pin: 0 },
      );
      await this.update(packageExist._id, { $push: { users: updatedUser._id } });
    }
    return await this.findOneById(packageExist._id);
  }

  async removeUsersFromPackage(
    req: RequestWithUser,
    dto: UpdatePackageDto,
  ) {
    if (req.user.status !== StatusEnum.COMPLETED)
      throw new BadRequestException('140,R140');
    const packageExist = await this.findOne({ ownerId: req.user._id });
    if (!packageExist) throw new NotFoundException('084,R084');
    for (let user = 0; user < dto.users.length; user++) {
      const updatedUser = await this.usersService.updateOne(
        {
          _id: dto.users[user],
        },
        { profileStatus: ProfileStatusEnum.PENDING_ALLOCATE, active: false },
        { password: 0 , pin: 0 },
      );
    }
    return await this.update(packageExist._id, { $pull: { users: { $in: dto.users } } });
  }
  /**
  * updateExtraLimit
  */

  async updateExtraLimit(
    req: RequestWithUser,
    dto: UpdatePackageExtraLimitDto,
  ) {
    const packageLimits = Packages.packages[req.user.subscriptionType];
    const packageExist = await this.findOne({ ownerId: req.user._id });
    if (!packageExist) throw new NotFoundException('084,R084');


    let extraUserPrice = 0;

    let countOfExtraUsers = dto.extraLimit - req.user.extraLimit;

    if (req.user.pricing == PricingEnum.QUARTERLY) {
      extraUserPrice =
        pricing.pricing.EXTRA_USER.quarterly_vat * countOfExtraUsers;
    } else {
      extraUserPrice =
        pricing.pricing.EXTRA_USER.annually_vat_discount * countOfExtraUsers;
    }

    let totalPrice = 0;
    totalPrice = req.user.price + extraUserPrice;

    const updatedPackage = await this.update(packageExist._id, {
      extraLimit: dto.extraLimit,
      price: totalPrice,
    });
    await this.usersService.updateOne(
      { _id: req.user._id },
      {
        extraLimit: dto.extraLimit,
        price: totalPrice,
      },
    );

    if (packageExist.users.length > updatedPackage.extraLimit + packageLimits.limit) {
      let limit = packageExist.users.length - (updatedPackage.extraLimit + packageLimits.limit);
      for (let user = 0; user < limit; user++) {
        const updatedUser = await this.usersService.updateOne(
          {
            _id: packageExist.users[user],
          },
          { profileStatus: ProfileStatusEnum.PENDING_ALLOCATE, active: false },
          { password: 0 , pin: 0 },
        );
        await this.update(packageExist._id, { $pull: { users: updatedUser._id } });
      }
    }
    return await this.findOneById(packageExist._id);
  }

  /**
   * Search subscriptions collection.
   */
  async findAll(options: SubscriptionSearchOptions): Promise<Pagination> {
    const aggregation = [];

    const { dir, offset, size, searchTerm, filterBy, attributesToRetrieve ,filterByDateFrom ,filterByDateTo } =
      options;

    const sort = 'index';

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

    // aggregation.push({
    //   $project: {
    //     password: 0,
    //   },
    // })

    console.log('agg', aggregation);
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
   * Search subscriptions fields.
   */
  private search(aggregation: any, searchTerm: string): void {
    aggregation.push({
      $match: {
        $or: [
          { ownerId: { $regex: new RegExp(searchTerm), $options: 'i' } },
          {
            subscriptionType: { $regex: new RegExp(searchTerm), $options: 'i' },
          },
        ],
      },
    });
  }

  async sendExpiryEmail(email: string, id: string) {
    const emailObject: EmailRequest = {
      to: email,
      from: 'amira.reda@pharaohsoft.com',
      subject: `Alert package expiry`,
      text: `This package with ${id} is expired you should renew it.`,
      html: `This package with ${id} is expired you should renew it.</p>`,
    };

    return await this.mailService.sendEmail(emailObject);
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron3() {
    const subscribtion = await this.findOne({ expireOn: Date.now() });

    if (subscribtion) {
      await this.updateOne(
        {
          _id: subscribtion._id,
        },
        { active: false },
      );
      const owner = await this.usersService.findOne({ _id: subscribtion.ownerId });
      const users = await this.usersService.updateOne({ owner: subscribtion.ownerId }, { profileStatus: ProfileStatusEnum.PENDING_ALLOCATE, active: false },
        { password: 0 , pin: 0 });
      this.sendExpiryEmail(owner.email, subscribtion._id);
    }
  }

  async sendAlertEmail(email: string, id: string) {
    const emailObject: EmailRequest = {
      to: email,
      from: 'amira.reda@pharaohsoft.com',
      subject: `Alert user expiry`,
      text: `This package with ${id} will expire after 7 days please renew it.`,
      html: `This package with ${id} will expire after 7 days please renew it.</p>`,
    };

    return await this.mailService.sendEmail(emailObject);
  }
  // @Cron(CronExpression.EVERY_DAY_AT_10AM)
  @Cron(CronExpression.EVERY_HOUR)
  async handleCron2() {
    let date = new Date();
    const subscribtion = await this.findOne({ expireOn: new Date(date.setDate(date.getDay() + 7)) });
    // const user = await this.findOne({ expireOn:'2022-11-15T09:12:18.666+00:00' });

    if (subscribtion) {
      const owner = await this.usersService.findOne({ _id: subscribtion.ownerId });
      this.sendAlertEmail(owner.email, subscribtion._id);
    }
  }

}
