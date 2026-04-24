import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from './mail.service';

@Injectable()
export class AuthListener {
    constructor(private mailService: MailService) {}

    // Écoute l'événement 'auth.email-verification'
    @OnEvent('auth.email-verification', { async: true })
    handleEmailVerificationEvent(payload: { user: any; code: string }) {
        this.mailService.sendVerificationEmail(payload.user, payload.code);
    }

    // Écoute l'événement 'auth.welcome'
    @OnEvent('auth.welcome', { async: true })
    handleWelcomeEvent(payload: { user: any }) {
        this.mailService.sendWelcomeEmail(payload.user);
    }

    // Écoute l'événement 'auth.password-reset'
    @OnEvent('auth.password-reset', { async: true })
    handlePasswordResetEvent(payload: { user: any; token: string }) {
        this.mailService.sendPasswordResetLink(payload.user, payload.token);
    }
}

