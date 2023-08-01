import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { Types } from 'mongoose';
import { ConfigService } from '../../config/config.service';
import { UsersService } from '../../users/users.service';
import { extractJwtFromCookie, JwtStrategy } from './jwt.strategy';

jest.mock('../../config/config.service');
jest.mock('../../users/users.service');

const payload = {
  id: Types.ObjectId().toHexString(),
};

const mockUser: any = {
  _id: payload.id,
};

describe('JWT Strategy', () => {
  let jwtStrategy: JwtStrategy;
  let configService;
  let usersService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: ConfigService,
          useValue: {
            jwtSecret: jest.fn().mockReturnValue('secret'),
          },
        },
      ],
    }).compile();

    configService = module.get<ConfigService>(ConfigService);
    usersService = module.get<UsersService>(UsersService);
    jwtStrategy = new JwtStrategy(configService, usersService);
  });

  it('should be defined', () => {
    expect(jwtStrategy).toBeDefined();
  });

  it('validate should return user partial', async () => {
    usersService.findOneById.mockResolvedValueOnce(mockUser);

    const result = await jwtStrategy.validate(payload);

    expect(result).toEqual(mockUser);
  });

  describe('extractJwtFromCookie', () => {
    it('should return jwt', () => {
      const req = {
        session: {
          jwt: 'mock.jwt',
        },
      };

      const result = extractJwtFromCookie((req as unknown) as Request);

      expect(result).toBe(req.session.jwt);
    });

    it('should return null on undefined req', () => {
      const req = undefined;

      const result = extractJwtFromCookie(req as Request);

      expect(result).toBeNull();
    });

    it('should return null on undefined session', () => {
      const req = {
        session: undefined,
      };

      const result = extractJwtFromCookie(req as Request);

      expect(result).toBeNull();
    });
  });
});
