import { Controller, Get, Param, Res, ParseUUIDPipe } from '@nestjs/common';
import type { Response } from 'express';
import { BillingService } from './billing.service';

@Controller('billing')
export class BillingController {
    constructor(private readonly billingService: BillingService) {}

    @Get(':reservationId/receipt')
    async downloadReceipt(
        @Param('reservationId', ParseUUIDPipe) id: string,
        @Res() res: Response, // On utilise l'objet Response d'Express pour manipuler les headers
    ) {
        const pdfStream = await this.billingService.generateReceiptPdf(id);

        // On indique au navigateur qu'il s'agit d'un fichier à télécharger
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="recu-${id}.pdf"`,
        });

        // On connecte le flux du PDF à la réponse HTTP
        pdfStream.pipe(res);
    }
}