import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../shared/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private eventEmitter: EventEmitter2
    ) {}

    // ==========================================
    // 🔐 INSCRIPTION & CONNEXION
    // ==========================================

    async register(dto: RegisterDto) {
        // 1. Vérifier si l'email existe déjà
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (existingUser) {
            throw new ConflictException('Cet email est déjà utilisé.');
        }

        // 2. Hacher le mot de passe
        const hashedPassword = await bcrypt.hash(dto.password, 10);

        // 3. Créer l'utilisateur
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash: hashedPassword,
                firstName: dto.firstName,
                lastName: dto.lastName,
                accountType: dto.accountType,
                companyName: dto.accountType === 'PROFESSIONAL' ? dto.companyName : null,
                role: 'USER', // Rôle par défaut
                isActive: true,
            },
        });

        // 4. Envoyer l'email de bienvenue via un événement
        this.eventEmitter.emit('auth.welcome', { user });

        // 5. Retourner le token directement après l'inscription
        return this.generateToken(user);
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (!user || !user.isActive) {
            throw new UnauthorizedException('Identifiants invalides ou compte désactivé.');
        }

        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Identifiants invalides.');
        }

        return this.generateToken(user);
    }

    // ==========================================
    // 🔑 RÉINITIALISATION DE MOT DE PASSE
    // ==========================================

    async forgotPassword(email: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });

        // Pour des raisons de sécurité, on ne dit pas si l'email existe ou non
        if (!user) return { message: "Si cet email existe, un lien de réinitialisation a été envoyé." };

        // Génération d'un token aléatoire sécurisé
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiry = new Date(Date.now() + 3600000); // Expire dans 1 heure (3600000 ms)

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry: expiry
            },
        });

        // Déclencher l'envoi de l'email de réinitialisation
        this.eventEmitter.emit('auth.password-reset', { user, token: resetToken });

        return { message: "Si cet email existe, un lien de réinitialisation a été envoyé." };
    }

    async resetPassword(token: string, newPassword: string) {
        // Trouver l'utilisateur avec le token valide et non expiré
        const user = await this.prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: { gte: new Date() }
            },
        });

        if (!user) {
            throw new BadRequestException('Le jeton de réinitialisation est invalide ou a expiré.');
        }

        // Hacher le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Mettre à jour et supprimer le token
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });

        return { message: "Votre mot de passe a été mis à jour avec succès." };
    }

    // ==========================================
    // 🛠 UTILITAIRES
    // ==========================================

    private generateToken(user: any) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                accountType: user.accountType
            }
        };
    }

    async validateOAuthLogin(profile: any, provider: 'google' | 'linkedin') {
        const email = profile.emails[0].value;

        // 1. Cherche si l'utilisateur existe déjà
        let user = await this.prisma.user.findUnique({ where: { email } });

        // 2. S'il n'existe pas, on le crée automatiquement
        if (!user) {
            // On génère un mot de passe aléatoire très complexe car il ne s'en servira pas
            const randomPassword = require('crypto').randomBytes(16).toString('hex');
            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            user = await this.prisma.user.create({
                data: {
                    email,
                    passwordHash: hashedPassword,
                    firstName: profile.name?.givenName || profile.displayName.split(' ')[0],
                    lastName: profile.name?.familyName || profile.displayName.split(' ')[1] || '',
                    accountType: 'INDIVIDUAL', // Par défaut
                    role: 'USER',
                    isActive: true,
                },
            });

            // (Optionnel) Émettre l'événement de bienvenue
            this.eventEmitter.emit('auth.welcome', { user });
        }

        // 3. On génère le même JWT que pour une connexion classique
        return this.generateToken(user);
    }
}