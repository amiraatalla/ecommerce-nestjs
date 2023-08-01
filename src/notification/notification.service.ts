import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseService, SearchOptions, Pagination } from 'src/core/shared';
import { FireBaseService } from 'src/firebase/firebase.service';
import { UsersService } from 'src/users/users.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationDoc, Notification } from './entities/notification.entity';

@Injectable()
export class NotificationService extends BaseService<NotificationDoc> {
  constructor(
    @InjectModel(Notification.name) readonly m: Model<NotificationDoc>,
    private readonly fireBaseService: FireBaseService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {
    super(m);
  }

  /*
   *
   */
  async createNotification(dto: CreateNotificationDto) {
    const response = await this.fireBaseService.sendNotification(dto);
    console.log("response",response);

    const successToken = response?.notificationStatus?.responses.find(
      (e) => e.success == true,
    );
    console.log('successToken', successToken);

    if (successToken?.success == true) {
      this.create({
        userId: this.toObjectId(response.userId),
        notificationData: {
          title: dto.notificationData.title,
          body: dto.notificationData.body,
          imageUrl: dto.notificationData?.imageUrl,
        },
      });
      return { success: true };
    }
    return { success: false };
  }


  async createAlertNotification(
    id,
    warehouseName: string,
    stockitemName: string,
    reOrderPoint: number,
    qtyOnHand: number,
    qtyToOrder: number,
  ) {
    const response = await this.fireBaseService.sendAlertNotification(
      id,
      warehouseName,
      stockitemName,
      reOrderPoint,
      qtyOnHand,
      qtyToOrder,
    );
    // const successToken = response?.notificationStatus?.responses.find(
    //   (e) => e.success == true,
    // );
    // console.log('successToken', successToken);

    // if (successToken?.success == true) {
    //   this.create({
    //     userId: this.toObjectId(response.id),
    //     notificationData: {
    //       name: stockitemName,
    //       description: `The ${warehouseName} warehouse has a shortage of ${stockitemName} with quantity ${qtyOnHand}.
    //       It reached the re-order point of ${reOrderPoint} and the quantity to order is ${qtyToOrder}`,
    //     },
    //   });
    //   return { success: true };
    // }
    // return { success: false };
  }
  
  async createExpiryNotification(
    id,
    warehouseName: string,
    stockItemName: string,
    qtyToExpire: number,
  ) {
    const response = await this.fireBaseService.sendExpiryNotification(
      id,
      warehouseName,
      stockItemName,
      qtyToExpire,
    );
    const successToken = response?.notificationStatus?.responses.find(
      (e) => e.success == true,
    );
    console.log('successToken', successToken);

    if (successToken?.success == true) {
      this.create({
        userId: this.toObjectId(response.id),
        notificationData: {
          title: `Stock item ${stockItemName} about to expire`,
          body: `The ${stockItemName} in ${warehouseName} warehouse has a quantity of ${qtyToExpire} about to expire.`,
        },
      });
      return { success: true };
    }
    return { success: false };
  }

  /**
   * Search Notification collection.
   */
  async findAll(options: SearchOptions, userId?: string): Promise<Pagination> {
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

    if (userId) {
      aggregation.push({ $match: { userId: this.toObjectId(userId) } });
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

  /**
   * Search Notification fields.
   */
  private search(aggregation: any, searchTerm: string): void {
    aggregation.push({
      $match: {
        $or: [{ userId: { $regex: new RegExp(searchTerm), $options: 'i' } }],
      },
    });
  }
}
