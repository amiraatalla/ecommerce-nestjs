import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RequestWithUser } from 'src/auth/interfaces/user-request.interface';
import { BaseService, Pagination } from 'src/core/shared';
import { generateCode } from 'src/core/utils';
import { ActionsEnum } from 'src/sysLog/enums/actions.enums';
import { SYSLogService } from 'src/sysLog/sysLog.service';
import { RolesEnum } from 'src/users/enums/roles.enum';
import { StatusEnum } from 'src/users/enums/status.enum';
import { UsersService } from 'src/users/users.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CustomerSearchOptions } from './dto/customer-search-options.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer, CustomerDoc } from './entities/customer.entity';

@Injectable()
export class CustomerService extends BaseService<CustomerDoc> {
  constructor(
    @InjectModel(Customer.name) readonly m: Model<CustomerDoc>,
    private readonly sysLogsService: SYSLogService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {
    super(m);
  }

  async createCustomer(req: RequestWithUser, dto: CreateCustomerDto) {
    const session = await this.m.startSession();
    let result;
    let codeInput = (Math.random() + 1).toString(36).substring(7);
    const code = generateCode(codeInput);
    if (req.user.status !== StatusEnum.COMPLETED)
      throw new BadRequestException('140,R140');

    try {
      await session.withTransaction(async (): Promise<any> => {

        const CustomerExist = await this.findOne({
          owner: { $in: [req.user._id] },
          phoneOne: dto.phoneOne,
        });
        if (CustomerExist) throw new BadRequestException('139,R139');

        const customer = await this.findOne({
          owner: { $nin: [req.user._id] },
          phoneOne: dto.phoneOne,
        });
        if (customer) {

          return await this.updateOne(
            { phoneOne: dto.phoneOne },
            { $push: { owner: req.user._id } }
            , { session: session }
          );
        }

        result = await this.create({
          owner: req.user._id,
          customerCode: code,
          ...dto,
        }, { session: session });
        console.log("res", result);


        await this.usersService.create({
          _id: result._id,
          owner: req.user._id,
          phoneNumber: dto.phoneOne,
          email: code + req.user.email,
          role: RolesEnum.CUSTOMER
        },
         { session: session });

      });
      await session.commitTransaction();

      this.sysLogsService.create({
        userId: req.user._id,
        action: ActionsEnum.CREATE_CUSTOMER,
      });
      this.sysLogsService.create({
        userId: req.user._id,
        action: ActionsEnum.UPDATE_CUSTOMER,
      });

      return result;
    }
    catch (err) {
            // session.abortTransaction();

      return { "message": "031,R031" };
    }
    finally {
      session.endSession();
    }
  }


  /**
   * Edit Customers collection.
   */

  async findCustomer(req: RequestWithUser, id: string) {
    const customer = await this.findOneById(id);
    if (!customer) throw new NotFoundException('091,R091');
    this.sysLogsService.create({
      userId: req.user._id,
      action: ActionsEnum.GET_CUSTOMER,
    });
    return customer;
  }

  async findMyDefaultCustomer(req: RequestWithUser) {
  //   let id;
  //   if (req.user.role == RolesEnum.CASHIER) {
  //     id = req.user.owner
  //  } else {
  //     id = req.user._id
  //  }
      // const owner = await this.usersService.findOne({ _id: this.toObjectId(req.user._id) });
     
      const customer = await this.findOne({ _id: req.user.guestId});
    

    if (!customer) throw new NotFoundException('091,R091');
    this.sysLogsService.create({
      userId: req.user._id,
      action: ActionsEnum.GET_CUSTOMER,
    });
    return customer;
  }

  /**
   * Edit Customers collection.
   */

  async updateCustomer(
    req: RequestWithUser,
    id: string,
    dto: UpdateCustomerDto,
  ) {
    if (req.user.status !== StatusEnum.COMPLETED)
      throw new BadRequestException('140,R140');
    const CustomerExist = await this.findOne({
      owner: { $in: [req.user._id] },
      _id: this.toObjectId(id),
    });
    if (!CustomerExist) throw new NotFoundException('091,R091');
    else {
      this.sysLogsService.create({
        userId: req.user._id,
        action: ActionsEnum.UPDATE_CUSTOMER,
      });
      return await this.update(id, {
        ...dto,
      });
    }
  }

  /**
   * Search Customers collection.
   */
  async findAll(
    owner: Types.ObjectId,
    options: CustomerSearchOptions,
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
    aggregation.push({ $match:  {owner} });

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
   * Search Customers fields.
   */
  private search(aggregation: any, searchTerm: string): void {
    aggregation.push({
      $match: {
        $or: [
          { owner: { $regex: new RegExp(searchTerm), $options: 'i' } },
          { name: { $regex: new RegExp(searchTerm), $options: 'i' } },
          { phoneOne: { $regex: new RegExp(searchTerm), $options: 'i' } },
          { phoneTwo: { $regex: new RegExp(searchTerm), $options: 'i' } },
        ],
      },
    });
  }
}
