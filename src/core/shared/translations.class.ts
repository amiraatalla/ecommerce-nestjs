import { IsOptional, IsString } from 'class-validator';

export class Translations {
  @IsOptional()
  @IsString()
  mainLanguage?: string;
  @IsOptional()
  @IsString()
  secondLanguage?: string;
  @IsOptional()
  @IsString()
  thirdLanguage?: string;
}
