import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from './mail.service';

@Injectable()
export class ReservationListener {
    constructor(private mailService: MailService) {}

    // Écoute l'événement 'reservation.created'
    @OnEvent('reservation.created', { async: true })
    handleReservationCreatedEvent(payload: { user: any; reservation: any; room: any }) {
        // Cette fonction s'exécute en tâche de fond
        this.mailService.sendReservationConfirmation(payload.user, payload.reservation, payload.room);
    }

    // Écoute l'événement 'reservation.cancelled'
    @OnEvent('reservation.cancelled', { async: true })
    handleReservationCancelledEvent(payload: { user: any; reservation: any }) {
        this.mailService.sendCancellationNotice(payload.user, payload.reservation);
    }
}