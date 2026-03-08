import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    // Récupérer tous les utilisateurs (avec le compte de leurs réservations)
    async getAllUsers() {
        return this.prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                accountType: true,
                companyName: true,
                role: true,
                isActive: true,
                createdAt: true,
                _count: {
                    select: { reservations: true } // Ramène le nombre de réservations par utilisateur
                }
            }
        });
    }

    // Changer le rôle d'un utilisateur
    async updateUserRole(adminId: string, targetUserId: string, newRole: Role) {
        if (adminId === targetUserId) {
            throw new BadRequestException("Vous ne pouvez pas modifier votre propre rôle.");
        }

        const user = await this.prisma.user.findUnique({ where: { id: targetUserId } });
        if (!user) throw new NotFoundException("Utilisateur introuvable.");

        return this.prisma.user.update({
            where: { id: targetUserId },
            data: { role: newRole }
        });
    }

    // Activer / Désactiver un compte (Bannissement temporaire)
    async toggleUserStatus(adminId: string, targetUserId: string) {
        if (adminId === targetUserId) {
            throw new BadRequestException("Vous ne pouvez pas désactiver votre propre compte.");
        }

        const user = await this.prisma.user.findUnique({ where: { id: targetUserId } });
        if (!user) throw new NotFoundException("Utilisateur introuvable.");

        return this.prisma.user.update({
            where: { id: targetUserId },
            data: { isActive: !user.isActive } // Inverse le statut actuel
        });
    }
}