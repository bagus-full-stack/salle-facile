import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { AccountType } from '@prisma/client';

export class LoginDto {
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}

export class RegisterDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
    password: string;

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsEnum(AccountType)
    accountType: AccountType; // 'INDIVIDUAL' | 'PROFESSIONAL'

    @IsString()
    @IsOptional()
    companyName?: string;

    @IsString()
    @IsOptional()
    siret?: string;
}