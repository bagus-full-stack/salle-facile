import {Controller, Post, Get, Patch, Param, Body, ParseUUIDPipe, UseGuards, Req, Query} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('reservations')
export class ReservationsController {
    constructor(private readonly reservationsService: ReservationsService) {}

    // ⚡️ VRAIE VIE : Création d'une réservation
    @UseGuards(JwtAuthGuard) // 👈 Bloque si non connecté
    @Post()
    async createReservation(@Req() req, @Body() dto: CreateReservationDto) {
        // req.user est injecté par le JwtStrategy. "sub" contient le VRAI ID (UUID) du client.
        const realUserId = req.user.sub;
        return this.reservationsService.createReservation(realUserId, dto);
    }

    // ⚡️ VRAIE VIE : Historique client
    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getMyReservations(@Req() req) {
        const realUserId = req.user.sub;
        return this.reservationsService.getUserReservations(realUserId);
    }

    // ⚡️ VRAIE VIE : Détail d'une réservation (pour la page de succès)
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async getReservation(@Req() req, @Param('id', ParseUUIDPipe) reservationId: string) {
        const realUserId = req.user.sub;
        return this.reservationsService.getReservationById(reservationId, realUserId);
    }

    // ⚡️ VRAIE VIE : Annulation par le client
    @UseGuards(JwtAuthGuard)
    @Patch(':id/cancel')
    async cancel(@Req() req, @Param('id', ParseUUIDPipe) reservationId: string) {
        const realUserId = req.user.sub;
        return this.reservationsService.cancelReservation(reservationId, realUserId);
    }

    // ==========================================
    // 👑 ROUTES ADMIN (Bypass les IDs clients)
    // ==========================================
    // Note: Idéalement à protéger avec un @UseGuards(JwtAuthGuard, AdminGuard)

    @Get('admin/all')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.SUPER_ADMIN, Role.MANAGER, Role.STAFF)
    async getAllForAdmin() {
        return this.reservationsService.getAllReservationsForAdmin();
    }

    @Patch('admin/:id/force-cancel')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.SUPER_ADMIN, Role.MANAGER)
    async forceCancel(@Param('id', ParseUUIDPipe) reservationId: string) {
        return this.reservationsService.adminForceCancel(reservationId);
    }

    @Get('admin/timeline')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.SUPER_ADMIN, Role.MANAGER, Role.STAFF)
    async getTimeline(@Query('date') date: string) {
        // Si aucune date n'est fournie, on prend aujourd'hui
        const targetDate = date ? date : new Date().toISOString();
        return this.reservationsService.getDailyTimeline(targetDate);
    }
}