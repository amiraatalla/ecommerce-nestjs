import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/role.decorator';
import { JwtAuthGuard, RoleGuard } from 'src/auth/guards';
import { RequestWithUser } from 'src/auth/interfaces/user-request.interface';
import { RoleGroups } from 'src/users/enums/roles.enum';
import { PayAtFawryDto } from './dto/pay-at-fawry.dto';
import { PaymentService } from './payment.service';

@Controller('payment')
@ApiTags('payment')
export class PaymentController {

    constructor(private readonly paymentService:PaymentService){}



    @Post('me/onboard-business')
    @ApiOperation({ summary: 'Create fawry accounts for your users' })
    @UseGuards(JwtAuthGuard)
    FawryPay3DSCard(@Req() req: RequestWithUser ,@Body() dto: PayAtFawryDto) {
      return this.paymentService.FawryPay3DSCard(req, dto);
    }

    // @Post('/payment')
    // @ApiBody({type:PaymentDto})
    // payment(@Body() dto: PaymentDto){
    //     return this.paymentService.FawryPayRefundPayment(dto.referenceNumber, dto.refundAmount, dto.reason);
    // }


}
