import {Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, UploadedFiles, UseInterceptors} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import {FilesInterceptor} from "@nestjs/platform-express";
import {CreateRoomDto} from "./dto/create-room.dto";
import {RoomCategory} from "@prisma/client";

@Controller('rooms')
export class RoomsController {
    constructor(private readonly roomsService: RoomsService) {}

    // ⚡️ LA ROUTE DE RECHERCHE : GET /rooms?category=MEETING&minCapacity=10
    @Get()
    async getRooms(
        @Query('category') category?: RoomCategory,
        @Query('minCapacity') minCapacity?: number,
    ) {
        return this.roomsService.findAll(category, minCapacity);
    }

    // Utilisation de ParseUUIDPipe (fourni par NestJS) qui agit comme validateur
    @Get(':id')
    async getRoomDetails(@Param('id', ParseUUIDPipe) id: string) {
        return this.roomsService.getRoomById(id);
    }

    @Get(':id/availability')
    async getAvailability(
        @Param('id', ParseUUIDPipe) id: string,
        @Query('start') start: string,
        @Query('end') end: string,
    ) {
        return this.roomsService.getRoomAvailability(id, new Date(start), new Date(end));
    }

    @Post()
    @UseInterceptors(FilesInterceptor('images', 5)) // Limite à 5 fichiers max
    async create(
        @Body() createRoomDto: CreateRoomDto,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        return this.roomsService.createRoom(createRoomDto, files);
    }
}