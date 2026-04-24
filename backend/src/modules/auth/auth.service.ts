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

        // 3. Générer un code OTP aléatoire (6 chiffres)
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationCodeExpiry = new Date(Date.now() + 15 * 60 * 1000); // Expire dans 15 minutes

        // 4. Créer l'utilisateur INACTIF (en attente de vérification email)
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash: hashedPassword,
                firstName: dto.firstName,
                lastName: dto.lastName,
                accountType: dto.accountType,
                companyName: dto.accountType === 'PROFESSIONAL' ? dto.companyName : null,
                role: 'USER', // Rôle par défaut
                isActive: false, // 🔴 INACTIF jusqu'à vérification email
                isEmailVerified: false,
                verificationCode,
                verificationCodeExpiry,
            },
        });

        // 5. Émettre un événement pour envoyer l'email de vérification
        this.eventEmitter.emit('auth.email-verification', { user, code: verificationCode });

        // 6. Retourner un message pour indiquer à l'utilisateur de vérifier son email
        return {
            message: 'Compte créé avec succès. Vérifiez votre email pour activer votre compte.',
            email: user.email,
            requiresVerification: true,
        };
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
    // 📧 VÉRIFICATION D'EMAIL (OTP)
    // ==========================================

    async verifyEmail(email: string, code: string) {
        // 1. Trouver l'utilisateur par email
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new BadRequestException('Email introuvable.');
        }

        if (user.isEmailVerified) {
            throw new BadRequestException('Cet email a déjà été vérifié.');
        }

        // 2. Vérifier le code et sa date d'expiration
        if (user.verificationCode !== code) {
            throw new BadRequestException('Code de vérification incorrect.');
        }

        if (!user.verificationCodeExpiry || user.verificationCodeExpiry < new Date()) {
            throw new BadRequestException('Le code de vérification a expiré.');
        }

        // 3. Activer l'utilisateur et nettoyer le code
        const updatedUser = await this.prisma.user.update({
            where: { id: user.id },
            data: {
                isActive: true,
                isEmailVerified: true,
                verificationCode: null,
                verificationCodeExpiry: null,
            },
        });

        // 4. Émettre un événement de bienvenue
        this.eventEmitter.emit('auth.welcome', { user: updatedUser });

        // 5. Retourner le token JWT
        return this.generateToken(updatedUser);
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

    // ==========================================
    // 🔑 DUAL TOKEN GENERATION (Access + Refresh)
    // ==========================================

    private generateAccessToken(user: any): string {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            type: 'access'
        };

        console.log('[auth.service] Generating access token for user:', user.id);
        
        // Access Token: 15 minutes (short-lived)
        return this.jwtService.sign(payload, {
            expiresIn: '15m'
        });
    }

    private generateRefreshToken(user: any): string {
        const payload = {
            sub: user.id,
            type: 'refresh'
        };

        console.log('[auth.service] Generating refresh token for user:', user.id);
        
        // Refresh Token: 7 days (long-lived)
        return this.jwtService.sign(payload, {
            expiresIn: '7d'
        });
    }

    private generateToken(user: any) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            type: 'access'
        };

        // Pour backward compatibility, retourner aussi access_token seul
        console.log('[auth.service] Generating token for user:', user.id);
        
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

    // ✅ PHASE 3 : Refresh token for authenticated user
    async refreshTokenForUser(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user || !user.isActive) {
            throw new UnauthorizedException('Utilisateur non trouvé ou compte désactivé.');
        }

        console.log('[auth.service] Generating new token for user:', userId);
        return this.generateToken(user);
    }
}