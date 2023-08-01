import { ModuleConfigFactory } from "@golevelup/nestjs-modules";
import { Injectable } from "@nestjs/common";
import { MailModuleOptions } from "libs/mail/src";
import { ConfigService } from "../config.service";

@Injectable()
export class MailModuleConfig implements ModuleConfigFactory<MailModuleOptions>{
 constructor(private readonly configService: ConfigService){}   

 createModuleConfig(): MailModuleOptions | Promise<MailModuleOptions> {
     return{
        gmail: this.configService.gmailFrom,
        password : this.configService.gmailPassword
     };
 }
}