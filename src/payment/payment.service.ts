import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { sha256 } from 'js-sha256';
import axios from 'axios';
import { ConfigService } from 'src/config/config.service';
import { RequestWithUser } from 'src/core/interfaces';
import { BaseService } from 'src/core/shared';
import { Payment, PaymentDoc } from './entities/payment.entity';
import { InjectModel } from '@nestjs/mongoose';
import * as CircularJSON from 'circular-json';
import { PayAtFawryDto } from './dto/pay-at-fawry.dto';

@Injectable()
export class PaymentService extends BaseService<PaymentDoc> {
  constructor(
    @InjectModel(Payment.name) readonly m: Model<PaymentDoc>,
    private readonly configService: ConfigService,
  ) {
    super(m);
  }

  async FawryPay3DSCard(req: RequestWithUser, dto: PayAtFawryDto) {
    let total = 0;
    let totalItem = 0;
    console.log("item2");

    let merchantCode = this.configService.fawry.FAWRY_MERCHANT_CODE;
    let merchantRefNum = dto.merchantRefNum;
    // let merchant_cust_prof_id = req.user._id;
    let payment_method = "CARD";
    let amount = total.toFixed(2);
    console.log("amount", amount);

    let merchant_sec_key = this.configService.fawry.FAWRY_SECURITY_KEY;
    let returnUrl = "https://developer.fawrystaging.com";
    let cardNumber = dto.cardNumber;
    let cardExpiryYear = dto.cardExpiryYear;
    let cardExpiryMonth = dto.cardExpiryMonth;
    let cvv = dto.cvv;
    let signature_body;

    console.log(signature_body);

    for (const item in dto.chargeItems) {
      totalItem = dto.chargeItems[item].price * dto.chargeItems[item].quantity;
      total += totalItem;
      console.log( total,  totalItem);
      console.log(typeof total, typeof totalItem);
      signature_body = merchantCode.concat(
        merchantRefNum,
        '1212',
        payment_method,
        total.toFixed(2),
        cardNumber,
        cardExpiryYear,
        cardExpiryMonth,
        cvv,
        returnUrl,
        merchant_sec_key
      );
      let hash_signature = sha256.hex(signature_body);
      console.log(hash_signature, "s", signature_body);
      
      const result = await axios.post('https://atfawry.fawrystaging.com/ECommerceWeb/Fawry/payments/charge', {
        "merchantCode": merchantCode,
        "merchantRefNum": dto.merchantRefNum,
        "customerProfileId": "1212",
        "cardNumber": dto.cardNumber,
        "cardExpiryYear": dto.cardExpiryYear,
        "cardExpiryMonth": dto.cardExpiryMonth,
        "cvv": dto.cvv,
        //customerName: req.user.name,
        "customerMobile": req.user._id,
        "customerEmail": req.user.email,
        "paymentMethod": "CARD",
        "amount": total.toFixed(2),
        "currencyCode": dto.currencyCode,
        "description": dto.description,
        "language": dto.language,

        "chargeItems": [
          {
            "itemId": dto.chargeItems[item].itemId,
            "description": dto.chargeItems[item].description,
            "price": dto.chargeItems[item].price,
            "quantity": dto.chargeItems[item].quantity,
          }
        ],

        "enable3DS": true,
        "authCaptureModePayment": false,
        "returnUrl": "https://developer.fawrystaging.com",
        "signature": hash_signature

      })
      console.log("res", result);

      // totalItem = dto.chargeItems[item].price* dto.chargeItems[item].quantity;
      // total += totalItem;
      let str = CircularJSON.stringify(result.data);
      console.log(str, totalItem, total);

      return str;
    }
  }


}