import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { RoomCategory } from '@prisma/client';

export class CreateRoomDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsEnum(RoomCategory)
    category: RoomCategory;

    @Type(() => Number) // Transforme la string du FormData en nombre
    @IsNumber()
    @Min(1)
    capacity: number;

    @Type(() => Number)
    @IsNumber()
    @Min(1)
    surfaceArea: number;

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    hourlyPrice: number;

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    halfDayPrice: number;

    @Type(() => Number)
    @IsNumber()
    @Min(0)
    fullDayPrice: number;

    // Liste d'IDs d'équipements sous forme de string JSON (car on utilise FormData)
    @IsString()
    @IsOptional()
    equipmentIds?: string;
}