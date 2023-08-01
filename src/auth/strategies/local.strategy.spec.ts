import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { LocalStrategy } from './local.strategy';

jest.mock('../auth.service');

const credentials = {
  email: 'test@test.com',
  password: 'TestPassword',
};

describe('Local Strategy', () => {
  let localStrategy: LocalStrategy;
  let authService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    localStrategy = new LocalStrategy(authService);
  });

  it('should be defined', () => {
    expect(localStrategy).toBeDefined();
  });

  it('validate should call authService.validateUserPassword and return user with valid credentials', async () => {
    authService.validateUserPassword.mockResolvedValueOnce(credentials);
    const result = await localStrategy.validate(credentials.email, credentials.password);
    expect(authService.validateUserPassword).toHaveBeenCalledWith(credentials);
    expect(authService.validateUserPassword).toHaveBeenCalledTimes(1);
    expect(result).toEqual(credentials);
  });

  it('validate should call authService.validateUserPassword and throw UnauthorizedException with invalid credentials', async () => {
    authService.validateUserPassword.mockResolvedValueOnce(undefined);
    const error = await localStrategy
      .validate(credentials.email, credentials.password)
      .catch((e) => e);
    expect(authService.validateUserPassword).toHaveBeenCalledWith(credentials);
    expect(authService.validateUserPassword).toHaveBeenCalledTimes(1);
    expect(error).toEqual(new UnauthorizedException('003,R003'));
  });
});
