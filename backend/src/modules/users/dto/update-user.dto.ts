import { IsEnum, IsNotEmpty, IsOptional, IsString, IsEmail } from 'class-validator';
import { Role, AccountType } from '@prisma/client';

export class UpdateRoleDto {
    @IsEnum(Role)
    @IsNotEmpty()
    role: Role;
}

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsEmail()
    email?: string;
    
    @IsOptional()
    @IsString()
    password?: string;

    @IsOptional()
    @IsEnum(Role)
    role?: Role;

    @IsOptional()
    @IsEnum(AccountType)
    accountType?: AccountType;

    @IsOptional()
    @IsString()
    companyName?: string;

    @IsOptional()
    @IsString()
    siret?: string;
}
