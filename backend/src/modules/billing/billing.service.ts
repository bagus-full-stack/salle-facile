import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';
// import * as PDFDocument from 'pdfkit';
import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';

@Injectable()
export class BillingService {
    constructor(private prisma: PrismaService) {}

    async generateReceiptPdf(reservationId: string): Promise<PassThrough> {
        const reservation = await this.prisma.reservation.findUnique({
            where: { id: reservationId },
            include: { user: true, room: true, payment: true },
        });

        if (!reservation) {
            throw new NotFoundException('Réservation introuvable.');
        }

        // Création d'un flux (stream) pour envoyer le PDF au client sans le stocker sur le disque
        const pdfStream = new PassThrough();
        const doc = new PDFDocument({ margin: 50 });

        doc.pipe(pdfStream);

        // En-tête du reçu
        doc.fontSize(20).text('SalleFacile', { align: 'left' });
        doc.fontSize(10).text('REÇU', { align: 'right' });
        doc.text(reservation.reference, { align: 'right' });
        doc.moveDown();

        // Informations Facturation
        doc.text(`Facturé à : ${reservation.user.firstName} ${reservation.user.lastName}`);
        doc.text(`Date : ${reservation.createdAt.toLocaleDateString('fr-FR')}`);
        doc.moveDown(2);

        // Lignes de la commande
        doc.text(`Description : Location ${reservation.room.name}`);
        doc.text(`Durée : ${reservation.duration} heures`);
        doc.moveDown();

        // Total
        doc.fontSize(14).text(`Total Payé : ${reservation.totalPrice} €`, { align: 'right' });

        doc.end();

        return pdfStream;
    }
}