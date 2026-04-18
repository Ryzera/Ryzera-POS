import { IsString, IsEmail, IsOptional, IsInt } from 'class-validator';

export class RegisterDto {
    @IsString()
    username: string;

    @IsString()
    password: string;

    @IsOptional()
    @IsString()
    role?: string;

    @IsInt()
    company_id: number;

    @IsInt()
    branch_id: number;

    @IsOptional()
    @IsString()
    user_type?: string;

    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    phone?: string;
}