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

    // ⚡️ LA MÉTHODE SAUVE : Vérification des conflits pour le tunnel de réservation
    async getRoomAvailability(id: string, start: Date, end: Date) {
        // On cherche s'il existe une réservation confirmée ou en attente qui chevauche ce créneau
        const overlappingReservations = await this.prisma.reservation.findMany({
            where: {
                roomId: id,
                status: { in: ['CONFIRMED', 'PENDING', 'BLOCKED'] },
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

    // Récupérer les réservations pour le calendrier
    async getRoomReservations(id: string, start: Date, end: Date) {
        return this.prisma.reservation.findMany({
            where: {
                roomId: id,
                status: { in: ['CONFIRMED', 'PENDING', 'BLOCKED'] },
                startTime: { lt: end },
                endTime: { gt: start },
            },
            select: {
                id: true,
                startTime: true,
                endTime: true,
                status: true
            }
        });
    }

    // Get all available equipments
    async getEquipments() {
        return this.prisma.equipment.findMany({
            select: {
                id: true,
                name: true,
                iconRef: true
            }
        });
    }

    // ==========================================
    // ✍️ ÉCRITURE & GESTION DES FICHIERS (Admin)
    // ==========================================

    async createRoom(dto: any, files?: Array<Express.Multer.File>) {
        const roomData = {
            name: dto.name,
            description: dto.description,
            capacity: Number(dto.capacity),
            surfaceArea: Number(dto.surfaceArea),
            category: dto.category,
            hourlyPrice: Number(dto.hourlyPrice),
            halfDayPrice: dto.halfDayPrice ? Number(dto.halfDayPrice) : 0,
            fullDayPrice: Number(dto.fullDayPrice),
            isActive: dto.isActive === 'true' || dto.isActive === true,
        };

        // Gestion des équipements
        let equipmentIds: string[] = [];
        if (dto.equipments) {
            // Normalise en tableau si c'est une string unique ou JSON
            if (typeof dto.equipments === 'string') {
                 try {
                     // Cas où c'est un JSON stringifié "[id1, id2]"
                     if (dto.equipments.startsWith('[')) {
                         equipmentIds = JSON.parse(dto.equipments);
                     } else {
                         equipmentIds = [dto.equipments];
                     }
                 } catch (e) {
                     equipmentIds = [dto.equipments];
                 }
            } else if (Array.isArray(dto.equipments)) {
                equipmentIds = dto.equipments;
            }
        }

        // Vérifier que les équipements existent avant de les connecter
        let validEquipmentIds: string[] = [];
        if (equipmentIds.length > 0) {
            const existingEquipments = await this.prisma.equipment.findMany({
                where: { id: { in: equipmentIds } },
                select: { id: true }
            });
            validEquipmentIds = existingEquipments.map(e => e.id);
        }

        // 2. Formatage des images
        const imagesData = this.formatImagesData(files);

        // 3. Sauvegarde en base avec Prisma
        return this.prisma.room.create({
            data: {
                ...roomData,
                images: imagesData.length > 0 ? { create: imagesData } : undefined,
                equipments: validEquipmentIds.length > 0 ? { 
                    connect: validEquipmentIds.map(id => ({ id })) 
                } : undefined
            },
            include: { images: true, equipments: true }
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
        if (dto.surfaceArea !== undefined) updateData.surfaceArea = Number(dto.surfaceArea);
        if (dto.category !== undefined) updateData.category = dto.category;
        
        if (dto.hourlyPrice !== undefined) updateData.hourlyPrice = Number(dto.hourlyPrice);
        if (dto.halfDayPrice !== undefined) updateData.halfDayPrice = Number(dto.halfDayPrice);
        if (dto.fullDayPrice !== undefined) updateData.fullDayPrice = Number(dto.fullDayPrice);

        if (dto.isActive !== undefined) {
            updateData.isActive = dto.isActive === 'true' || dto.isActive === true;
        }

        // Gestion des équipements (mise à jour complète de la liste)
        if (dto.equipments !== undefined) {
             let equipmentIds: string[] = [];
             if (typeof dto.equipments === 'string') {
                 try {
                     if (dto.equipments.startsWith('[')) {
                         equipmentIds = JSON.parse(dto.equipments);
                     } else if (dto.equipments === "") {
                         equipmentIds = [];
                     } else {
                         equipmentIds = [dto.equipments];
                     }
                 } catch (e) {
                     equipmentIds = [dto.equipments];
                 }
            } else if (Array.isArray(dto.equipments)) {
                equipmentIds = dto.equipments;
            } else if (dto.equipments === null) {
                equipmentIds = [];
            }
            
            // On utilise 'set' pour remplacer la sélection actuelle par la nouvelle
            updateData.equipments = { set: equipmentIds.map(id => ({ id })) };
        }

        // 2. Formatage des nouvelles images éventuelles
        const imagesData = this.formatImagesData(files);

        // 3. Mise à jour transactionnelle
        const dataToUpdate: any = {
            ...updateData
        };

        // Ajoute les images seulement s'il y en a de nouvelles
        if (imagesData.length > 0) {
            dataToUpdate.images = { create: imagesData };
        }

        return this.prisma.room.update({
            where: { id },
            data: dataToUpdate,
            include: { images: true, equipments: true }
        });
    }

    // Bloquer une salle (Admin)
    async blockRoom(id: string, start: Date, end: Date, reason: string, adminUserId: string) {
        // Vérifier si la salle existe
        await this.findOne(id);

        const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

        return this.prisma.reservation.create({
            data: {
                reference: `#BLK-${Date.now()}`,
                roomId: id,
                userId: adminUserId,
                startTime: start,
                endTime: end,
                status: 'BLOCKED',
                notes: reason,
                duration: duration,
                subtotal: 0,
                taxAmount: 0,
                totalPrice: 0, 
            }
        });
    }

    // ==========================================
    // 🛠 UTILITAIRES
    // ==========================================

    private formatImagesData(files?: Array<Express.Multer.File>) {
        if (!files || files.length === 0) return [];

        return files.map((file, index) => ({
            url: `/uploads/rooms/${file.filename}`,
            isPrimary: index === 0 // La première image de l'upload devient la principale
        }));
    }
}