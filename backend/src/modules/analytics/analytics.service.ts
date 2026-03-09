import {BadRequestException, Injectable} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';

@Injectable()
export class AnalyticsService {
    constructor(private prisma: PrismaService) {}

    async getFinancialDashboard() {
        // Agrégation des revenus (Paiements complétés)
        const revenueAggr = await this.prisma.payment.aggregate({
            _sum: { amount: true },
            where: { status: 'COMPLETED' },
        });

        // Agrégation des impayés
        const unpaidAggr = await this.prisma.payment.aggregate({
            _sum: { amount: true },
            where: { status: 'FAILED' },
        });

        // Liste des dernières factures pour le tableau
        const recentInvoices = await this.prisma.invoice.findMany({
            take: 5,
            orderBy: { issuedAt: 'desc' },
            include: {
                reservation: {
                    include: { user: true, payment: true }
                }
            }
        });

        return {
            kpis: {
                totalRevenue: revenueAggr._sum.amount || 0,
                unpaidAmount: unpaidAggr._sum.amount || 0,
                pendingCount: await this.prisma.payment.count({ where: { status: 'PENDING' } }),
            },
            recentInvoices: recentInvoices.map(inv => ({
                id: inv.invoiceNumber,
                clientName: `${inv.reservation.user.firstName} ${inv.reservation.user.lastName}`,
                date: inv.issuedAt,
                amount: inv.reservation.totalPrice,
                status: inv.reservation.payment?.status || 'UNKNOWN'
            }))
        };
    }

    async getComparativeData(room1Id: string, room2Id: string) {
        if (!room1Id || !room2Id) {
            throw new BadRequestException('Les IDs des deux salles à comparer sont requis.');
        }

        // 1. Récupération des infos de base des deux salles
        const [room1, room2] = await Promise.all([
            this.prisma.room.findUnique({ where: { id: room1Id } }),
            this.prisma.room.findUnique({ where: { id: room2Id } })
        ]);

        if (!room1 || !room2) throw new BadRequestException('Salles introuvables.');

        // 2. Définition de la fenêtre de temps (Les 6 derniers mois)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1); // On commence au 1er du mois
        sixMonthsAgo.setHours(0, 0, 0, 0);

        // 3. Récupération de TOUTES les réservations confirmées de ces deux salles sur la période
        const reservations = await this.prisma.reservation.findMany({
            where: {
                roomId: { in: [room1Id, room2Id] },
                status: 'CONFIRMED',
                startTime: { gte: sixMonthsAgo }
            },
            select: { roomId: true, startTime: true, duration: true, totalPrice: true }
        });

        // 4. Génération des labels des 6 derniers mois (ex: ['Oct', 'Nov', 'Déc', ...])
        const monthLabels: string[] = [];
        const revenueData1: number[] = [0, 0, 0, 0, 0, 0];
        const revenueData2: number[] = [0, 0, 0, 0, 0, 0];
        const hoursData1: number[] = [0, 0, 0, 0, 0, 0];
        const hoursData2: number[] = [0, 0, 0, 0, 0, 0];

        for (let i = 0; i < 6; i++) {
            const d = new Date(sixMonthsAgo);
            d.setMonth(d.getMonth() + i);
            monthLabels.push(d.toLocaleString('fr-FR', { month: 'short' })); // 'janv.', 'févr.'
        }

        // 5. Ventilation des données dans les tableaux mensuels
        reservations.forEach(res => {
            // Calcul de l'index du mois (0 à 5)
            const monthDiff = (res.startTime.getFullYear() - sixMonthsAgo.getFullYear()) * 12
                + res.startTime.getMonth() - sixMonthsAgo.getMonth();

            if (monthDiff >= 0 && monthDiff < 6) {
                if (res.roomId === room1Id) {
                    revenueData1[monthDiff] += Number(res.totalPrice);
                    hoursData1[monthDiff] += res.duration;
                } else {
                    revenueData2[monthDiff] += Number(res.totalPrice);
                    hoursData2[monthDiff] += res.duration;
                }
            }
        });

        // 6. Calcul des taux d'occupation (Exemple: On considère 200h ouvrées par mois max)
        const MAX_HOURS_PER_MONTH = 200;
        const occupancyData1 = hoursData1.map(h => Math.round((h / MAX_HOURS_PER_MONTH) * 100));
        const occupancyData2 = hoursData2.map(h => Math.round((h / MAX_HOURS_PER_MONTH) * 100));

        // 7. Calcul des statistiques pour le Radar (Popularité, Durée moy, Rentabilité)
        const totalRes1 = reservations.filter(r => r.roomId === room1Id).length;
        const totalRes2 = reservations.filter(r => r.roomId === room2Id).length;

        const avgDuration1 = totalRes1 ? hoursData1.reduce((a,b)=>a+b,0) / totalRes1 : 0;
        const avgDuration2 = totalRes2 ? hoursData2.reduce((a,b)=>a+b,0) / totalRes2 : 0;

        // 8. Calcul du créneau populaire (heure de début la plus fréquente)
        const popularSlot1 = this.calculatePopularTimeSlot(reservations.filter(r => r.roomId === room1Id));
        const popularSlot2 = this.calculatePopularTimeSlot(reservations.filter(r => r.roomId === room2Id));

        // 9. Calcul du taux d'occupation moyen (moyenne sur les 6 mois)
        const avgOccupancy1 = Math.round(occupancyData1.reduce((a,b)=>a+b,0) / 6);
        const avgOccupancy2 = Math.round(occupancyData2.reduce((a,b)=>a+b,0) / 6);

        const totalRevenue1 = revenueData1.reduce((a,b)=>a+b,0);
        const totalRevenue2 = revenueData2.reduce((a,b)=>a+b,0);

        // Format final attendu par notre frontend Angular (Chart.js)
        return {
            labels: monthLabels,
            datasets: [
                {
                    label: room1.name,
                    revenueData: revenueData1,
                    occupancyData: occupancyData1
                },
                {
                    label: room2.name,
                    revenueData: revenueData2,
                    occupancyData: occupancyData2
                }
            ],
            radar: {
                labels: ['POPULARITÉ (Nb Résas)', 'DURÉE MOY. (Heures)', 'RENTABILITÉ (€ total)', 'OCCUPATION MAX (%)'],
                petitFormat: [
                    totalRes1,
                    Math.round(avgDuration1),
                    totalRevenue1,
                    Math.max(...occupancyData1, 0)
                ],
                grandFormat: [
                    totalRes2,
                    Math.round(avgDuration2),
                    totalRevenue2,
                    Math.max(...occupancyData2, 0)
                ]
            },
            kpis: {
                room1: {
                    totalReservations: totalRes1,
                    totalRevenue: totalRevenue1,
                    avgOccupancy: avgOccupancy1,
                    popularTimeSlot: popularSlot1,
                },
                room2: {
                    totalReservations: totalRes2,
                    totalRevenue: totalRevenue2,
                    avgOccupancy: avgOccupancy2,
                    popularTimeSlot: popularSlot2,
                }
            }
        };
    }

    private calculatePopularTimeSlot(reservations: { startTime: Date; duration: number }[]): string {
        if (reservations.length === 0) return 'N/A';

        const hourCount: Record<number, number> = {};
        for (const res of reservations) {
            const hour = res.startTime.getHours();
            hourCount[hour] = (hourCount[hour] || 0) + 1;
        }

        const entries = Object.entries(hourCount);
        if (entries.length === 0) return 'N/A';

        const popularHour = entries.sort((a, b) => b[1] - a[1])[0][0];

        const start = parseInt(popularHour);
        const end = start + 2;
        return `${String(start).padStart(2, '0')}:00 - ${String(end).padStart(2, '0')}:00`;
    }

    async getDefaultRoomIds(): Promise<[string, string]> {
        const rooms = await this.prisma.room.findMany({
            where: { isActive: true },
            orderBy: { capacity: 'asc' },
            take: 2,
            select: { id: true }
        });

        if (rooms.length < 2) {
            throw new BadRequestException('Il faut au moins 2 salles actives pour la comparaison.');
        }

        return [rooms[0].id, rooms[1].id];
    }
}