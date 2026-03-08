import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID, IsIn } from 'class-validator';

export class CreateReservationDto {
    @IsUUID()
    @IsNotEmpty()
    roomId: string;

    @IsDateString()
    @IsNotEmpty()
    startTime: string;

    @IsDateString()
    @IsNotEmpty()
    endTime: string;

    @IsString()
    @IsOptional()
    promoCode?: string;

    @IsString()
    @IsIn(['CREDIT_CARD', 'ONSITE'])
    paymentMethod: 'CREDIT_CARD' | 'ONSITE';

    @IsString()
    @IsOptional()
    notes?: string;
}