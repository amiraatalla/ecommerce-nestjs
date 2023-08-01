import { Injectable } from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import * as AWS from 'aws-sdk';

@Injectable()
export class UploadService {
    constructor(private readonly configService: ConfigService) {}
    /*
     * upload files to s3
     */
    async s3Upload(file, name) {
      const s3 = new AWS.S3({
        apiVersion: '2006-03-01',
        signatureVersion: 'v4',
      });
      const params = {
        Bucket: this.configService.aws.bucket,
        Key: String(name),
        Body: file,
      };
  
      try {
        const s3Response = await s3.upload(params).promise();
  
        console.log(s3Response);
        return s3Response;
      } catch (error) {
        throw new Error(error.message);
      }
    }
  }
  