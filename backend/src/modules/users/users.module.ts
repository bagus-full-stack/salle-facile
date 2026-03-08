import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { SharedModule } from '../../shared/shared.module'; // 👈 Importe ton module contenant PrismaService

@Module({
    imports: [SharedModule], // Permet au UsersService d'utiliser PrismaService
    controllers: [UsersController], // Déclare les routes (GET /admin/users, etc.)
    providers: [UsersService], // Déclare la logique métier
    exports: [UsersService], // Optionnel : Permet à d'autres modules d'utiliser UsersService si besoin plus tard
})
export class UsersModule {}