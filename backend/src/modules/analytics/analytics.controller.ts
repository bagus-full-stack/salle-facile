import {Controller, Get, Query} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('admin/analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) {}

    @Get('dashboard')
    async getDashboard() {
        // Appelle la fonction qui agrège les données Prisma que nous avons codée précédemment
        return this.analyticsService.getFinancialDashboard();
    }

    @Get('compare')
    async getComparativeData(
        // On s'attend à recevoir http://localhost:3000/admin/analytics/compare?room1=ID_1&room2=ID_2
        @Query('room1') room1Id: string,
        @Query('room2') room2Id: string,
    ) {
        // Dans la vraie vie, tu pourrais mettre des ID par défaut si l'utilisateur
        // arrive sur la page sans avoir sélectionné de salles spécifiques.
        const defaultRoom1 = room1Id || "ID_DE_TA_SALLE_PETIT_FORMAT_EN_BDD";
        const defaultRoom2 = room2Id || "ID_DE_TA_SALLE_GRAND_FORMAT_EN_BDD";

        return this.analyticsService.getComparativeData(defaultRoom1, defaultRoom2);
    }
}