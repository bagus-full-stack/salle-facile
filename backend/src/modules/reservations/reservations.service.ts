import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ReservationsService {
    constructor(
        private prisma: PrismaService,
        private eventEmitter: EventEmitter2 // Injecté pour gérer les emails en tâche de fond
    ) {}

    // ==========================================
    // 🟢 MÉTHODES UTILISATEURS (Front-Office)
    // ==========================================

    async createReservation(userId: string, dto: CreateReservationDto) {
        const { roomId, startTime, endTime, paymentMethod, notes } = dto;
        const start = new Date(startTime);
        const end = new Date(endTime);

        // 1. Double vérification anti-conflit (Sécurité critique)
        const conflict = await this.prisma.reservation.findFirst({
            where: {
                roomId,
                status: { in: ['CONFIRMED', 'PENDING', 'BLOCKED'] },
                startTime: { lt: end },
                endTime: { gt: start },
            },
        });

        if (conflict) {
            throw new ConflictException('Ce créneau n\'est plus disponible.');
        }

        // 2. Calcul des prix
        const room = await this.prisma.room.findUnique({ where: { id: roomId } });
        if (!room) {
            throw new NotFoundException('Salle introuvable.');
        }

        const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        let remainingHoursForCalc = durationHours;
        
        let fullDaysCost = 0;
        let halfDaysCost = 0;
        let hoursCost = 0;

        const fullDayPrice = Number(room.fullDayPrice);
        const halfDayPrice = Number(room.halfDayPrice);
        const hourlyPrice = Number(room.hourlyPrice);

        // 1. Journées complètes (>= 8h)
        while (remainingHoursForCalc >= 8) {
            fullDaysCost += fullDayPrice;
            remainingHoursForCalc -= 8;
        }

        // 2. Demi-journées (>= 4h)
        if (remainingHoursForCalc >= 4) {
            halfDaysCost += halfDayPrice;
            remainingHoursForCalc -= 4;
        }

        // 3. Heures restantes (< 4h)
        if (remainingHoursForCalc > 0) {
            hoursCost += remainingHoursForCalc * hourlyPrice;
        }

        // Optimisations (plafonnement)
        if (hoursCost > halfDayPrice) {
            halfDaysCost += halfDayPrice;
            hoursCost = 0;
        }

        if ((halfDaysCost + hoursCost) > fullDayPrice) {
            fullDaysCost += fullDayPrice;
            halfDaysCost = 0;
            hoursCost = 0;
        }

        const totalPrice = fullDaysCost + halfDaysCost + hoursCost;

        // 3. Création transactionnelle (Réservation + Paiement)
        const result = await this.prisma.$transaction(async (tx) => {
            const reservation = await tx.reservation.create({
                data: {
                    reference: `#SF-${Date.now()}`,
                    userId,
                    roomId,
                    startTime: start,
                    endTime: end,
                    duration: durationHours,
                    subtotal: totalPrice,
                    taxAmount: totalPrice * 0.20,
                    totalPrice: totalPrice * 1.20,
                    status: paymentMethod === 'CREDIT_CARD' ? 'CONFIRMED' : 'PENDING',
                    notes,
                },
            });

            await tx.payment.create({
                data: {
                    reservationId: reservation.id,
                    amount: reservation.totalPrice,
                    method: paymentMethod,
                    status: paymentMethod === 'CREDIT_CARD' ? 'COMPLETED' : 'PENDING',
                },
            });

            return reservation;
        });

        // 4. Récupération de l'utilisateur pour l'email
        const user = await this.prisma.user.findUnique({ where: { id: userId } });

        // 5. Déclenchement de l'événement (Envoi de l'email en tâche de fond)
        this.eventEmitter.emit('reservation.created', {
            user,
            reservation: result,
            room,
        });

        return result;
    }

    async getUserReservations(userId: string) {
        return this.prisma.reservation.findMany({
            where: { userId },
            orderBy: { startTime: 'desc' },
            include: {
                room: { select: { name: true } },
                payment: { select: { status: true } }
            }
        });
    }

    async getReservationById(reservationId: string, userId: string) {
        const reservation = await this.prisma.reservation.findUnique({
            where: { id: reservationId },
            include: {
                user: { select: { email: true } },
                room: { select: { name: true } },
                payment: { select: { method: true, status: true } }
            }
        });

        if (!reservation || reservation.userId !== userId) {
            throw new NotFoundException("Réservation introuvable ou accès refusé.");
        }

        return reservation;
    }

    async cancelReservation(reservationId: string, userId: string) {
        const reservation = await this.prisma.reservation.findUnique({
            where: { id: reservationId }
        });

        if (!reservation || reservation.userId !== userId) {
            throw new NotFoundException("Réservation introuvable ou accès refusé.");
        }

        // ⚡️ Règle des 24 heures
        const now = new Date();
        const hoursDifference = (reservation.startTime.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (hoursDifference < 24) {
            throw new BadRequestException("Les annulations directes sont désactivées à moins de 24h de l'événement.");
        }

        // Annulation
        const updatedReservation = await this.prisma.reservation.update({
            where: { id: reservationId },
            data: { status: 'CANCELLED' }
        });

        // Envoi de l'email d'annulation
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        this.eventEmitter.emit('reservation.cancelled', {
            user,
            reservation: updatedReservation
        });

        return updatedReservation;
    }


    // ==========================================
    // 🔴 MÉTHODES ADMIN (Back-Office)
    // ==========================================

    async getAllReservationsForAdmin() {
        return this.prisma.reservation.findMany({
            orderBy: { startTime: 'desc' }, // Les plus récentes en premier
            include: {
                user: {
                    select: { firstName: true, lastName: true, email: true }
                },
                room: {
                    select: { name: true }
                },
                payment: {
                    select: { status: true, amount: true, method: true }
                }
            }
        });
    }

    async adminForceCancel(reservationId: string) {
        // L'Admin bypasse la règle des 24h
        const reservation = await this.prisma.reservation.findUnique({
            where: { id: reservationId },
            include: { payment: true, user: true }
        });

        if (!reservation) {
            throw new NotFoundException("Réservation introuvable.");
        }

        // On annule la réservation directement
        const updatedReservation = await this.prisma.reservation.update({
            where: { id: reservationId },
            data: { status: 'CANCELLED' }
        });

        // Gestion du remboursement si la commande était déjà payée
        if (reservation.payment && reservation.payment.status === 'COMPLETED') {
            // (Ici tu pourrais faire un appel API Stripe pour recréditer la CB du client)

            await this.prisma.payment.update({
                where: { reservationId: reservation.id },
                data: { status: 'REFUNDED' }
            });
        }

        // On avertit le client de cette annulation forcée
        this.eventEmitter.emit('reservation.cancelled', {
            user: reservation.user,
            reservation: updatedReservation
        });

        return updatedReservation;
    }

    // 👑 ADMIN : Récupérer la timeline d'une journée spécifique
    async getDailyTimeline(dateString: string) {
        // 1. Définir le début et la fin de la journée demandée
        const targetDate = new Date(dateString);
        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

        // 2. Récupérer TOUTES les salles avec leurs réservations actives du jour
        return this.prisma.room.findMany({
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                capacity: true,
                category: true,
                reservations: {
                    where: {
                        status: { in: ['CONFIRMED', 'PENDING'] },
                        // La réservation chevauche cette journée :
                        startTime: { lt: endOfDay },
                        endTime: { gt: startOfDay }
                    },
                    select: {
                        id: true,
                        reference: true,
                        startTime: true,
                        endTime: true,
                        status: true,
                        user: { select: { firstName: true, lastName: true } }
                    }
                }
            }
        });
    }
}