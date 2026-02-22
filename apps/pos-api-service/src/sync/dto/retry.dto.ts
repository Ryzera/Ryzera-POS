import { IsUUID } from 'class-validator';

export class RetryDto {
  @IsUUID('all', { message: 'ID must be a valid UUID' })
  id: string;
}