import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';

@Injectable()
export class RoomsService {
    constructor(private prisma: PrismaService) {}

    // ==========================================
    // 🔍 LECTURE & RECHERCHE (Catalogue)
    // ==========================================

    async findAll(category?: string, minCapacity?: string | number, search?: string) {
        const where: any = {};

        if (category) where.category = category;
        if (minCapacity) where.capacity = { gte: Number(minCapacity) };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        return this.prisma.room.findMany({
            where,
            orderBy: { name: 'asc' },
            include: {
                images: { orderBy: { isPrimary: 'desc' } },
                equipments: true
            }
        });
    }

    async findOne(id: string) {
        const room = await this.prisma.room.findUnique({
            where: { id },
            include: { images: true, equipments: true }
        });

        if (!room) throw new NotFoundException('Salle introuvable');
        return room;
    }

    // ⚡️ LA MÉTHODE SAUVÉE : Vérification des conflits pour le tunnel de réservation
    async getRoomAvailability(id: string, start: Date, end: Date) {
        // On cherche s'il existe une réservation confirmée ou en attente qui chevauche ce créneau
        const overlappingReservations = await this.prisma.reservation.findMany({
            where: {
                roomId: id,
                status: { in: ['CONFIRMED', 'PENDING'] },
                // La logique d'intersection : la résa existante commence AVANT la fin souhaitée,
                // ET elle se termine APRÈS le début souhaité.
                startTime: { lt: end },
                endTime: { gt: start },
            }
        });

        // Si le tableau est vide (length === 0), la salle est disponible
        return {
            available: overlappingReservations.length === 0,
            conflicts: overlappingReservations.length
        };
    }

    // ==========================================
    // ✍️ ÉCRITURE & GESTION DES FICHIERS (Admin)
    // ==========================================

    async createRoom(dto: any, files?: Array<Express.Multer.File>) {
        const roomData = {
            name: dto.name,
            description: dto.description,
            capacity: Number(dto.capacity),
            surfaceArea: Number(dto.surfaceArea), // 👈 AJOUT ICI
            category: dto.category,
            hourlyPrice: Number(dto.hourlyPrice),
            halfDayPrice: Number(dto.halfDayPrice), // 👈 AJOUT ICI
            fullDayPrice: Number(dto.fullDayPrice),
            isActive: dto.isActive === 'true' || dto.isActive === true,
        };

        // 2. Formatage des images
        const imagesData = this.formatImagesData(files);

        // 3. Sauvegarde en base avec Prisma
        return this.prisma.room.create({
            data: {
                ...roomData,
                images: imagesData.length > 0 ? { create: imagesData } : undefined
            },
            include: { images: true }
        });
    }

    async updateRoom(id: string, dto: any, files?: Array<Express.Multer.File>) {
        // Vérifier si la salle existe d'abord
        await this.findOne(id);

        // 1. Formatage sécurisé (ne met à jour que ce qui est fourni)
        const updateData: any = {};
        if (dto.name !== undefined) updateData.name = dto.name;
        if (dto.description !== undefined) updateData.description = dto.description;
        if (dto.capacity !== undefined) updateData.capacity = Number(dto.capacity);
        if (dto.category !== undefined) updateData.category = dto.category;
        if (dto.hourlyPrice !== undefined) updateData.hourlyPrice = Number(dto.hourlyPrice);
        if (dto.fullDayPrice !== undefined) updateData.fullDayPrice = Number(dto.fullDayPrice);

        if (dto.isActive !== undefined) {
            updateData.isActive = dto.isActive === 'true' || dto.isActive === true;
        }

        // 2. Formatage des nouvelles images éventuelles
        const imagesData = this.formatImagesData(files);

        // 3. Mise à jour transactionnelle
        return this.prisma.room.update({
            where: { id },
            data: {
                ...updateData,
                // Ajoute les nouvelles images aux anciennes
                images: imagesData.length > 0 ? { create: imagesData } : undefined
            },
            include: { images: true }
        });
    }

    // ==========================================
    // 🛠 UTILITAIRES
    // ==========================================

    private formatImagesData(files?: Array<Express.Multer.File>) {
        if (!files || files.length === 0) return [];

        return files.map((file, index) => ({
            url: `http://localhost:3000/uploads/rooms/${file.filename}`,
            isPrimary: index === 0 // La première image de l'upload devient la principale
        }));
    }
}