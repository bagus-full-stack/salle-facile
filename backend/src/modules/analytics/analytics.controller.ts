import {Controller, Get, Query, BadRequestException, UseGuards} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) {}

    @Get('dashboard')
    @Roles(Role.SUPER_ADMIN, Role.MANAGER)
    async getDashboard() {
        // Appelle la fonction qui agrège les données Prisma que nous avons codée précédemment
        return this.analyticsService.getFinancialDashboard();
    }

    @Get('general')
    @Roles(Role.SUPER_ADMIN, Role.MANAGER)
    async getGeneralDashboard() {
        return this.analyticsService.getGeneralDashboard();
    }

    @Get('compare')
    @Roles(Role.SUPER_ADMIN, Role.MANAGER)
    async getComparativeData(
        // On s'attend à recevoir http://localhost:3000/admin/analytics/compare?room1=ID_1&room2=ID_2
        @Query('room1') room1Id: string,
        @Query('room2') room2Id: string,
    ) {
        if (!room1Id || !room2Id) {
            throw new BadRequestException("Les paramètres 'room1' et 'room2' sont requis pour la comparaison.");
        }

        return this.analyticsService.getComparativeData(room1Id, room2Id);
    }
}