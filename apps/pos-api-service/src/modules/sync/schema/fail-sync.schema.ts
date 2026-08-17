import { IsString, IsNotEmpty } from 'class-validator';

export class FailSyncDto {
  @IsString()
  @IsNotEmpty({ message: 'Error message is required' })
  errorMessage: string;
}
