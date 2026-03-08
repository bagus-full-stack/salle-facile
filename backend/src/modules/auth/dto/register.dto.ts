import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { AccountType } from '@prisma/client';

export class RegisterDto {
    @IsEmail({}, { message: 'Veuillez fournir une adresse email valide' })
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
    password: string;

    @IsString()
    @IsNotEmpty({ message: 'Le prénom est obligatoire' })
    firstName: string;

    @IsString()
    @IsNotEmpty({ message: 'Le nom est obligatoire' })
    lastName: string;

    @IsEnum(AccountType, { message: 'Type de compte invalide' })
    @IsNotEmpty()
    accountType: AccountType; // 'INDIVIDUAL' ou 'PROFESSIONAL'

    @IsString()
    @IsOptional()
    companyName?: string;

    @IsString()
    @IsOptional()
    siret?: string;
}