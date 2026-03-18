import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from '../notifications/mail.service';

@Injectable()
export class AuthListener {
    constructor(private mailService: MailService) {}

    @OnEvent('auth.password-reset', { async: true })
    handlePasswordResetEvent(payload: { user: any; token: string }) {
        this.mailService.sendPasswordResetLink(payload.user, payload.token);
    }
}

