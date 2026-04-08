import { IsString, IsNotEmpty, IsInt, IsOptional, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBranchDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    code: string;

    @Type(() => Number)
    @IsInt()
    company_id: number;

    @IsOptional() @IsString() address?: string;
    @IsOptional() @IsString() city?: string;
    @IsOptional() @IsString() phone?: string;
    @IsOptional() @IsEmail()  email?: string;
}