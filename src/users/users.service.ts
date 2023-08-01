import {
  BadRequestException,
  forwardRef,
  GoneException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { BaseService, Pagination } from 'src/core/shared';
import { UserDoc, User } from './entities/user.entity';
import { SignUpDto } from '../auth/dto/sign-up.dto';
import {
  EmailTakenException,
  RecordNotFoundException,
} from 'src/core/exceptions';
import { EmailRequest } from 'libs/mail/src';
import { ConfigService } from 'src/config/config.service';
import { EmailToken, EmailTokenDoc } from './entities/email-token.entity';
import { ForgetPasswordDto } from 'src/auth/dto/forget-password.dto';
import { ResetPasswordDto } from 'src/auth/dto';
import { isStillValid, toObjectId } from 'src/core/utils';
import { UserSearchOptions } from './dto/user-search-options.dto';
import { ActionsEnum } from 'src/sysLog/enums/actions.enums';
import { SYSLogService } from 'src/sysLog/sysLog.service';
import { TokenService } from './token.service';
import { MailService } from '@buyby/mail/mail.service';
import { TokenType } from './enums/token-type.enum';
import { ChangeEmailDto } from './dto/change-email.dto';
import { EmailDto } from './dto/email.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDeviceTokenDto } from './dto/update-user-device-token.dto';
import { CreateProfileDto } from './dto/create-profile.dto';
import { RequestWithUser } from 'src/core/interfaces';
import { StatusEnum } from './enums/status.enum';
import { RolesEnum } from './enums/roles.enum';
import { SubscriptionService } from 'src/subscribtion/subscribtion.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { DeactiveUserDto } from './dto/deactive-user.dto';
import { SubscriptionTypeEnum } from './enums/subscription-type.enum';
import * as Packages from '../subscribtion/objects/packages';
import * as pricing from '../subscribtion/objects/pricing';
import { PricingEnum } from 'src/subscribtion/enum/pricing.enum';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ProfileStatusEnum } from './enums/profile-status.enum';
import { AuthService } from 'src/auth/auth.service';
import { UpdateCustomerPromotionalDto } from './dto/Update-customer-promotional.dto';
import { CartService } from 'src/cart/cart.service';
import * as bcrypt from 'bcryptjs';
import { UpdatePinDto } from './dto/Update-pin.dto';

@Injectable()
export class UsersService extends BaseService<UserDoc> {
  constructor(
    @InjectModel(User.name) readonly m: Model<UserDoc>,
    @InjectModel(EmailToken.name) readonly emailToken: Model<EmailToken>,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly sysLogsService: SYSLogService,
    private readonly tokenService: TokenService,
    @Inject(forwardRef(() => SubscriptionService))
    private readonly subscriptionService: SubscriptionService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    @Inject(forwardRef(() => CartService))
    private readonly cartService: CartService,
  ) {
    super(m);
  }

  /**
   *phone number is confirmed
   */
  // markPhoneNumberAsConfirmed(userId: string) {
  //   return this.updateOne({ _id: userId }, {
  //     isPhoneNumberConfirmed: true
  //   });
  // }

  async me(req: RequestWithUser): Promise<User> {
    const user = await (await this.findOneById(req.user._id, { password: 0, pin: 0 })).populate('entityId');
    if (!user) throw new NotFoundException('022,R022');
    return user;
  }

  async myUser(req: RequestWithUser, id: string) {
    const user = await this.findOne(
      { _id: toObjectId(id), owner: req.user._id },
      { password: 0, pin: 0 },
    );
    if (!user) throw new NotFoundException('022,R022');
    return user;
  }

  async myUsers(req: RequestWithUser) {
    return await this.find({ owner: req.user._id }, { password: 0, pin: 0 });
  }

  // deleteUser(id: string): Promise<boolean> {

  //   this.sysLogsService.create({
  //     userId: id,
  //     action: ActionsEnum.DELETE_USER,
  //   });

  //   return this.remove(id);
  // }

  async updateMe(req: RequestWithUser, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOneById(req.user._id, { password: 0, pin: 0 });
    if (!user) throw new NotFoundException('022,R022');

    this.sysLogsService.create({
      userId: req.user._id,
      action: ActionsEnum.UPDATE_USER,
    });
    let checkPhone;
    if (dto.phoneNumber !== user.phoneNumber) {
      checkPhone = await this.findOne({ phoneNumber: dto.phoneNumber, _id: { $ne: req.user._id } }, { password: 0, pin: 0 });
      console.log("check", checkPhone);
    }
    if (!checkPhone) {
      const updatedData = await this.update(req.user._id, dto, { password: 0, pin: 0 });
      if (updatedData) return updatedData;
      else throw new BadRequestException("014,R014")
    } else throw new BadRequestException("037,R037");
  }

  async updateMyUser(req: RequestWithUser, id: string, dto: UpdateUserDto) {
    const user = await this.findOne(
      { _id: toObjectId(id), owner: req.user._id },
      { password: 0, pin: 0 },
    );
    console.log(user);

    if (!user) throw new NotFoundException('022,R022');
    else {
      this.sysLogsService.create({
        userId: req.user._id,
        action: ActionsEnum.UPDATE_USER,
      });

      let checkPhone;
      if (dto.phoneNumber !== user.phoneNumber) {
        checkPhone = await this.findOne({ phoneNumber: dto.phoneNumber, _id: { $ne: req.user._id } }, { password: 0, pin: 0 });
        console.log("check", checkPhone);
      }
      if (!checkPhone) {
        const updatedData = await this.update(id, dto, { password: 0, pin: 0 });
        if (updatedData) return updatedData;
        else throw new BadRequestException("014,R014")
      } else throw new BadRequestException("037,R037");
    }
  }

  async updateCustomerPromotional(req: RequestWithUser, id: string, dto: UpdateCustomerPromotionalDto) {
    const user = await this.findOne(
      { _id: toObjectId(id), role: RolesEnum.CUSTOMER },
      { password: 0, pin: 0 },
    );
    console.log(user);

    if (!user) throw new NotFoundException('022,R022');
    else {
      this.sysLogsService.create({
        userId: req.user._id,
        action: ActionsEnum.UPDATE_USER,
      });

      return await this.update(id, dto, { password: 0, pin: 0 });
    }
  }

  async updateMyPin(req: RequestWithUser, dto: UpdatePinDto) {

    this.sysLogsService.create({
      userId: req.user._id,
      action: ActionsEnum.UPDATE_USER,
    });
    return await this.update(req.user._id, dto, { password: 0, pin: 0 });

  }

  /**
   * Creates a new unique user with email and a password.
   * @param signUpDto
   */
  async createWithPassword(signUpDto: CreateUserDto) {
    const exists = await this.findOne({
      email: signUpDto.email,
    });
    if (exists) {
      throw new BadRequestException('001,R001');
    }

    let type;
    if (signUpDto.role == RolesEnum.CUSTOMER) {
      type = 'CUSTOMER';
    }
    else if (signUpDto.role == RolesEnum.MERCHANT) {
      type = 'BUSINESS';
    }
    else if (signUpDto.role == RolesEnum.RESTURANT) {
      type = 'BUSINESS';
    }
    let hash;
    if (type == 'BUSINESS') {


    }

    const user = await this.create({ type: type, ...signUpDto });
    if (!user) throw new BadRequestException("030,R030");
    //create logs
    console.log("user", user);

    this.sysLogsService.create({
      userId: user._id,
      action: ActionsEnum.CREATE_USER,
    });
   
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, pin, ...data } = user.toJSON();
    const tokenData = await this.emailToken.create({ userId: user._id, type: TokenType.EMAIL_VERIFICATION_TOKEN });
    
    const token = tokenData.code;
    this.mailService.sendSignUpMail(user.email, token);
    return data as User;
  }

  /**
   * send re-verify user  email
   */
  async sendReverifyEmail(emailDto: EmailDto) {
    //find user
    const user = await this.findOne({
      email: emailDto.email,
    });

    if (!user) {
      throw new RecordNotFoundException('002,R002');
    }

    if (user.emailVerified == true) throw new BadRequestException('080,R080');

    const tokenData = await this.emailToken.create({ userId: user._id, type: TokenType.EMAIL_REVERIFICATION_TOKEN });
    // let accessToken = await this.tokenService.create({
    //   ...tokenData,
    //   token: tokenData.code,
    // });
    const token = tokenData.code;

    // const token = `${this.configService.appUrl}/auth/reverify-user?code=${accessToken.code}`;

    //Send verification email
    return this.mailService.sendReVerifyMail(user.email, token);
  }

  /**
   * Creates a new random code and email it to the user.
   * @param {ForgetPasswordDto} dto
   */
  async sendResetPasswordEmail(emailDto: ForgetPasswordDto) {
    //find user
    const user = await this.findOne({
      email: emailDto.email,
    });

    if (!user) {
      throw new RecordNotFoundException('002,R002');
    }

    if (user.emailVerified != true) throw new BadRequestException('081,R081');

    const tokenData = await this.emailToken.create({ userId: user._id, type: TokenType.EMAIL_REVERIFICATION_TOKEN });
    // let accessToken = await this.tokenService.create({
    //   ...tokenData,
    //   token: tokenData.code,
    // });
    const token = tokenData.code;


    //Send verification email
    return this.mailService.sendForgotPasswordMail(user.email, token);
  }

  /**
   * users change email
   */
  async userChangeEmail(dto: ChangeEmailDto) {
    const { email, userId } = dto;

    //Find user
    const user = await this.findOneById(userId);
    if (!user) throw new BadRequestException('001,R001');

    //Check email availability
    const exist = await this.findOne({ email });
    if (exist) throw new BadRequestException('001,R001');

    //Update user with the new email
    await user.updateOne({ email, emailVerified: false });
    const tokenData = await this.emailToken.create({ userId: user._id, type: TokenType.EMAIL_VERIFICATION_TOKEN });
    // let accessToken = await this.tokenService.create({
    //   ...tokenData,
    //   token: tokenData,
    // });

    const token = `${this.configService.appUrl}/auth/verify?code=${tokenData.code}`;

    // Send verification email
    this.mailService.sendSignUpMail(user.email, token);

    return 'email was changed, please check your mail for verification link';
  }

  /**
   * Update user's password.
   * @param {ResetPasswordDto} resetPasswordDto
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.verifyCode(resetPasswordDto.code);
    user.password = resetPasswordDto.newPassword;
    await user.save();

    return true;
  }

  /**
   * Verifies the code coming from the user in case of email verification.
   * @param {String} code
   */
  async verifyEmailToken(code: string) {
    const token = await this.emailToken.findOne({ code });
    if (token) {
      const user = await this.findOneById(token.userId);
      if (isStillValid(token.createdAt)) {
        await token.remove();
        const entity = new User(user.toJSON());
        let entityId = this.toObjectId("637f4dcf3ad3404a931a58d7");
        console.log("user", user._id);

        let cartItems = [];
        let customerId = this.toObjectId(user._id);

        let cartData = {
          entityId: entityId,
          customerId: customerId,
          cartItems: cartItems,
        }
        if (user.role == RolesEnum.CUSTOMER) {
          await this.cartService.createCart(user._id, cartData);
        }
        if (
          user.role == RolesEnum.MERCHANT ||
          user.role == RolesEnum.RESTURANT
        ) {
          return await this.update(user._id, {
            emailVerified: true,
            status: StatusEnum.PENDING,
          });
        } else {
          return await this.update(user._id, { emailVerified: true });
        }
      } else {
        await token.remove();
        throw new GoneException('token is failed');
      }
    }

    throw new UnauthorizedException('003,R003');
  }

  /**
   * Verifies the code coming from the user is valid and not expired.
   * @param {String} code
   */
  async verifyCode(code: string) {
    const token = await this.emailToken.findOne({ code });
    if (token) {
      if (isStillValid(token.createdAt)) {
        await token.remove();
        return await this.findOneById(token.userId);
      } else {
        await token.remove();
        throw new GoneException();
      }
    }

    throw new UnauthorizedException('003,R003');
  }

  async findMyActiveUsers(
    options: UserSearchOptions,
    req: RequestWithUser,
  ): Promise<Pagination> {
    const aggregation = [];

    const { dir, offset, size, searchTerm, filterBy, attributesToRetrieve, filterByDateFrom, filterByDateTo } =
      options;

    const sort = 'index';

    aggregation.push({$match: { name: { $ne: 'Guest' }}})

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
    aggregation.push({
      $match: {
        $and: [{ owner: { $eq: req.user._id } },
        { active: { $eq: true } }
        ],
      },
    });

    aggregation.push({
      $project: {
        password: 0,
        pin: 0,
      },
    });

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


    // let contentList = [];
    // let countList = 0;
    // for (const data in result.content) {
    //   if (result.content[data].active == true) {
    //     contentList.push(result.content[data]);
    //     countList += 1;
    //   }
    // }
    // return { "count": countList, "content": contentList };
  }
  async findMyDeActiveUsers(
    options: UserSearchOptions,
    req: RequestWithUser,
  ): Promise<Pagination> {
    const aggregation = [];

    const { dir, offset, size, searchTerm, filterBy, attributesToRetrieve, filterByDateFrom, filterByDateTo } =
      options;
      aggregation.push({$match: { name: { $ne: 'Guest' }}})


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
    aggregation.push({
      $match: {
        $and: [{ owner: { $eq: req.user._id } },
        { active: { $eq: false } }
        ],
      },
    });

    aggregation.push({
      $project: {
        password: 0,
        pin: 0,
      },
    });

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

    // let contentList = [];
    // let countList = 0;
    // for (const data in result.content) {
    //   if (result.content[data].active == false) {
    //     contentList.push(result.content[data]);
    //     countList += 1;
    //   }
    // }
    // return { "count": countList, "content": contentList };
  }

  /**
   * Search users collection.
   */
  async findAll(options: UserSearchOptions): Promise<Pagination> {
    const aggregation = [];

    const { dir, offset, size, searchTerm, filterBy, attributesToRetrieve, filterByDateFrom, filterByDateTo } =
      options;

      aggregation.push({$match: { name: { $ne: 'Guest' }}})

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

    aggregation.push({
      $project: {
        password: 0,
        pin: 0,
      },
    });

    return await this.aggregate(aggregation, offset, size);
  }


  /**
    * Search Business Owners collection.
    */
  async findAllBusinessOwners(options: UserSearchOptions): Promise<Pagination> {
    const aggregation = [];

    const { dir, offset, size, searchTerm, filterBy, attributesToRetrieve, filterByDateFrom, filterByDateTo } =
      options;

    const sort = 'index';

    // if(user.role == RolesEnum.MERCHANT ||user.role == RolesEnum.RESTURANT){
    //   aggregation.push(user);
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

    aggregation.push({
      $project: {
        password: 0,
        pin: 0,
      },
    });

    const result = await this.aggregate(aggregation, offset, size);
    // result.content = [];
    // for(const user in result.content){
    //   if(result.content[user].role == RolesEnum.RESTURANT ||result.content[user].role == RolesEnum.MERCHANT){
    //     aggregation.push(result.content[user]);
    //   }
    // } 
    return result;
  }
  /**
   * Search users fields.
   */
  private search(aggregation: any, searchTerm: string): void {
    aggregation.push({
      $match: {
        $or: [
          { name: { $regex: new RegExp(searchTerm), $options: 'i' } },
          { email: { $regex: new RegExp(searchTerm), $options: 'i' } },
          { role: { $regex: new RegExp(searchTerm), $options: 'i' } },

        ],
      },
    });
  }

  /**
   * update user device token
   */
  async updateUserDeviceToken(id: string, dto: UpdateUserDeviceTokenDto) {
    //check if device token assign to another user
    const userDeviceToken: any = await this.findOne({
      devicesToken: dto.deviceToken,
    });
    // //if device token assign to another user
    if (userDeviceToken) {
      //remove from another user data
      await this.updateOne(
        { _id: this.toObjectId(userDeviceToken._id) },
        { $pull: { devicesToken: dto.deviceToken } },
      );
      //set to current user
      return await this.update(
        id,
        { $addToSet: { devicesToken: dto.deviceToken } },
        { devicesToken: 0, password: 0 },
      );
    } else {
      //  set device token to user
      return await this.update(
        id,
        { $addToSet: { devicesToken: dto.deviceToken } },
        { devicesToken: 0, password: 0 },
      );
    }

  }

  async deactiveUser(req: RequestWithUser, id: string, dto: DeactiveUserDto) {
    this.sysLogsService.create({
      userId: req.user._id,
      action: ActionsEnum.UPDATE_USER,
    });

    const userIds = [];
    const user = await this.findOneById(toObjectId(id), { password: 0, pin: 0 });
    const myUsers = await this.find({ owner: toObjectId(id) }, { password: 0, pin: 0 });
    console.log('user', user, 'myUsers', myUsers);

    if (!user) throw new NotFoundException('user not fount');
    else {
      if (myUsers) {
        myUsers.forEach(async (e) => userIds.push(e._id));
      }
      console.log('ids', userIds);

      if (userIds) {
        await this.updateMany({ _id: { $in: userIds } }, dto, { password: 0, pin: 0 });
      }
      const updatedUser = await this.update(id, dto, { password: 0, pin: 0 });
      return updatedUser;
    }
  }


  async createProfile(
    req: RequestWithUser,
    dto: CreateProfileDto,
  ) {
    if (req.user.status != StatusEnum.COMPLETED) {
      throw new BadRequestException('227,R227');
    }
    const packageExist = await this.subscriptionService.findOne({
      ownerId: req.user._id,
    });

    if (!packageExist) throw new BadRequestException('058,R058');
    const packageLimits = Packages.packages[req.user.subscriptionType];
    if (
      packageExist.users.length >=
      packageLimits.limit + req.user.extraLimit
    )
      throw new BadRequestException(' 057,R057');

    const exist = await this.findOne({
      email: dto.email,
    });

    if (exist) {
      throw new EmailTakenException();
    }
    if (
      req.user.role == RolesEnum.MERCHANT &&
      (dto.role == RolesEnum.CHEF || dto.role == RolesEnum.WAITER)
    )
      throw new BadRequestException('155,R155');

    const date = new Date();
    let expireOn = date;

    if (req.user.pricing == PricingEnum.QUARTERLY) {
      expireOn = new Date(date.setMonth(date.getMonth() + 3));
    } else {
      expireOn = new Date(date.setMonth(date.getMonth() + 12));
    }
    console.log("req.user.guestId", req.user.guestId, req.user.entityId);

    const user = await this.create({
      owner: req.user._id,
      expireOn: expireOn,
      emailVerified: true,
      status: StatusEnum.COMPLETED,
      entityId: req.user.entityId,
      warehouseId: req.user.warehouseId,
      guestId: req.user.guestId,
      profileStatus: ProfileStatusEnum.COMPLETED,
      ...dto,
    });
    await this.subscriptionService.updateOne(
      { ownerId: req.user._id },
      { $push: { users: user._id } },
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...data } = user.toJSON();
    this.authService.addJwtToCookie(req);
    return { accessToken: req.session.jwt, user: data as User }
  }

  async sendExpiryEmail(email: string, id: string) {
    const emailObject: EmailRequest = {
      to: email,
      from: 'amira.reda@pharaohsoft.com',
      subject: `Alert user expiry`,
      text: `This user with ${id} is expired you should renew him.`,
      html: `This user with ${id} is expired you should renew him.</p>`,
    };

    return await this.mailService.sendEmail(emailObject);
  }

  @Cron(CronExpression.EVERY_2_HOURS)
  async handleCron3() {
    const user = await this.findOne({ expireOn: Date.now() });

    if (user) {
      await this.updateOne(
        {
          _id: user._id,
        },
        { profileStatus: ProfileStatusEnum.PENDING_ALLOCATE, active: false },
        { password: 0, pin: 0 },
      );
      const owner = await this.findOne({ _id: user.owner });
      this.sendExpiryEmail(owner.email, user._id);
    }
  }

  async sendAlertEmail(email: string, id: string) {
    const emailObject: EmailRequest = {
      to: email,
      from: 'amira.reda@pharaohsoft.com',
      subject: `Alert user expiry`,
      text: `This user with ${id} will expire after 7 days please renew him.`,
      html: `This user with ${id} will expire after 7 days please renew him.</p>`,
    };

    return await this.mailService.sendEmail(emailObject);
  }
  // @Cron(CronExpression.EVERY_DAY_AT_10AM)
  @Cron(CronExpression.EVERY_HOUR)
  async handleCron2() {
    let date = new Date();
    // const user = await this.findOne({ expireOn: new Date(date.setDate(date.getDay() + 7)) });
    const user = await this.findOne({ expireOn: '2022-11-15T09:12:18.666+00:00' });

    // console.log(" new Date(date.setDate(date.getDay() + 7)) ",new Date(date.setDate(date.getDay() + 7)) );
    if (user) {
      const owner = await this.findOne({ _id: user.owner });
      this.sendAlertEmail(owner.email, user._id);
    }
  }


  async renewUser(req: RequestWithUser, id: string) {
    if (req.user.status !== StatusEnum.COMPLETED)
      throw new BadRequestException('140,R140');
    const packageExist = await this.findOneById(id);
    if (!packageExist) throw new NotFoundException('084,R084');
    const date = new Date();
    let expireOn = date;

    if (req.user.pricing == PricingEnum.QUARTERLY) {
      expireOn = new Date(date.setMonth(date.getMonth() + 3));
    } else {
      expireOn = new Date(date.setMonth(date.getMonth() + 12));
    }
    return await this.update(id, { expireOn: expireOn, profileStatus: ProfileStatusEnum.COMPLETED, active: true });
  }

}
