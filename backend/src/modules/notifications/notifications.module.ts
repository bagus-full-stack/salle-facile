import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ReservationListener } from './reservation.listener';
import { AuthListener } from './auth.listener';

@Module({
    providers: [MailService, ReservationListener, AuthListener],
    exports: [MailService],
})
export class NotificationsModule {}
