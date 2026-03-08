import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { SharedModule } from '../../shared/shared.module'; // Contient ton PrismaService

@Module({
    imports: [
        SharedModule,
        PassportModule,
        // Configuration du générateur de Token
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'MA_CLE_SECRETE_TRES_COMPLEXE_A_CHANGER_EN_PROD',
            signOptions: { expiresIn: '1d' }, // Le token expire au bout de 24 heures
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy], // 👈 On n'oublie pas de déclarer la JwtStrategy !
    exports: [AuthService],
})
export class AuthModule {}