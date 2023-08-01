import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/core/shared';
import { InjectModel } from '@nestjs/mongoose';
// import { createToken } from 'src/core/utils';
import { Model } from 'mongoose';
import { EmailToken } from './entities/email-token.entity';

@Injectable()
export class TokenService extends BaseService<EmailToken> {
  constructor(@InjectModel(EmailToken.name) readonly tokenModel: Model<EmailToken>) {
    super(tokenModel);
  }

  async refreshExistingToken(existingToken: EmailToken): Promise<EmailToken> {
    const { code, expirationDate } = await this.create(
      existingToken.userId,
      existingToken.type,
    );

    return await this.update(existingToken._id, {
      code,
      expirationDate,
    });
  }
}
