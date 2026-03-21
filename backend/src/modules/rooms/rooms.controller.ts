import {
    Controller, Get, Post, Patch, Param, Body, Query,
    UseInterceptors, UploadedFiles, ParseUUIDPipe, UseGuards, Req
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { RoomsService } from './rooms.service';
import { RoomCategory, Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

// Configuration pour sauvegarder les images sur le disque dur
const multerOptions = {
    storage: diskStorage({
        destination: './uploads/rooms',
        filename: (req, file, callback) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            callback(null, `room-${uniqueSuffix}${ext}`);
        }
    }),
    fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
            return callback(new Error('Seules les images sont autorisées'), false);
        }
        callback(null, true);
    }
};

@Controller('rooms')
export class RoomsController {
    constructor(private readonly roomsService: RoomsService) {}

    // ==========================================
    // 🔍 ROUTES PUBLIQUES (Catalogue & Recherche)
    // ==========================================

    @Get()
    async getRooms(
        @Query('category') category?: RoomCategory,
        @Query('minCapacity') minCapacity?: string,
        @Query('search') search?: string // 👈 Le nouveau paramètre de la barre de recherche
    ) {
        return this.roomsService.findAll(category, minCapacity, search);
    }

    @Get('admin/equipments')
    async getEquipments() {
        return this.roomsService.getEquipments();
    }

    // 📅 Endpoint pour le calendrier (DOIT ÊTRE AVANT :id)
    @Get(':id/schedule')
    async getRoomSchedule(
        @Param('id', ParseUUIDPipe) id: string,
        @Query('start') start: string,
        @Query('end') end: string,
    ) {
        return this.roomsService.getRoomReservations(id, new Date(start), new Date(end));
    }

    // ⚡️ LA ROUTE SAUVÉE : Indispensable pour le tunnel de réservation
    @Get(':id/availability')
    async getAvailability(
        @Param('id', ParseUUIDPipe) id: string,
        @Query('start') start: string,
        @Query('end') end: string,
    ) {
        return this.roomsService.getRoomAvailability(id, new Date(start), new Date(end));
    }

    @Get(':id')
    async getRoomDetails(@Param('id', ParseUUIDPipe) id: string) {
        return this.roomsService.findOne(id);
    }


    // ==========================================
    // 👑 ROUTES ADMIN (Création & Édition)
    // ==========================================


    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.SUPER_ADMIN, Role.MANAGER)
    @UseInterceptors(FilesInterceptor('images', 10, multerOptions))
    async create(
        @Body() dto: any, // 'any' car FormData envoie tout sous forme de string
        @UploadedFiles() files: Array<Express.Multer.File>
    ) {
        return this.roomsService.createRoom(dto, files);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.SUPER_ADMIN, Role.MANAGER)
    @UseInterceptors(FilesInterceptor('images', 10, multerOptions))
    async updateRoom(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: any,
        @UploadedFiles() files?: Array<Express.Multer.File>,
        @Req() req?: any
    ) {
        console.log(`[UPDATE Room ${id}] Headers:`, req?.headers);
        console.log(`[UPDATE Room ${id}] DTO:`, JSON.stringify(dto));
        console.log(`[UPDATE Room ${id}] Files:`, files?.length);
        return this.roomsService.updateRoom(id, dto, files);
    }
}