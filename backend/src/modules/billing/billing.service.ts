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

        const pdfStream = new PassThrough();
        const doc = new PDFDocument({ margin: 50, size: 'A4' });

        doc.pipe(pdfStream);

        const primaryColor = '#2b5e6e';
        const secondaryColor = '#1da1f2';
        const textColor = '#374151';
        const lightGray = '#9ca3af';

        // Header
        doc.font('Helvetica-Bold').fontSize(24).fillColor(primaryColor).text('Salle', 50, 50, { continued: true }).fillColor(secondaryColor).text('Facile.', { continued: true }).fillColor(primaryColor).text(' ');
        
        doc.fontSize(10).fillColor(lightGray).font('Helvetica-Bold').text(reservation.reference, 50, 80);

        doc.font('Helvetica').fontSize(28).fillColor('#e5e7eb').text('REÇU', 300, 50, { align: 'right' });
        
        const formatOptionsDate: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
        const createdAtStr = reservation.createdAt.toLocaleDateString('fr-FR', formatOptionsDate).toUpperCase();
        doc.fontSize(10).fillColor(lightGray).text(`ÉMIS LE ${createdAtStr}`, 300, 85, { align: 'right' });

        // Addresses
        let y = 140;
        doc.font('Helvetica-Bold').fontSize(10).fillColor(lightGray).text('DE', 50, y);
        doc.text('FACTURÉ À', 300, y, { align: 'right' });
        y += 15;
        doc.font('Helvetica-Bold').fontSize(12).fillColor(textColor).text('SalleFacile Inc.', 50, y);
        doc.text(`${reservation.user.firstName} ${reservation.user.lastName}`, 300, y, { align: 'right' });
        y += 15;
        doc.font('Helvetica').fontSize(10).fillColor(lightGray).text('12 Rue de la Paix', 50, y);
        doc.text(reservation.user?.email || '', 300, y, { align: 'right' });
        y += 15;
        doc.text('75002 Paris, France', 50, y);

        // Table Header
        y = 250;
        doc.font('Helvetica').fontSize(11).fillColor(lightGray).text('Description', 50, y);
        doc.text('Qté', 400, y, { width: 50, align: 'center' });
        doc.text('Total', 450, y, { align: 'right' });
        
        y += 20;
        doc.moveTo(50, y).lineTo(545, y).lineWidth(1).strokeColor('#f3f4f6').dash(1, { space: 0 }).stroke();
        y += 15;

        // Table Row
        doc.font('Helvetica-Bold').fontSize(11).fillColor(textColor).text(`Location Salle "${reservation.room.name}"`, 50, y);
        doc.font('Helvetica').text('1', 400, y, { width: 50, align: 'center' });
        doc.text(`${reservation.totalPrice} €`, 450, y, { align: 'right' });
        
        y += 15;
        const dtOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        doc.fontSize(10).fillColor(lightGray).text(`Du ${reservation.startTime.toLocaleDateString('fr-FR', dtOptions)}`, 50, y);
        y += 12;
        doc.text(`Au ${reservation.endTime.toLocaleDateString('fr-FR', dtOptions)}`, 50, y);

        y += 30;
        doc.moveTo(50, y).lineTo(545, y).lineWidth(1).strokeColor('#f3f4f6').dash(1, { space: 0 }).stroke();
        y += 15;

        // Totals & Payment Method
        const paymentMethod = reservation.payment?.method === 'CREDIT_CARD' ? 'Carte Bancaire' : 'Sur Place';
        const paymentStatus = reservation.payment?.status === 'COMPLETED' ? 'Payé' : 'En attente';

        doc.font('Helvetica-Bold').fontSize(8).fillColor(lightGray).text('MOYEN DE PAIEMENT', 50, y);
        doc.font('Helvetica-Bold').fontSize(10).fillColor(textColor).text(paymentMethod, 50, y + 12, { continued: true });
        
        if (paymentStatus === 'Payé') {
            doc.font('Helvetica').fillColor('#22c55e').text(` (${paymentStatus})`);
        } else {
            doc.font('Helvetica').fillColor('#f97316').text(` (${paymentStatus})`);
        }

        doc.font('Helvetica').fontSize(10).fillColor(lightGray).text('Sous-total', 350, y);
        doc.text(`${reservation.totalPrice} €`, 450, y, { align: 'right' });
        doc.text('TVA (20%)', 350, y + 15);
        doc.text('Inclus', 450, y + 15, { align: 'right' });

        y += 35;
        doc.moveTo(350, y).lineTo(545, y).lineWidth(1).strokeColor('#f3f4f6').dash(1, { space: 0 }).stroke();
        y += 10;

        doc.font('Helvetica-Bold').fontSize(12).fillColor(textColor).text('Total Payé', 350, y);
        doc.fontSize(14).fillColor(secondaryColor).text(`${reservation.totalPrice} €`, 450, y - 1, { align: 'right' });

        // Footer
        doc.moveTo(50, 740).lineTo(545, 740).lineWidth(1).strokeColor('#e5e7eb').dash(5, { space: 5 }).stroke();
        // Restore solid lines just in case
        doc.undash();
        doc.font('Helvetica').fontSize(9).fillColor(lightGray).text('Merci de votre confiance. Ce document vaut preuve de paiement.', 50, 755, { align: 'center' });

        doc.end();

        return pdfStream;
    }
}