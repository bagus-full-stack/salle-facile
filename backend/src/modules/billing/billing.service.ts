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
        doc.moveDown(2);

        doc.fontSize(14).text('Détails de la transaction', { underline: true });
        doc.moveDown(1);

        doc.fontSize(11);
        doc.text(`Reference : ${reservation.reference}`);
        doc.text(`Salle : ${reservation.room.name}`);
        
        const formatOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        doc.text(`Date de debut : ${reservation.startTime.toLocaleDateString('fr-FR', formatOptions)}`);
        doc.text(`Date de fin : ${reservation.endTime.toLocaleDateString('fr-FR', formatOptions)}`);
        
        const paymentMethod = reservation.payment?.method === 'CREDIT_CARD' ? 'Carte Bancaire' : 'Sur Place';
        const paymentStatus = reservation.payment?.status === 'COMPLETED' ? '(Paye)' : '(En attente)';
        doc.text(`Moyen de paiement : ${paymentMethod} ${paymentStatus}`);
        
        doc.moveDown(2);

        // Total
        doc.fontSize(16).text(`Montant total : ${reservation.totalPrice} euros`);

        doc.end();

        return pdfStream;
    }
}