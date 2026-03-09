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
        let roomId1 = room1Id;
        let roomId2 = room2Id;

        if (!roomId1 || !roomId2) {
            const [defaultRoomId1, defaultRoomId2] = await this.analyticsService.getDefaultRoomIds();
            roomId1 = roomId1 || defaultRoomId1;
            roomId2 = roomId2 || defaultRoomId2;
        }

        return this.analyticsService.getComparativeData(roomId1, roomId2);
    }
}