import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);

    constructor(private mailerService: MailerService) {}

    async sendReservationConfirmation(user: any, reservation: any, room: any) {
        try {
            await this.mailerService.sendMail({
                to: user.email,
                subject: `Confirmation de réservation - ${room.name} 🏢`,
                template: './confirmation', // Cherche le fichier confirmation.hbs
                context: {
                    // Variables injectées dans le template HTML
                    firstName: user.firstName,
                    roomName: room.name,
                    reference: reservation.reference,
                    date: reservation.startTime.toLocaleDateString('fr-FR'),
                    time: reservation.startTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                    price: reservation.totalPrice,
                },
            });
            this.logger.log(`Email de confirmation envoyé à ${user.email}`);
        } catch (error) {
            this.logger.error(`Erreur lors de l'envoi de l'email à ${user.email}`, error);
        }
    }

    async sendCancellationNotice(user: any, reservation: any) {
        try {
            await this.mailerService.sendMail({
                to: user.email,
                subject: `Annulation de votre réservation ${reservation.reference} ❌`,
                template: './cancellation',
                context: {
                    firstName: user.firstName,
                    reference: reservation.reference,
                },
            });
            this.logger.log(`Email d'annulation envoyé à ${user.email}`);
        } catch (error) {
            this.logger.error(`Erreur d'envoi d'email d'annulation`, error);
        }
    }

    async sendPasswordResetLink(user: any, token: string) {
        const resetLink = `http://localhost:4200/reset-password?token=${token}`;
        try {
            await this.mailerService.sendMail({
                to: user.email,
                subject: `Réinitialisation de votre mot de passe 🔒`,
                template: './reset-password', // Créez ce template .hbs
                context: {
                    firstName: user.firstName,
                    resetLink: resetLink,
                },
            });
            this.logger.log(`Email de réinitialisation envoyé à ${user.email}`);
        } catch (error) {
            this.logger.error(`Erreur lors de l'envoi de l'email de réinitialisation`, error);
        }
    }
}