import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    // Créer un nouvel utilisateur (Admin)
    async createUser(dto: CreateUserDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email }
        });

        if (existingUser) {
            throw new ConflictException('Cet email est déjà utilisé.');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        return this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash: hashedPassword,
                firstName: dto.firstName,
                lastName: dto.lastName,
                role: dto.role,
                isActive: true,
                accountType: dto.accountType,
                companyName: dto.accountType === 'PROFESSIONAL' ? dto.companyName : null,
                siret: dto.accountType === 'PROFESSIONAL' ? dto.siret : null,
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                createdAt: true
            }
        });
    }

    // Mettre à jour les informations d'un utilisateur (Admin)
    async updateUser(adminId: string, targetUserId: string, dto: UpdateUserDto) {
        const user = await this.prisma.user.findUnique({ where: { id: targetUserId } });
        if (!user) throw new NotFoundException("Utilisateur introuvable.");

        // Si l'admin modifie son propre rôle, on bloque
        if (adminId === targetUserId && dto.role && dto.role !== user.role) {
            throw new BadRequestException("Vous ne pouvez pas modifier votre propre rôle.");
        }

        const dataToUpdate: any = {
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            role: dto.role,
            accountType: dto.accountType,
            companyName: dto.accountType === 'PROFESSIONAL' ? dto.companyName : null,
            siret: dto.accountType === 'PROFESSIONAL' ? dto.siret : null
        };

        if (dto.password) {
            dataToUpdate.passwordHash = await bcrypt.hash(dto.password, 10);
        }

        // On nettoie les undefined
        Object.keys(dataToUpdate).forEach(key => dataToUpdate[key] === undefined && delete dataToUpdate[key]);

        return this.prisma.user.update({
            where: { id: targetUserId },
            data: dataToUpdate,
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                isActive: true, // Needed for frontend update
                accountType: true,
                companyName: true,
                siret: true,
                createdAt: true
            }
        });
    }

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
                siret: true,
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

    // Supprimer un utilisateur
    async deleteUser(adminId: string, targetUserId: string) {
        if (adminId === targetUserId) {
            throw new BadRequestException("Vous ne pouvez pas supprimer votre propre compte.");
        }

        const user = await this.prisma.user.findUnique({ where: { id: targetUserId }, include: { reservations: true } });
        if (!user) throw new NotFoundException("Utilisateur introuvable.");

        // Empêcher la suppression si l'utilisateur a des réservations (sécurité DB)
        if (user.reservations.length > 0) {
            throw new BadRequestException("Impossible de supprimer cet utilisateur : il possède des réservations.");
        }

        return this.prisma.user.delete({
            where: { id: targetUserId }
        });
    }
}