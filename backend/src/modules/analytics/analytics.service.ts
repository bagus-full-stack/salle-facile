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
                    revenueData1.reduce((a,b)=>a+b,0),
                    Math.max(...occupancyData1, 0)
                ],
                grandFormat: [
                    totalRes2,
                    Math.round(avgDuration2),
                    revenueData2.reduce((a,b)=>a+b,0),
                    Math.max(...occupancyData2, 0)
                ]
            }
        };
    }

    async getGeneralDashboard() {
        // Obtenir la fentre pour ce mois et le mois prcdent
        const now = new Date();
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        
        // --- 1. KPIs ---
        // Salles
        const totalRooms = await this.prisma.room.count();
        const activeRooms = await this.prisma.room.count({ where: { isActive: true } });

        // Utilisateurs (Nouveaux)
        const newUsersThisMonth = await this.prisma.user.count({ where: { createdAt: { gte: startOfThisMonth } } });
        const newUsersLastMonth = await this.prisma.user.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfThisMonth } } });

        // Rservations 
        const resThisMonth = await this.prisma.reservation.count({ where: { startTime: { gte: startOfThisMonth }, status: 'CONFIRMED' } });
        const resLastMonth = await this.prisma.reservation.count({ where: { startTime: { gte: startOfLastMonth, lt: startOfThisMonth }, status: 'CONFIRMED' } });

        // Revenus
        const revThisMonthAggr = await this.prisma.payment.aggregate({
            _sum: { amount: true },
            where: { status: 'COMPLETED', createdAt: { gte: startOfThisMonth } },
        });
        const revLastMonthAggr = await this.prisma.payment.aggregate({
            _sum: { amount: true },
            where: { status: 'COMPLETED', createdAt: { gte: startOfLastMonth, lt: startOfThisMonth } },
        });

        const revThisMonth = Number(revThisMonthAggr._sum.amount || 0);
        const revLastMonth = Number(revLastMonthAggr._sum.amount || 0);

        // Variations en pourcentage
        const calcVar = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return ((current - previous) / previous) * 100;
        };

        const resVar = calcVar(resThisMonth, resLastMonth);
        const revVar = calcVar(revThisMonth, revLastMonth);
        const usersVar = calcVar(newUsersThisMonth, newUsersLastMonth);

        // --- 2. Graphes des 6 derniers mois (Toutes les salles confondues) ---
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const reservations = await this.prisma.reservation.findMany({
            where: {
                status: 'CONFIRMED',
                startTime: { gte: sixMonthsAgo }
            },
            select: { startTime: true, duration: true, totalPrice: true }
        });

        const monthLabels: string[] = [];
        const monthlyRevenues: number[] = [0, 0, 0, 0, 0, 0];
        const monthlyHours: number[] = [0, 0, 0, 0, 0, 0];

        for (let i = 0; i < 6; i++) {
            const d = new Date(sixMonthsAgo);
            d.setMonth(d.getMonth() + i);
            monthLabels.push(d.toLocaleString('fr-FR', { month: 'short' }).replace('.', '')); 
        }

        reservations.forEach(res => {
            const monthDiff = (res.startTime.getFullYear() - sixMonthsAgo.getFullYear()) * 12
                + res.startTime.getMonth() - sixMonthsAgo.getMonth();

            if (monthDiff >= 0 && monthDiff < 6) {
                monthlyRevenues[monthDiff] += Number(res.totalPrice);
                monthlyHours[monthDiff] += res.duration;
            }
        });

        const maxHoursPerRoom = 200; 
        const totalMaxHours = Math.max(activeRooms * maxHoursPerRoom, 1);
        const monthlyOccupancy = monthlyHours.map(h => Math.min(Math.round((h / totalMaxHours) * 100), 100));

        // --- 3. Table KPIs Detail (Ce mois vs mois prcedent) ---
        // (Pour simplifier on renvoie juste les chiffres du mois actuel et l'evolution)
        const avgOccThisMonth = monthlyOccupancy[5] || 0;
        const avgOccLastMonth = monthlyOccupancy[4] || 0;
        const occVar = avgOccThisMonth - avgOccLastMonth;

        return {
            summary: {
                reservations: { value: resThisMonth, variation: Math.round(resVar) },
                revenue: { value: revThisMonth, variation: Math.round(revVar) },
                newUsers: { value: newUsersThisMonth, variation: Math.round(usersVar) },
                rooms: { active: activeRooms, total: totalRooms }
            },
            charts: {
                labels: monthLabels,
                revenues: monthlyRevenues,
                occupancy: monthlyOccupancy
            },
            radar: {
                // Rempli avec des valeurs simules ou drives globales pour l'Analyse Globale
                labels: ['POPULARIT', 'DURE MOY.', 'RENTABILIT', 'VOLUME (Rsas)', 'NOTE CLIENT'],
                data: [
                   Math.min(resThisMonth * 5, 100), 
                   70, 
                   Math.min(revThisMonth / 100, 100) || 50, 
                   60, 
                   92 // 92% moyenne de satisfaction
                ]
            },
            detailedKpis: {
                thisMonth: {
                    reservations: resThisMonth,
                    revenue: revThisMonth,
                    occupancy: avgOccThisMonth,
                    popularSlot: '14:00 - 16:00' // Idalement  calculer
                },
                lastMonth: {
                    reservations: resLastMonth,
                    revenue: revLastMonth,
                    occupancy: avgOccLastMonth,
                    popularSlot: '09:00 - 12:00'
                },
                variations: {
                    reservations: calcVar(resThisMonth, resLastMonth).toFixed(1),
                    revenue: calcVar(revThisMonth, revLastMonth).toFixed(1),
                    occupancy: occVar
                }
            }
        };
    }
}