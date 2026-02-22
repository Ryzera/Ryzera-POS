import { IsString, IsOptional } from 'class-validator';

export class SettingDto {
  @IsString()
  value: string;

  @IsOptional()
  @IsString()
  description?: string;
}