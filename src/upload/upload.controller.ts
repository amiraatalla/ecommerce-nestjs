import { Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiConsumes, ApiTags, ApiBody } from '@nestjs/swagger';
import { AmazonS3FileInterceptor } from 'nestjs-multer-extended';
import { JwtAuthGuard } from '../auth/guards';

@Controller('upload')
@ApiTags('upload')
export class UploadController {
  // constructor(private readonly uploadService: UploadService) {}
  constructor() {}

  @Post()
  @ApiOperation({ summary: 'Upload file to s3' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File Upload',
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'file',
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    AmazonS3FileInterceptor('file', {
      randomFilename: true,
      fileFilter: undefined,
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  async uploadFile(@UploadedFile() file: any) {
    return { url: file.Location };
  }
}
