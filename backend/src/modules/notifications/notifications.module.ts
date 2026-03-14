import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ReservationListener } from './reservation.listener';

@Module({
    providers: [MailService, ReservationListener],
    exports: [MailService],
})
export class NotificationsModule {}

