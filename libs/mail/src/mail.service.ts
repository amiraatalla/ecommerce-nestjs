import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import { EmailRequest, EmailResponse } from './interfaces';

const FAILED_TO_SEND_EMAIL_EXCEPTION = 'Failed to send email';
@Injectable()
export class MailService {
  constructor(private readonly configService: ConfigService) { }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  private getTransporter() {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.gmailFrom,
        pass: this.configService.gmailPassword,
      },
    });
  }

  async sendForgotPasswordMail(email: string, token: string): Promise<EmailResponse> {
    const response: EmailResponse = { status: 'success', error: null };
    const mailOptions = {
      from: this.configService.gmailFrom, // sender address
      to: email, // list of receivers
      subject: 'Password Reset', // Subject line
      html: `<p>${token} is your reset password code for BuyBy</p>`, // plain text body
    };

    try {
      await this.getTransporter().sendMail(mailOptions);
    } catch (error) {
      response.status = 'failed';
      if (error.response) {
        response.error = error.response.body;
      } else {
        response.error = error.toString();
      }
    }

    return response;
  }

  async sendSignUpMail(
    email: string,
    token: string,
  ): Promise<EmailResponse> {
    const transporter = this.getTransporter();
    const response: EmailResponse = { status: 'success', error: null };
    const mailOptions = {
      from: this.configService.gmailFrom, // sender address
      to: email, // list of receivers
      subject: 'Email Verification', // Subject line
      html: `Dear ${email},
        <br>
      Thanks for registering at BuyBy. ${token} 
      is your verification code for BuyBy
      <br>
      Best Regards ”`,
    };

    try {
      await this.getTransporter().sendMail(mailOptions);
    } catch (error) {
      response.status = 'failed';
      if (error.response) {
        response.error = error.response.body;
      } else {
        response.error = error.toString();
      }
    }

    return response;

  }

  async sendReVerifyMail(
    email: string,
    token: string,
  ): Promise<EmailResponse> {
    const transporter = this.getTransporter();
    const response: EmailResponse = { status: 'success', error: null };
    const mailOptions = {
      from: this.configService.gmailFrom, // sender address
      to: email, // list of receivers
      subject: 'Email ReVerification', // Subject line
      html: `Dear ${email},
        <br>
      Thanks for registering at BuyBy. ${token} 
      is your reverification code for BuyBy
      <br>
      Best Regards ”`,
    };

    try {
      await this.getTransporter().sendMail(mailOptions);
    } catch (error) {
      response.status = 'failed';
      if (error.response) {
        response.error = error.response.body;
      } else {
        response.error = error.toString();
      }
    }

    return response;
  }


  async sendQuotationMail(
    email: string,
    sheet: any,
    // itemsList: Array<Object>,
  ): Promise<EmailResponse> {
    const transporter = this.getTransporter();
    const response: EmailResponse = { status: 'success', error: null };
    const mailOptions = {
      from: this.configService.gmailFrom, // sender address
      to: email, // list of receivers
      subject: 'Email Quotation', // Subject line
      html: `Dear ${email},
        <br>
        This is a list of new items and their prices. 
        <br>
        ${sheet} 
      <br>
      Best Regards ”`,
    };

    try {
      await this.getTransporter().sendMail(mailOptions);
    } catch (error) {
      response.status = 'failed';
      if (error.response) {
        response.error = error.response.body;
      } else {
        response.error = error.toString();
      }
    }

    return response;
  }




  /**
 * Send new email via nodemailer using payload
 * @param {EmailRequest} emailObject creation payload
 * @return {Promise<EmailResponse>}
 */
  public async sendEmail(emailObject: EmailRequest): Promise<EmailResponse> {
    const response: EmailResponse = { status: 'success', error: null };
    try {
      emailObject.from = 'Food2Bits <shaimaa.mahmoud@pharaohsoft.com>';

      //only for development
      let getTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: this.configService.gmailFrom,
          pass: this.configService.gmailPassword,
        },
      });
      getTransporter.sendMail(emailObject);
    } catch (error) {
      response.status = 'failed';
      if (error.response) {
        response.error = error.response.body;
      } else {
        response.error = error.toString();
      }
    }

    return response;
  }

}
