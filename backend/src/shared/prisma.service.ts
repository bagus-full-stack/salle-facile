import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {

    // S'exécute au démarrage de l'application NestJS
    async onModuleInit() {
        await this.$connect();
        // Optionnel : Tu pourrais ajouter ici des middlewares Prisma
        // (ex: pour hasher automatiquement les mots de passe avant l'insertion)
    }

    // S'exécute quand l'application s'éteint (Ctrl+C)
    async onModuleDestroy() {
        await this.$disconnect();
    }
}