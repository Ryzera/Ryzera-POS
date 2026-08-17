import { IsNumber, IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

/**
 * Class-validator DTO for Push Sync requests.
 * Ensures every incoming sync payload is complete and valid,
 * adhering to the NestJS standard across all team modules.
 */
export class PushSyncDto {
  @IsOptional()
  @IsNumber()
  companyId?: number | null;

  @IsOptional()
  @IsNumber()
  branchId?: number | null;

  @IsString()
  @IsNotEmpty({ message: 'Entity is required' })
  entity: string;

  @IsObject()
  @IsNotEmpty({ message: 'Payload cannot be empty' })
  payload: Record<string, any>;
}
