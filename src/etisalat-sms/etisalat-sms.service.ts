import { BadRequestException, Injectable } from "@nestjs/common";
import { Model, Types } from "mongoose";
import axios from "axios";
import https from "https";
import axiosRetry from 'axios-retry';
// import * as rp from 'request-promise';
import { RequestWithUser } from "src/core/interfaces";
import { BaseService } from "src/core/shared";
import { InjectModel } from "@nestjs/mongoose";
import * as CircularJSON from "circular-json";
import { EtisalatSMS, EtisalatSMSDoc } from "./entities/etisalat-sms.entity";
import { CreateEtisalatSMS } from "./dto/etisalat-sms.dto";
import { MessageTypeEnum } from "./enums/message-type.enum";
import { Characteristic } from "./dto/characteristic.dto";

@Injectable()
export class EtisalatSMSService extends BaseService<EtisalatSMSDoc> {
  constructor(
    @InjectModel(EtisalatSMS.name) readonly m: Model<EtisalatSMSDoc>,
  ) {
    super(m);
  }

  private hashedAuthorization(token: string) {
    return Buffer.from(token).toString('base64');
  }
  private isPattern(id: string) {
    const regex = new RegExp("^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$");
    const isValidId = regex.test(id);
    return isValidId
  }
  private header() {
    let encodedToken = this.hashedAuthorization('BuybyApp:BuybyApp123');
    let headers = {
      'Authorization': 'Basic ' + encodedToken,
      'x-Gateway-APIKey': 'f59a29c8-45fd-4b76-a1e2-cc910959eb01',
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    return headers;
  }
  private reciverInfo(dto: CreateEtisalatSMS) {
    let phoneNumber, receiverData = {}, receiver = [];
    for (const recive in dto.receiver) {
      phoneNumber = dto.receiver[recive].phoneNumber
      receiverData = {
        phoneNumber: phoneNumber
      }
      receiver.push(receiverData);
    }
    return receiver;
  }
  private characteristicInfo(dto: CreateEtisalatSMS) {
    let name, value, characteristicData = {}, characteristic = [];
    for (const charact in dto.characteristic) {
      name = dto.characteristic[charact].name
      value = dto.characteristic[charact].value
      characteristicData = {
        name: dto.characteristic[charact].name,
        value: dto.characteristic[charact].value
      }
      characteristic.push(characteristicData);
    }
    return characteristic;
  }
  async EtisalatSMS(req: RequestWithUser, dto: CreateEtisalatSMS) {

    let phoneNumber, name, value,  headers, receiver , characteristic;

    let url = "https://api.etisalat.com.eg:8443/communicationManagement/v1/sendSms";
    let validId = this.isPattern(dto.id)  
    if (validId == false) throw new BadRequestException("id must match ([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}) patern example 52248aec-022c-6d53-eabe-306d53eabe30")
    headers = this.header();
    receiver = this.reciverInfo (dto);
    characteristic = this.characteristicInfo(dto);

    let payload = {
      id: dto.id,
      messageType: dto.messageType,
      characteristic: characteristic,
      receiver: receiver
    };


    console.log("p", payload , headers);

    try {
      axiosRetry(axios, {
        retries: 3,
        shouldResetTimeout: true,
        retryCondition: (_error) => true // retry no matter what
      });

      let res = await axios({
        method: 'post',
        url: url,
        timeout: 30000, //optional
        data: payload,
        headers: headers
      });

      console.log("res", res);

      let str = CircularJSON.stringify(res.data);

      return str;
    } catch (error) {
      console.log(error.response, error.code); // this is the main part. Use the response property from the error object
      if (error.code === 'ECONNABORTED')
        return 'timeout';
      else
        throw error;
    }
  }

 
}









