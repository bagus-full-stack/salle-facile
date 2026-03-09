import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-linkedin-oauth2';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LinkedinStrategy extends PassportStrategy(Strategy, 'linkedin') {
    constructor(private authService: AuthService) {
        super({
            clientID: process.env.LINKEDIN_CLIENT_ID || 'TON_CLIENT_ID',
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET || 'TON_SECRET',
            callbackURL: 'http://localhost:3000/auth/linkedin/callback',
            scope: ['r_emailaddress', 'r_liteprofile'],
            state: true, // ⚡️ Requis par LinkedIn pour la sécurité
        } as any);
    }

    // Cette méthode est appelée par Passport une fois que LinkedIn nous renvoie l'utilisateur avec succès
    async validate(accessToken: string, refreshToken: string, profile: any, done: any): Promise<any> {
        try {
            // On envoie le profil brut à notre AuthService qui va faire le travail (créer le compte ou connecter l'existant)
            const jwtData = await this.authService.validateOAuthLogin(profile, 'linkedin');

            // On passe le JWT généré au contrôleur
            done(null, jwtData);
        } catch (err) {
            done(err, false);
        }
    }
}