import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '../../config/config.service';
import { UsersService } from '../../users/users.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        extractJwtFromCookie,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.jwtAccessTokenSecret,
    });
  }

  async validate(payload: JwtPayload) {
    const { id } = payload;
    try {
      return await this.usersService.findOneById(id);
    } catch (error) {
     throw new UnauthorizedException('003,R003');
    }
  }
}

export function extractJwtFromCookie(req: Request): string {
  return req?.session?.jwt|| req?.cookies?.jwt || null;
}
