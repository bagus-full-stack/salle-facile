import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';
import {CreateRoomDto} from "./dto/create-room.dto";
import {RoomCategory} from "@prisma/client";

@Injectable()
export class RoomsService {
    constructor(private prisma: PrismaService) {}

    async getRoomById(id: string) {
        // Requête Prisma pour récupérer la salle avec ses images et équipements
        const room = await this.prisma.room.findUnique({
            where: { id },
            include: {
                images: true,
                equipments: true,
            },
        });

        if (!room) {
            throw new NotFoundException(`La salle avec l'ID ${id} est introuvable.`);
        }

        return room;
    }

    async getRoomAvailability(roomId: string, startDate: Date, endDate: Date) {
        // On cherche les réservations qui se chevauchent avec la période demandée
        const reservations = await this.prisma.reservation.findMany({
            where: {
                roomId,
                status: { in: ['CONFIRMED', 'PENDING'] }, // On ignore les annulées
                startTime: { lte: endDate },
                endTime: { gte: startDate },
            },
            select: {
                startTime: true,
                endTime: true,
            },
        });

        return reservations; // Renvoie les créneaux indisponibles
    }

    async createRoom(dto: CreateRoomDto, files: Express.Multer.File[]) {
        // 1. Parsing des équipements (depuis le FormData)
        const equipmentIdsArray: string[] = dto.equipmentIds ? JSON.parse(dto.equipmentIds) : [];

        // 2. Traitement des images (Simulation d'upload S3 / Stockage local)
        // Dans la vraie vie, on uploaderait les buffers vers AWS S3 ou Google Cloud Storage ici
        const uploadedImages = files.map((file, index) => ({
            url: `/uploads/${Date.now()}-${file.originalname}`, // Lien fictif de stockage
            isPrimary: index === 0, // La première image devient la miniature principale
        }));

        // 3. Création transactionnelle dans Prisma
        const newRoom = await this.prisma.room.create({
            data: {
                name: dto.name,
                description: dto.description,
                category: dto.category,
                capacity: dto.capacity,
                surfaceArea: dto.surfaceArea,
                hourlyPrice: dto.hourlyPrice,
                halfDayPrice: dto.halfDayPrice,
                fullDayPrice: dto.fullDayPrice,

                // Connexion aux équipements existants
                equipments: {
                    connect: equipmentIdsArray.map(id => ({ id })),
                },

                // Création des images liées
                images: {
                    create: uploadedImages,
                }
            },
            include: {
                images: true,
                equipments: true,
            }
        });

        return newRoom;
    }

    // async findAll(category?: RoomCategory, minCapacity?: number) {
    //     // On construit dynamiquement l'objet de filtre
    //     const whereClause: any = {
    //         isActive: true, // On ne montre que les salles actives au public
    //     };
    //
    //     if (category) {
    //         whereClause.category = category;
    //     }
    //
    //     if (minCapacity) {
    //         whereClause.capacity = { gte: Number(minCapacity) }; // gte = Greater Than or Equal
    //     }
    //
    //     // Requête optimisée : on ne ramène que l'image principale pour la liste
    //     return this.prisma.room.findMany({
    //         where: whereClause,
    //         include: {
    //             images: {
    //                 where: { isPrimary: true },
    //                 take: 1
    //             },
    //             equipments: {
    //                 take: 3 // On limite à 3 équipements max pour les badges de la carte
    //             }
    //         },
    //         orderBy: { createdAt: 'desc' },
    //         take: 6 // On limite à 6 salles pour la page d'accueil
    //     });
    // }

    async findAll(category?: RoomCategory, minCapacity?: number, search?: string) {
        const where: any = { isActive: true };

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
            include: { images: { where: { isPrimary: true } } }
        });
    }
}