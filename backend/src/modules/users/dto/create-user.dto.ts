import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { AccountType, Role } from '@prisma/client';

export class CreateUserDto {
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
    accountType: AccountType;

    @IsOptional()
    @IsString()
    companyName?: string;

    @IsOptional()
    @IsString()
    siret?: string;

    @IsEnum(Role)
    role: Role;
}
