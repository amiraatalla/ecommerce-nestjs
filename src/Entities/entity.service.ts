import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { RequestWithUser } from 'src/auth/interfaces/user-request.interface';
import { BaseService, Pagination } from 'src/core/shared';
import { generateCode, isWorkingTime } from 'src/core/utils';
import { CustomerService } from 'src/customer/customer.service';
import { ActionsEnum } from 'src/sysLog/enums/actions.enums';
import { SYSLogService } from 'src/sysLog/sysLog.service';
import { RoleGroups, RolesEnum } from 'src/users/enums/roles.enum';
import { StatusEnum } from 'src/users/enums/status.enum';
import { UsersService } from 'src/users/users.service';
import { WarehouseManagementService } from 'src/warehouse-management/warehouse-management.service';
import { CreateEntitiesDto } from './dto/create-entity.dto';
import { EntitiesSearchOptions } from './dto/entity-search-options.dto';
import { UpdateEntitiesDto } from './dto/update-entites.dto';
import { UpdateIsFeaturesDto } from '../stock-item-data/dto/update-is-features.dto';
import { Entities, EntitiesDoc } from './entities/entities.entity';
import { EntityTypeEnum } from './enum/entity-type.enum';

@Injectable()
export class EntitiesService extends BaseService<EntitiesDoc> {
  constructor(
    @InjectModel(Entities.name) readonly m: Model<EntitiesDoc>,
    private readonly sysLogsService: SYSLogService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => WarehouseManagementService))
    private readonly warehouseService: WarehouseManagementService,
    @Inject(forwardRef(() => CustomerService))
    private readonly customerService: CustomerService,
  ) {
    super(m);
  }

  async createEntities(req: RequestWithUser, dto: CreateEntitiesDto) {
    const session = await this.m.startSession();
    let EntitieData;
    let codeInput = (Math.random() + 1).toString(36).substring(7);
    const code = generateCode(codeInput);
    let customerCodeInput = (Math.random() + 1).toString(36).substring(7);
    const customerCode = generateCode(codeInput);
    if (req.user.status !== StatusEnum.PAID)
      throw new BadRequestException('054,R054');
    const EntitiesExist = await this.findOne({
      owner: req.user._id,
      name: dto.name,
    });

    if (EntitiesExist) throw new BadRequestException('053,R053');
    let entityType = '';
    if (req.user.role == RolesEnum.RESTURANT) {
      entityType += EntityTypeEnum.RESTURANT;
    } else if (req.user.role == RolesEnum.MERCHANT) {
      entityType += EntityTypeEnum.STORE;
    }
    try {
      await session.withTransaction(async (): Promise<any> => {

        const warehouse = await this.warehouseService.create(
          {
            owner: req.user._id,
            name: dto.name,
            address: dto.address,
          },
          { session: session },
        );

        const defaultCustomer = await this.customerService.create(
          {
            name: 'Guest',
            owner: req.user._id,
            entityGuestId: this.toObjectId(req.user._id),
            phoneOne: code + '0000000',
            customerCode: customerCode,
            receivePromotionalMessagesOrDiscounts: false,
          },
          { session: session },
        );

        const defaultUser = await this.usersService.create(
          {
            name: 'Guest',
            _id: defaultCustomer._id,
            owner: req.user._id,
            phoneNumber: code + '0000',
            email: code + req.user.email,
            role: RolesEnum.CUSTOMER,
            emailVerified: true,
          },
          { session: session },
        );


        EntitieData = await this.create({
          owner: req.user._id,
          sku: code,
          entityType: entityType,
          warehouseId: warehouse._id,
          guestId: defaultCustomer._id,
          ...dto,
        }, { session: session },
        );
        await this.customerService.updateOne({ _id: this.toObjectId(defaultCustomer._id) },
          { entityGuestId: this.toObjectId(EntitieData._id) });
        await this.usersService.updateOne(
          { _id: req.user._id },
          {
            status: StatusEnum.COMPLETED,
            entityId: EntitieData._id,
            warehouseId: warehouse._id,
            guestId: EntitieData.guestId,
          },
          { password: 0 , pin: 0 },
          { session: session },
        );
      });
      await session.commitTransaction();

      await this.sysLogsService.create({
        userId: req.user._id,
        action: ActionsEnum.CREATE_ENTITIES,
      });

      await this.sysLogsService.create({
        userId: req.user._id,
        action: ActionsEnum.UPDATE_USER,
      });
      await this.sysLogsService.create({
        userId: req.user._id,
        action: ActionsEnum.CREATE_WAREHOUSE,
      });
      await this.sysLogsService.create({
        userId: req.user._id,
        action: ActionsEnum.CREATE_CUSTOMER,
      });

      return EntitieData;
    }
    catch (err) {
            // session.abortTransaction();

      return { "message": "029,R029" };
    }
    finally {
      session.endSession();
    }
  }

  /**
   * Edit Entitiess collection.
   */

  async updateEntities(
    req: RequestWithUser,
    id: string,
    dto: UpdateEntitiesDto,
  ) {
    const EntitiesExist = await this.findOneById(id);
    if (req.user.status == StatusEnum.COMPLETED) {
      if (!EntitiesExist) throw new NotFoundException('055,R055');
      else {
        return await this.update(id, {
          ...dto,
        });
      }
    } else throw new BadRequestException('054,R054');
  }

  /**
 * Edit Entities collection.
 */

  /**
   * Search Entitiess collection.
   */
  async findAll(options: EntitiesSearchOptions): Promise<Pagination> {
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
   * Search Entitiess fields.
   */
  private search(aggregation: any, searchTerm: string): void {
    aggregation.push({
      $match: {
        $or: [
          { owner: { $regex: new RegExp(searchTerm), $options: 'i' } },
          { name: { $regex: new RegExp(searchTerm), $options: 'i' } },
          { address: { $regex: new RegExp(searchTerm), $options: 'i' } },
        ],
      },
    });
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {

    const entities = await this.m.aggregate(
      [{
        $lookup: {
          from: 'users',
          localField: 'owner',
          foreignField: '_id',
          as: 'Owner',
        },
      },]
    );
    for (const en of entities) {
      const worked = isWorkingTime(en.schedule);
      if (worked == true) {
        const updatedEntity = await this.updateMany({ _id: this.toObjectId(en._id) }, { posActive: true });
      } else {
        const updatedEntity = await this.updateMany({ _id: this.toObjectId(en._id) }, { posActive: false });
      }
    }
  }




}
