import { EmailResponse } from '@buyby/mail';
import {
  Injectable,
  InternalServerErrorException,
  ForbiddenException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Response } from 'express';
import { ConfigService } from '../config/config.service';
import { InvalidCredentialsException } from '../core/exceptions';
import { RequestWithUser } from '../core/interfaces';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { SignUpDto, SigninDto, ForgetPasswordDto, ResetPasswordDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

import * as cookieParser from 'cookie-parser';
import cookieSession = require('cookie-session');
import { EmailDto } from 'src/users/dto/email.dto';
import { RoleGroups, RolesEnum } from 'src/users/enums/roles.enum';
import { CustomerSignUpDto } from './dto/customer-sign-up.dto';
import { EntitiesService } from 'src/Entities/entity.service';
import { toObjectId } from 'src/core/utils';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
     private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() =>EntitiesService))
    private readonly entitiesService : EntitiesService
  ) {}




  async signUp(req: RequestWithUser, res: Response, signUpDto: SignUpDto) {
    req.user = await this.usersService.createWithPassword(signUpDto);
    this.addJwtToCookie(req);
    this.addJwtRefreshToCookie(req, res);

    res.send({
      accessToken: req.session.jwt as string,
      refreshToken: req.session.jid as string,
      user: req.user,
    });
  }

  async customerSignUp(req: RequestWithUser, res: Response, signUpDto: CustomerSignUpDto) {
    req.user = await this.usersService.createWithPassword({role:RolesEnum.CUSTOMER,...signUpDto});
  
    
    this.addJwtToCookie(req);
    this.addJwtRefreshToCookie(req, res);
    res.send({
      accessToken: req.session.jwt as string,
      refreshToken: req.session.jid as string,
      user: req.user,
    });
  }

  public async signIn(req: RequestWithUser,res: Response) {
    // if (req.user.emailVerified !== true || req.user.active !== true) throw new BadRequestException("008,R008");
    this.addJwtToCookie(req);
    this.addJwtRefreshToCookie(req, res);

    delete req.user.password;
 
  const data = await  (await this.usersService.findOneById(req.user._id)).populate('entityId');
    
  if (req.user.emailVerified !== true || req.user.active !== true) 
  {
    res.send({
      message: "008,R008",
      user: data
    })
}

    res.send({
      accessToken: req.session.jwt as string,
      refreshToken: req.session.jid as string,
      user: data,
      
    });
  }

  async validateUserPassword({ email,  password }: SigninDto) {
    //  Check user with <email> exists
    const userDoc = 
    await this.usersService.findOne( {email:email} )
    ||await this.usersService.findOne({phoneNumber:email});

    if (!userDoc) {
      throw new InvalidCredentialsException();
    }

    if (!userDoc.password) {
      throw new ForbiddenException('056,R056');
    }

    //  Validate password
    const isValid = await bcrypt.compare(password, userDoc.password);
      
    await userDoc.save();

    if (!isValid) {
      throw new InvalidCredentialsException();
    }

    const user = new User(userDoc.toJSON());
    delete user.password;

    return user;
  }

  async verifyEmail(code: string){

    const user =  await (await this.usersService.verifyEmailToken(code)).toJSON();
    delete user.password;
    return user;
    
  }

  async sendVerifyEmail(emailDto: EmailDto): Promise<EmailResponse> {
    return await this.usersService.sendReverifyEmail(emailDto);
  }

  async forgotPassword(email:string): Promise<EmailResponse> {
    return await this.usersService.sendResetPasswordEmail({email});
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<boolean> {
    return await this.usersService.resetPassword(resetPasswordDto);
  }


  /**
   * Generate a new JWT Access token with payload.
   */
  public generateJwtAccessToken(record: Partial<User>): { accessToken: string } {
    const payload: JwtPayload = { id: record._id };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.jwtAccessTokenSecret,
      expiresIn: this.configService.jwtAccessTokenExpiry,
    });

    return { accessToken };
  }

  /**
   * Generate a new JWT Refresh token with payload.
   */
   public generateJwtRefreshToken(record: Partial<User>): { refreshToken: string } {
     const payload: JwtPayload = { id: record._id };
     const refreshToken = this.jwtService.sign(payload, {
       secret: this.configService.jwtRefreshTokenSecret,
       expiresIn: this.configService.jwtRefreshTokenExpiry,
     });

     return { refreshToken };
   }

   public addJwtToCookie(req: RequestWithUser) {
     try {
       req.session.jwt = this.generateJwtAccessToken(req.user).accessToken;
     } catch (err) {
       throw new InternalServerErrorException(err, 'Problem with cookie-session middleware?');
     }
   }

   public addJwtRefreshToCookie(req: RequestWithUser, res: Response) {
     try {
       const token = this.generateJwtRefreshToken(req.user).refreshToken;
       req.session.jid = token;
       res.cookie('jid', token, { httpOnly: true });
     } catch (err) {
       throw new InternalServerErrorException(err, 'Problem with cookie-session middleware?');
     }
   }




}
