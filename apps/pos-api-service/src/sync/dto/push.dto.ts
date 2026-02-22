import { IsString, IsIn, IsOptional, IsObject } from 'class-validator';

export class PushDto {
  @IsString()
  @IsIn(['product', 'sale', 'user', 'inventory'], { 
    message: 'Entity must be product, sale, user, or inventory' 
  })
  entity: string;

  @IsOptional()
  @IsObject()
  payload?: Record<string, any>;
}