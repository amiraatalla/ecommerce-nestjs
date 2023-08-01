import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/role.decorator';
import { JwtAuthGuard, RoleGuard } from 'src/auth/guards';
import { RequestWithUser } from 'src/auth/interfaces/user-request.interface';
import { RoleGroups } from 'src/users/enums/roles.enum';
import { CreateEtisalatSMS } from './dto/etisalat-sms.dto';
import { EtisalatSMS } from './entities/etisalat-sms.entity';
import { EtisalatSMSService } from './etisalat-sms.service';

@Controller('etisalat-sms')
@ApiTags('etisalat-sms')
export class EtisalatSMSController {

  constructor(private readonly EtisalatSMSService: EtisalatSMSService) { }

  @Post('me')
  @ApiOperation({ summary: 'etisalat sms' })
  @UseGuards(JwtAuthGuard)
  EtisalatSMS(@Req() req: RequestWithUser, @Body() dto: CreateEtisalatSMS) {
    return this.EtisalatSMSService.EtisalatSMS(req, dto);
  }

}
